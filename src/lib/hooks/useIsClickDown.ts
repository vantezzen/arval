import { useEffect, useState } from "react";

/**
 * Hook that returns whether there is currently an active click/touch on the webpage
 */
export function useIsClickDown(): boolean {
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    const handleMouseDown = () => setIsDown(true);
    const handleMouseUp = () => setIsDown(false);

    const handleTouchStart = () => setIsDown(true);
    const handleTouchEnd = () => setIsDown(false);
    const handleTouchCancel = () => setIsDown(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, []);

  return isDown;
}
