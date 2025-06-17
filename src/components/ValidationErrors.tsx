import type Object from "@/lib/dto/Object";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import { ChatBubble } from "./ui/chat-bubble";
import { useMemo } from "react";

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

function ValidationErrors({
  errors,
  object,
}: {
  errors: string[];
  object: Object;
}) {
  if (!errors.length) return null;

  return (
    <Html
      sprite
      position={object.position.clone().add(new Vector3(0, -0.1, 0))}
    >
      <ChatBubble
        className="w-lg -translate-x-1/2 grid gap-2"
        arrow="top-center"
      >
        {errors.map((error) => (
          <ErrorMessage text={error} key={error} />
        ))}
      </ChatBubble>
    </Html>
  );
}

export default ValidationErrors;
