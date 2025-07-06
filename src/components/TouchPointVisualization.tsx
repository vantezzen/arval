import { useEffect, useState } from "react";

interface MouseState {
  isDown: boolean;
  x: number;
  y: number;
  pivotX: number | null;
  pivotY: number | null;
  isOptionPressed: boolean;
  isShiftPressed: boolean;
  isControlPressed: boolean;
}

interface TouchPointVisualizationProps {
  mouseState: MouseState | null;
}

export default function TouchPointVisualization({
  mouseState,
}: TouchPointVisualizationProps) {
  const [touchPoints, setTouchPoints] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);

  useEffect(() => {
    if (!mouseState) {
      setTouchPoints([]);
      return;
    }

    if (
      !mouseState.isOptionPressed ||
      mouseState.pivotX === null ||
      mouseState.pivotY === null
    ) {
      setTouchPoints([{ x: mouseState.x, y: mouseState.y, id: 0 }]);
      return;
    }

    if (mouseState.isControlPressed) {
      const deltaX = mouseState.x - mouseState.pivotX;
      const deltaY = mouseState.y - mouseState.pivotY;

      setTouchPoints([
        { x: mouseState.pivotX - deltaX, y: mouseState.pivotY - deltaY, id: 0 },
        { x: mouseState.pivotX + deltaX, y: mouseState.pivotY + deltaY, id: 1 },
      ]);
    } else {
      const deltaX = mouseState.x - mouseState.pivotX;
      const deltaY = mouseState.y - mouseState.pivotY;

      setTouchPoints([
        { x: mouseState.pivotX - deltaX, y: mouseState.pivotY - deltaY, id: 0 },
        { x: mouseState.pivotX + deltaX, y: mouseState.pivotY + deltaY, id: 1 },
      ]);
    }
  }, [mouseState]);

  if (!mouseState) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {mouseState.isOptionPressed &&
        mouseState.pivotX !== null &&
        mouseState.pivotY !== null && (
          <div
            style={{
              position: "absolute",
              left: mouseState.pivotX - 10,
              top: mouseState.pivotY - 10,
              width: 15,
              height: 15,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 0, 0, 0.8)",
              border: "2px solid red",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "white",
              fontWeight: "bold",
            }}
          />
        )}

      {touchPoints.map((point) => (
        <div
          key={point.id}
          style={{
            position: "absolute",
            left: point.x - 15,
            top: point.y - 15,
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid green",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            color: "white",
            fontWeight: "bold",
          }}
        />
      ))}

      {touchPoints.length === 2 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <line
            x1={touchPoints[0].x}
            y1={touchPoints[0].y}
            x2={touchPoints[1].x}
            y2={touchPoints[1].y}
            stroke="rgba(120, 120, 120, 0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      )}
    </div>
  );
}
