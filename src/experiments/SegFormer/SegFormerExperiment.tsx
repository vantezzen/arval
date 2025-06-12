import { useState, useRef, useEffect } from "react";
import * as ort from "onnxruntime-web";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Loader2 } from "lucide-react";

const MODEL = "/segformer-b0.onnx";

// Generate a distinct colour for each class ID
const classColors: [number, number, number][] = [];
const generateColorMap = (numClasses: number) => {
  if (classColors.length > 0) return classColors;
  for (let i = 0; i < numClasses; i++) {
    const r = (i * 123) % 256;
    const g = (i * 678) % 256;
    const b = (i * 345) % 256;
    classColors.push([r, g, b]);
  }
  return classColors;
};

// The number of classes the model was trained on (ADE20K dataset)
const NUM_CLASSES = 150;
generateColorMap(NUM_CLASSES);

export default function SegFormerExperiment() {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inferenceTime, setInferenceTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const newSession = await ort.InferenceSession.create(MODEL, {
          executionProviders: ["wasm"],
        });
        setSession(newSession);
        console.log("ONNX model loaded successfully.");
      } catch (e) {
        console.error("Failed to load the ONNX model:", e);
      }
    };
    loadModel();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProcessedImage(null);
        setOutputImage(null);
        setInferenceTime(0);
        processImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageUrl: string) => {
    if (!session) {
      console.error("Session not loaded yet");
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    // 1. Load Image
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const modelWidth = 512;
    const modelHeight = 512;
    const canvas = document.createElement("canvas");
    canvas.width = modelWidth;
    canvas.height = modelHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 2. Letterbox the input so we keep aspect ratio
    const ratio = Math.min(
      modelWidth / image.width,
      modelHeight / image.height,
    );
    const newWidth = Math.round(image.width * ratio);
    const newHeight = Math.round(image.height * ratio);
    const xOffset = (modelWidth - newWidth) / 2;
    const yOffset = (modelHeight - newHeight) / 2;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, modelWidth, modelHeight);
    ctx.drawImage(image, xOffset, yOffset, newWidth, newHeight);
    setProcessedImage(canvas.toDataURL());

    // 3. Pre-process
    const imageData = ctx.getImageData(0, 0, modelWidth, modelHeight);
    const { data } = imageData;
    const tensorData = new Float32Array(3 * modelWidth * modelHeight);
    for (let i = 0; i < data.length; i += 4) {
      const p = i / 4;
      tensorData[p] = data[i] / 255;
      tensorData[p + modelWidth * modelHeight] = data[i + 1] / 255;
      tensorData[p + 2 * modelWidth * modelHeight] = data[i + 2] / 255;
    }

    const tensor = new ort.Tensor("float32", tensorData, [
      1,
      3,
      modelHeight,
      modelWidth,
    ]);

    // 4. Run inference
    const feeds = { pixel_values: tensor } as Record<string, ort.Tensor>;
    const results = await session.run(feeds);
    const logitsTensor = results.logits as ort.Tensor;
    const [, numClasses, outH, outW] = logitsTensor.dims; // SegFormer returns 1xCxHxW (usually H=W=128)
    const logits = logitsTensor.data as Float32Array;

    // 5. Create a low-res colour mask (HxW)
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = outW;
    maskCanvas.height = outH;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;
    const maskImg = maskCtx.createImageData(outW, outH);

    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) {
        const pixOff = y * outW + x;
        let best = 0;
        let bestVal = -Infinity;
        for (let c = 0; c < numClasses; c++) {
          const v = logits[c * outH * outW + pixOff];
          if (v > bestVal) {
            bestVal = v;
            best = c;
          }
        }

        const p = pixOff * 4;
        if (best === 0) {
          // background -> transparent
          maskImg.data[p + 3] = 0;
        } else {
          const [r, g, b] = classColors[best];
          maskImg.data[p] = r;
          maskImg.data[p + 1] = g;
          maskImg.data[p + 2] = b;
          maskImg.data[p + 3] = 255;
        }
      }
    }

    maskCtx.putImageData(maskImg, 0, 0);

    // 6. Upscale the mask to model input size (512×512)
    const bigMask = document.createElement("canvas");
    bigMask.width = modelWidth;
    bigMask.height = modelHeight;
    const bigCtx = bigMask.getContext("2d");
    if (!bigCtx) return;
    bigCtx.imageSmoothingEnabled = false;
    bigCtx.drawImage(maskCanvas, 0, 0, modelWidth, modelHeight);
    setOutputImage(bigMask.toDataURL());
    setInferenceTime(performance.now() - startTime);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Image Segmenter</h1>
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
              disabled={!session || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {session ? "Upload Image" : "Loading Model..."}
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
