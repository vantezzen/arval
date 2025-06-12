import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Label,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const MODELS = [
  { id: "b0", name: "SegFormer-B0", modelPath: "/segformer-b0.onnx" },
  { id: "b1", name: "SegFormer-B1", modelPath: "/segformer-b1.onnx" },
  { id: "b2", name: "SegFormer-B2", modelPath: "/segformer-b2.onnx" },
] as const;

type ModelConfig = {
  id: string;
  name: string;
  modelPath: string;
};

const MAX_ITERS = 50;

interface ModelState extends ModelConfig {
  worker: Worker | null;
  ready: boolean;
  times: number[]; // ms per iteration
  latestInputURL: string | null;
  latestMaskURL: string | null;
}

export default function SegformerBenchmark() {
  const [models, setModels] = useState<ModelState[]>(() =>
    MODELS.map((m) => ({
      ...m,
      worker: null,
      ready: false,
      times: [],
      latestInputURL: null,
      latestMaskURL: null,
    })),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [chartRows, setChartRows] = useState<Record<string, number | string>[]>(
    [],
  );
  const fileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const finishedThisIter = useRef(0);

  const bitmapToDataURL = (bitmap: ImageBitmap) => {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    return canvas.toDataURL();
  };

  const resetBench = () => {
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        times: [],
        latestInputURL: null,
        latestMaskURL: null,
      })),
    );
    setChartRows([]);
    setIteration(0);
    finishedThisIter.current = 0;
  };

  const updateModel = useCallback(
    (
      id: string,
      patch: Partial<ModelState> | ((s: ModelState) => Partial<ModelState>),
    ) => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) }
            : m,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    const initedStates: ModelState[] = [];

    MODELS.forEach((cfg) => {
      const worker = new Worker(
        new URL("./segformerWorker.ts", import.meta.url),
        {
          type: "module",
        },
      );

      const state: ModelState = {
        ...cfg,
        worker,
        ready: false,
        times: [],
        latestInputURL: null,
        latestMaskURL: null,
      };

      worker.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === "inited") {
          updateModel(cfg.id, { ready: true });
        } else if (type === "result") {
          const { inputBitmap, maskBitmap, inferenceTime } = data as {
            inputBitmap: ImageBitmap;
            maskBitmap: ImageBitmap;
            inferenceTime: number;
          };

          const inputURL = bitmapToDataURL(inputBitmap);
          const maskURL = bitmapToDataURL(maskBitmap);

          updateModel(cfg.id, (prev) => ({
            times: [...prev.times, inferenceTime],
            latestInputURL: inputURL,
            latestMaskURL: maskURL,
          }));

          inputBitmap.close();
          maskBitmap.close();

          finishedThisIter.current += 1;
          if (finishedThisIter.current === MODELS.length) {
            handleIterationComplete();
          }
        } else if (type === "error") {
          console.error(`[${cfg.name}]`, data);
          finishedThisIter.current += 1;
          if (finishedThisIter.current === MODELS.length) {
            handleIterationComplete();
          }
        }
      };
      worker.postMessage({ type: "init", model: cfg.modelPath });

      initedStates.push(state);
    });

    setModels(initedStates);

    // return () => initedStates.forEach((s) => s.worker?.terminate());
  }, []);

  const handleIterationComplete = () => {
    console.log("Iteration complete");
    finishedThisIter.current = 0;

    setIteration((iter) => {
      console.log("Updating iteration");

      const newIter = iter + 1;
      setModels((prev) => {
        const row: Record<string, number | string> = { iteration: newIter };
        prev.forEach((m) => {
          row[m.name] = m.times[newIter - 1];
          if (m.times.length < newIter - 1) {
            console.warn(
              "We have less time information than we should have for model",
              m.name,
            );
          }
        });
        setChartRows((rows) => [...rows, row]);
        return prev;
      });

      if (fileRef.current && newIter < MAX_ITERS) {
        console.log("Running next iteration");
        runOneIteration(fileRef.current);
      } else {
        setIsRunning(false);
      }

      return newIter;
    });
  };

  const runOneIteration = async (file: File) => {
    const imgBitmaps = await Promise.all(
      MODELS.map(() => createImageBitmap(file)),
    );

    // We wrap inside a "setModels" to be able to get the updated "models" data
    // Could probably make this more elegant with some external storage etc. but this is just an experiment
    setModels((models) => {
      MODELS.forEach((cfg, idx) => {
        const bm = imgBitmaps[idx];
        const w = models.find((m) => m.id === cfg.id)?.worker;
        console.log("Running interference", { model: cfg.name, bm, w });
        w?.postMessage({ type: "run", imageBitmap: bm }, [bm]);
      });

      return models;
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    fileRef.current = file;
    resetBench();
    setIsRunning(true);

    runOneIteration(file);
  };
  const allReady = models.every((m) => m.ready);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          SegFormer Benchmark
        </h1>
      </header>

      <div className="text-center space-y-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFile}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={!allReady || isRunning}
        >
          {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {allReady ? "Select Image" : "Loading models…"}
        </Button>
        {isRunning && (
          <p className="text-sm">
            Iteration {iteration + 1} / {MAX_ITERS}
          </p>
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Inference time (ms) per iteration</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              "SegFormer-B0": {
                color: "var(--chart-1)",
                label: "SegFormer-B0",
              },
              "SegFormer-B1": {
                color: "var(--chart-2)",
                label: "SegFormer-B1",
              },
              "SegFormer-B2": {
                color: "var(--chart-3)",
                label: "SegFormer-B2",
              },
            }}
            className="h-64 w-full"
          >
            <AreaChart
              data={chartRows}
              margin={{
                left: 15,
                right: 15,
                bottom: 15,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="iteration">
                <Label value="Iteration" position="insideBottom" dy={10} />
              </XAxis>
              <YAxis>
                <Label value="Inference time (ms)" dx={-15} angle={90} />
              </YAxis>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              {models.map((m, index) => (
                <Area
                  key={m.id}
                  type="natural"
                  dataKey={m.name}
                  dot={false}
                  fill={`var(--color-blue-${500 - index * 200})`}
                  stroke={`var(--color-blue-${500 - index * 200})`}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Per-model summaries */}
      <div className="grid md:grid-cols-3 gap-6">
        {models.map((m) => {
          const avg = m.times.length
            ? m.times.reduce((a, b) => a + b, 0) / m.times.length
            : null;
          return (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle>
                  {m.name} {avg !== null && `— avg ${avg.toFixed(2)} ms`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {m.latestMaskURL ? (
                  <div className="relative w-full">
                    <img
                      src={m.latestInputURL!}
                      alt="model input"
                      className="rounded-lg w-full"
                    />
                    <img
                      src={m.latestMaskURL}
                      alt="mask"
                      className="rounded-lg w-full absolute top-0 left-0 opacity-70"
                    />
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    {isRunning ? "Running..." : "Select an image to start"}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
