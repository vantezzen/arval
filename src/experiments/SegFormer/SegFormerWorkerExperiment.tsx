import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Loader2 } from "lucide-react";

export default function SegFormerWorkerExperiment() {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [workerReady, setWorkerReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    // Create the module worker (Vite handles bundling)
    const worker = new Worker(
      new URL("./segformerWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, data } = e.data;
      switch (type) {
        case "inited":
          setWorkerReady(true);
          break;
        case "result": {
          const { inputBitmap, maskBitmap, inferenceTime } = data as {
            inputBitmap: ImageBitmap;
            maskBitmap: ImageBitmap;
            inferenceTime: number;
          };

          const processedURL = bitmapToDataURL(inputBitmap);
          const maskURL = bitmapToDataURL(maskBitmap);

          setProcessedImage(processedURL);
          setOutputImage(maskURL);
          setInferenceTime(inferenceTime);
          setIsLoading(false);

          inputBitmap.close();
          maskBitmap.close();
          break;
        }
        case "error":
          console.error(data);
          setIsLoading(false);
          break;
        default:
          break;
      }
    };

    worker.postMessage({ type: "init", model: "/segformer-b1.onnx" });

    return () => worker.terminate();
  }, []);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !workerRef.current) return;

    const imageBitmap = await createImageBitmap(file);

    setProcessedImage(null);
    setOutputImage(null);
    setInferenceTime(0);
    setIsLoading(true);

    workerRef.current.postMessage({ type: "run", imageBitmap }, [imageBitmap]);
  };

  const bitmapToDataURL = (bitmap: ImageBitmap): string => {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    return canvas.toDataURL();
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Image Segmenter (Worker)
          </h1>
        </header>

        <Card className="mb-8 text-center">
          <CardTitle>UI Thread Indicator</CardTitle>
          <CardContent>
            <ImageIcon className="mx-auto animate-spin" />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={!workerReady || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {workerReady ? "Upload Image" : "Loading Model..."}
            </Button>
          </CardContent>
        </Card>

        {isLoading && <p className="text-center my-4 text-lg">Processing...</p>}
        {inferenceTime > 0 && (
          <p className="text-center text-lg font-semibold mb-4">
            {inferenceTime.toFixed(2)} ms
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Model Input</CardTitle>
            </CardHeader>
            <CardContent>
              {processedImage ? (
                <img
                  src={processedImage}
                  alt="Processed model input"
                  className="rounded-lg w-full"
                />
              ) : (
                <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <p>Select an image to begin</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segmentation Mask</CardTitle>
            </CardHeader>
            <CardContent>
              {outputImage ? (
                <div className="relative w-full">
                  <img
                    src={processedImage!}
                    alt="Processed model input"
                    className="rounded-lg w-full"
                  />
                  <img
                    src={outputImage}
                    alt="Segmented output"
                    className="rounded-lg w-full absolute top-0 left-0 opacity-70"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <p>Output will appear here</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
