import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SegormerMultithreadFeedDemo() {
  const cores = Math.min(navigator.hardwareConcurrency || 4, 8);
  const [ready, setReady] = useState(false);
  let [running, setRunning] = useState(false);
  const [last, setLast] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maskRef = useRef<HTMLImageElement>(null);
  const workers = useRef<{ w: Worker; busy: boolean }[]>([]);
  const times = useRef<number[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number>(null);
  const interval = useRef(1000 / cores);

  const toURL = (bm: ImageBitmap) => {
    const c = document.createElement("canvas");
    c.width = bm.width;
    c.height = bm.height;
    c.getContext("2d")!.drawImage(bm, 0, 0);
    return c.toDataURL();
  };

  useEffect(() => {
    workers.current = Array.from({ length: cores }, () => {
      const w = new Worker(new URL("./segformerWorker.ts", import.meta.url), {
        type: "module",
      });
      // We could use some server worker to cache the onnx file - but again, this is just an experiment
      w.postMessage({ type: "init", model: "/segformer-b0.onnx" });
      return { w, busy: true };
    });

    let readyCount = 0;
    workers.current.forEach(({ w }, idx) => {
      w.onmessage = async (e) => {
        const { type, data } = e.data;
        if (type === "inited") {
          workers.current[idx].busy = false;
          if (++readyCount === cores) setReady(true);
          return;
        }
        if (type === "result") {
          console.log("Got a result", data);
          const { maskBitmap, inferenceTime } = data;
          if (maskRef.current) maskRef.current.src = toURL(maskBitmap);
          maskBitmap.close();
          times.current.push(inferenceTime);
          setLast(inferenceTime);
          setAvg(
            times.current.reduce((a, b) => a + b, 0) / times.current.length,
          );
          workers.current[idx].busy = false;
        }
      };
    });

    return () => workers.current.forEach(({ w }) => w.terminate());
  }, [cores]);

  const dispatch = async () => {
    if (!running) {
      console.log("Not running - not dispatching workers");
      return;
    }
    const idle = workers.current.find((x) => !x.busy);
    if (!idle) {
      console.log("No idle workers!");
      return;
    }
    const vid = videoRef.current;
    if (!vid || vid.readyState < 2) {
      console.log("Video is not ready - not dispatching");
      return;
    }
    idle.busy = true;
    const bm = await createImageBitmap(vid);
    console.log("Running idle worker", idle);
    idle.w.postMessage({ type: "run", imageBitmap: bm }, [bm]);
  };

  const startCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    stream.current = s;
    if (videoRef.current) {
      videoRef.current.srcObject = s;
      await videoRef.current.play();
    }
    setRunning(true);
    running = true;
    timer.current = window.setInterval(() => {
      dispatch();
      if (avg && times.current.length > cores) interval.current = avg / cores;
    }, interval.current);
  };

  useEffect(
    () => () => {
      clearInterval(timer.current);
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  return (
    <div className="relative w-full h-screen bg-black text-white">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <img
        ref={maskRef}
        alt="mask"
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
      />
      {!running && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="bg-black/70 text-white">
            <CardHeader>
              <CardTitle>Multithread Demo ({cores} cores)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>SegFormer‑B0 on all cores.</p>
              <Button onClick={startCamera} disabled={!ready}>
                {ready ? (
                  "Start camera"
                ) : (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {running && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 text-center text-sm flex">
          Last: {last ? last.toFixed(0) : "-"} ms | Avg:{" "}
          {avg ? avg.toFixed(0) : "-"} ms | {cores} cores
          <div className="flex gap-1">
            {workers.current.map((worker, idx) => (
              <div
                className={cn(
                  "rounded-full w-3 h-3",
                  worker.busy ? "bg-red-500" : "bg-emerald-500",
                )}
                key={idx}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
