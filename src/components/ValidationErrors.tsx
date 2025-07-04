import type Object from "@/lib/dto/Object";
import { Camera } from "three";
import { ChatBubble } from "./ui/chat-bubble";
import { useMemo, useRef } from "react";
import { Portal } from "./Portal";
import { useFrame, useThree } from "@react-three/fiber";

function ErrorMessage({ text }: { text: string }) {
  // This is not safe against XSS but we assume error messages are safe as they are created by our city planners
  const html = useMemo(
    () =>
      text
        .replace(/<b>/gi, '<span class="text-zinc-900 font-medium ">')
        .replace(/<\/b>/gi, "</span>")

        .replace(/<c>/gi, '<span class="text-zinc-600">')
        .replace(/<\/c>/gi, "</span>"),
    [text]
  );

  return (
    <div className="text-zinc-400" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function getObjectPositionOnScreen(
  object: Object,
  camera: Camera,
  size: { width: number; height: number }
) {
  const pos = object.position.clone();
  pos.project(camera);
  // Convert NDC [-1,1] to screen coordinates
  const left = ((pos.x + 1) / 2) * size.width;
  const top = ((-pos.y + 1) / 2) * size.height;
  return { top, left };
}

function ValidationErrors({
  errors,
  object,
}: {
  errors: string[];
  object: Object;
}) {
  const { camera, size } = useThree();
  const bubbleRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    // Doing this using the direct ref allows us to update the position without re-rendering the component
    const { top, left } = getObjectPositionOnScreen(object, camera, size);
    if (bubbleRef.current && errors.length) {
      bubbleRef.current.style.top = `${top}px`;
      bubbleRef.current.style.left = `${left}px`;
    }
  });

  if (!errors.length) return null;

  const { top, left } = getObjectPositionOnScreen(object, camera, size);

  return (
    <Portal>
      <div
        className="absolute"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          transform: "translate(-50%, 20px)",
          pointerEvents: "none",
        }}
        ref={bubbleRef}
      >
        <ChatBubble
          className="w-lg grid gap-2 pointer-events-none"
          arrow="top-center"
        >
          {errors.map((error) => (
            <ErrorMessage text={error} key={error} />
          ))}
        </ChatBubble>
      </div>
    </Portal>
  );
}

export default ValidationErrors;
