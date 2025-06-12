import * as ort from "onnxruntime-web";

const NUM_CLASSES = 150;
const classColors: [number, number, number][] = [];
const generateColorMap = (n: number) => {
  if (classColors.length) return classColors;
  for (let i = 0; i < n; i++) {
    classColors.push([(i * 123) % 256, (i * 678) % 256, (i * 345) % 256]);
  }
  return classColors;
};
generateColorMap(NUM_CLASSES);

// Global session (kept alive for the worker’s lifetime)
let session: ort.InferenceSession | null = null;

self.onmessage = async (e) => {
  const message = e.data as
    | { type: "init"; model: string }
    | { type: "run"; imageBitmap: ImageBitmap };

  console.log("[Worker] Received message", e);

  if (message.type === "init") {
    try {
      session = await ort.InferenceSession.create(message.model, {
        executionProviders: ["wasm"],
      });
      (self as DedicatedWorkerGlobalScope).postMessage({ type: "inited" });
    } catch (err) {
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: "error",
        data: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (message.type === "run") {
    const { imageBitmap } = message;

    if (!session) {
      console.error("Tried running interference before loading model");
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: "error",
        data: "Model not loaded yet.",
      });
      return;
    }

    const t0 = performance.now();
    console.log("[Worker] Running interference");

    const modelW = 512;
    const modelH = 512;
    const inputCanvas = new OffscreenCanvas(modelW, modelH);
    const ictx = inputCanvas.getContext("2d")!;
    const ratio = Math.min(
      modelW / imageBitmap.width,
      modelH / imageBitmap.height,
    );
    const w = Math.round(imageBitmap.width * ratio);
    const h = Math.round(imageBitmap.height * ratio);
    const xOff = (modelW - w) / 2;
    const yOff = (modelH - h) / 2;

    ictx.fillStyle = "black";
    ictx.fillRect(0, 0, modelW, modelH);
    ictx.drawImage(imageBitmap, xOff, yOff, w, h);

    const imgData = ictx.getImageData(0, 0, modelW, modelH).data;
    const tensorData = new Float32Array(3 * modelW * modelH);
    for (let i = 0; i < imgData.length; i += 4) {
      const p = i / 4;
      tensorData[p] = imgData[i] / 255;
      tensorData[p + modelW * modelH] = imgData[i + 1] / 255;
      tensorData[p + 2 * modelW * modelH] = imgData[i + 2] / 255;
    }
    const tensor = new ort.Tensor("float32", tensorData, [
      1,
      3,
      modelH,
      modelW,
    ]);

    const { logits } = await session.run({ pixel_values: tensor });
    const logitsTensor = logits as ort.Tensor;
    const [, numClasses, outH, outW] = logitsTensor.dims;
    const logitData = logitsTensor.data as Float32Array;

    const maskCanvas = new OffscreenCanvas(outW, outH);
    const mctx = maskCanvas.getContext("2d")!;
    const maskImg = mctx.createImageData(outW, outH);

    for (let y = 0; y < outH; y++) {
      for (let x = 0; x < outW; x++) {
        const pixOff = y * outW + x;
        let best = 0,
          bestVal = -Infinity;
        for (let c = 0; c < numClasses; c++) {
          const v = logitData[c * outH * outW + pixOff];
          if (v > bestVal) {
            bestVal = v;
            best = c;
          }
        }
        const p = pixOff * 4;
        if (best === 0) {
          maskImg.data[p + 3] = 0; // fully transparent
        } else {
          const [r, g, b] = classColors[best];
          maskImg.data[p] = r;
          maskImg.data[p + 1] = g;
          maskImg.data[p + 2] = b;
          maskImg.data[p + 3] = 255;
        }
      }
    }
    mctx.putImageData(maskImg, 0, 0);

    console.log("[Worker] Drawing mask");
    const bigMask = new OffscreenCanvas(modelW, modelH);
    const bctx = bigMask.getContext("2d")!;
    bctx.imageSmoothingEnabled = false;
    bctx.drawImage(maskCanvas, 0, 0, modelW, modelH);

    const inputBitmap = await inputCanvas.transferToImageBitmap();
    const maskBitmap = await bigMask.transferToImageBitmap();

    const t1 = performance.now();

    console.log("[Worker] Finished running interference");

    (self as DedicatedWorkerGlobalScope).postMessage(
      {
        type: "result",
        data: {
          inputBitmap,
          maskBitmap,
          inferenceTime: t1 - t0,
        },
      },
      [inputBitmap, maskBitmap],
    );
  }
};

self.onclose = () => {
  console.log("[Worker] Closing");
};
