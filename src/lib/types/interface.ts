export enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  up = "up",
  down = "down",

  rotateRight = "rotateRight",
  rotateLeft = "rotateLeft",
}

export type ValidationError = {
  reason: string;
  type: "atomic" | "full";
};

export type ValidationResult = {
  error?: ValidationError;
};
