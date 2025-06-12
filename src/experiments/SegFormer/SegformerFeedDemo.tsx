import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SegformerFeedDemo() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [avgTime, setAvgTime] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const maskImgRef = useRef<HTMLImageElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timesRef = useRef<number[]>([]);
  const frameInFlight = useRef(false);

  const bitmapToDataURL = (bm: ImageBitmap) => {
    const c = document.createElement("canvas");
    c.width = bm.width;
    c.height = bm.height;
    c.getContext("2d")!.drawImage(bm, 0, 0);
    return c.toDataURL();
  };

  useEffect(() => {
    const worker = new Worker(
      new URL("./segformerWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === "inited") {
        setWorkerReady(true);
        return;
      }

      if (type === "result") {
        const { maskBitmap, inferenceTime } = data as {
          inputBitmap: ImageBitmap; // unused here
          maskBitmap: ImageBitmap;
          inferenceTime: number;
        };

        // display mask
        if (maskImgRef.current) {
          maskImgRef.current.src = bitmapToDataURL(maskBitmap);
        }
        maskBitmap.close();

        timesRef.current.push(inferenceTime);
        setLastTime(inferenceTime);
        setAvgTime(
          timesRef.current.reduce((a, b) => a + b, 0) / timesRef.current.length,
        );

        frameInFlight.current = false; // allow next frame
      }

      if (type === "error") {
        console.error(data);
        frameInFlight.current = false;
      }
    };
    worker.postMessage({ type: "init", model: "/segformer-b0.onnx" });

    return () => worker.terminate();
  }, []);

  const loop = async () => {
    if (!running || frameInFlight.current) return;
    const vid = videoRef.current;
    const w = workerRef.current;
    if (!vid || !w || vid.readyState < 2) return; // frame not ready

    frameInFlight.current = true;
    try {
      const bitmap = await createImageBitmap(vid);
      w.postMessage({ type: "run", imageBitmap: bitmap }, [bitmap]);
    } catch (err) {
      console.error(err);
      frameInFlight.current = false;
    }
  };

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      loop();
      rafId = requestAnimationFrame(tick);
    };
    if (running) rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [running]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
      setRunning(true);
    } catch (err) {
      console.error(err);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setRunning(false);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black text-white">
      {/* video feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* mask overlay */}
      <img
        ref={maskImgRef}
        alt="mask"
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
      />

      {/* HUD / controls */}
      {running ? null : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="bg-black/70 text-white">
            <CardHeader>
              <CardTitle>Live Segmentation Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Runs SegFormer‑B0 entirely on‑device.</p>
              <Button
                onClick={startCamera}
                disabled={!workerReady || hasPermission === false}
              >
                {workerReady ? (
                  hasPermission === false ? (
                    "Permission denied"
                  ) : (
                    "Start camera"
                  )
                ) : (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                    model…
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* timing */}
      {running && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 text-center text-sm">
          Last: {lastTime ? lastTime.toFixed(0) : "-"} ms | Avg:{" "}
          {avgTime ? avgTime.toFixed(0) : "-"} ms
        </div>
      )}
    </div>
  );
}
