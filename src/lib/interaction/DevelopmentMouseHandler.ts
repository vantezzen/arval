interface VirtualTouchPoint {
  clientX: number;
  clientY: number;
  identifier: number;
}

interface VirtualTouchEvent {
  touches: VirtualTouchPoint[];
  targetTouches: VirtualTouchPoint[];
  changedTouches: VirtualTouchPoint[];
}

interface MouseState {
  isDown: boolean;
  x: number;
  y: number;
  pivotX: number | null;
  pivotY: number | null;
  isOptionPressed: boolean;
  isControlPressed: boolean;
}

export default class DevelopmentMouseHandler {
  private mouseState: MouseState = {
    isDown: false,
    x: 0,
    y: 0,
    pivotX: null,
    pivotY: null,
    isOptionPressed: false,
    isControlPressed: false,
  };

  private onTouchStart: (event: VirtualTouchEvent) => void;
  private onTouchMove: (event: VirtualTouchEvent) => void;
  private onTouchEnd: (event: VirtualTouchEvent) => void;

  constructor(
    onTouchStart: (event: VirtualTouchEvent) => void,
    onTouchMove: (event: VirtualTouchEvent) => void,
    onTouchEnd: (event: VirtualTouchEvent) => void
  ) {
    this.onTouchStart = onTouchStart;
    this.onTouchMove = onTouchMove;
    this.onTouchEnd = onTouchEnd;
  }

  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;

    this.mouseState.isDown = true;
    this.mouseState.x = event.clientX;
    this.mouseState.y = event.clientY;

    if (this.mouseState.isOptionPressed && this.mouseState.pivotX === null) {
      this.mouseState.pivotX = event.clientX;
      this.mouseState.pivotY = event.clientY;
    }

    const touchPoints = this.calculateTouchPoints();
    const event2 = this.createVirtualTouchEvent(touchPoints);
    this.onTouchStart(event2);
  }

  onMouseMove(event: MouseEvent) {
    const previousX = this.mouseState.x;
    const previousY = this.mouseState.y;
    this.mouseState.x = event.clientX;
    this.mouseState.y = event.clientY;

    if (this.mouseState.isControlPressed) {
      const deltaX = this.mouseState.x - previousX;
      const deltaY = this.mouseState.y - previousY;
      this.mouseState.pivotX = this.mouseState.pivotX! + deltaX;
      this.mouseState.pivotY = this.mouseState.pivotY! + deltaY;
    }

    if (this.mouseState.isDown) {
      this.updateTouchEvents();
    }
  }

  onMouseUp(event: MouseEvent) {
    if (event.button !== 0) return;

    this.mouseState.isDown = false;
    this.mouseState.pivotX = null;
    this.mouseState.pivotY = null;

    this.updateTouchEvents();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === "Alt") {
      this.mouseState.isOptionPressed = true;
      if (!this.mouseState.isDown) {
        this.mouseState.pivotX = this.mouseState.x;
        this.mouseState.pivotY = this.mouseState.y;
      }
    } else if (event.key === "Control" || event.ctrlKey) {
      this.mouseState.isControlPressed = true;
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === "Alt") {
      this.mouseState.isOptionPressed = false;
      this.mouseState.pivotX = null;
      this.mouseState.pivotY = null;
      this.updateTouchEvents();
    } else if (event.key === "Control" || !event.ctrlKey) {
      this.mouseState.isControlPressed = false;
    }
  }

  private updateTouchEvents() {
    if (!this.mouseState.isDown) {
      this.onTouchEnd(this.createVirtualTouchEvent([]));
      return;
    }

    const touchPoints = this.calculateTouchPoints();
    const event = this.createVirtualTouchEvent(touchPoints);

    if (touchPoints.length > 0) {
      this.onTouchMove(event);
    }
  }

  private calculateTouchPoints(): VirtualTouchPoint[] {
    if (
      !this.mouseState.isOptionPressed ||
      this.mouseState.pivotX === null ||
      this.mouseState.pivotY === null
    ) {
      return [
        {
          clientX: this.mouseState.x,
          clientY: this.mouseState.y,
          identifier: 0,
        },
      ];
    }

    const deltaX = this.mouseState.x - this.mouseState.pivotX;
    const deltaY = this.mouseState.y - this.mouseState.pivotY;

    if (this.mouseState.isControlPressed) {
      return [
        {
          clientX: this.mouseState.pivotX - deltaX,
          clientY: this.mouseState.pivotY - deltaY,
          identifier: 0,
        },
        {
          clientX: this.mouseState.pivotX + deltaX,
          clientY: this.mouseState.pivotY + deltaY,
          identifier: 1,
        },
      ];
    } else {
      return [
        {
          clientX: this.mouseState.pivotX - deltaX,
          clientY: this.mouseState.pivotY - deltaY,
          identifier: 0,
        },
        {
          clientX: this.mouseState.pivotX + deltaX,
          clientY: this.mouseState.pivotY + deltaY,
          identifier: 1,
        },
      ];
    }
  }

  private createVirtualTouchEvent(
    touchPoints: VirtualTouchPoint[]
  ): VirtualTouchEvent {
    return {
      touches: touchPoints,
      targetTouches: touchPoints,
      changedTouches: touchPoints,
    };
  }

  getMouseState(): MouseState {
    return { ...this.mouseState };
  }
}
