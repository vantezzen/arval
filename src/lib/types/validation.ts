import type { Area } from "./area";

/**
 * Represents a single validation error with reason and type information.
 * Used internally by validators to represent validation failures.
 */
export type ValidationError = {
  reason: string;
  type: "atomic" | "full";
};

/**
 * Represents the result of a single validation check.
 * Used by individual validators to return their validation status.
 */
export type ValidationCheckResult = {
  error?: ValidationError;
  highlightedAreas?: Area[];
};

/**
 * Represents the result of a validation pass/fail check.
 * Used internally by validators during the validation process.
 */
export type ValidationPassResult = {
  passes: boolean;
  highlightedAreas?: Area[];
};

/**
 * Represents the final validation result for an object.
 * Contains all validation errors and highlighted areas for display.
 * This is the public-facing type used by UI components.
 */
export type ValidationResult = {
  errors: string[];
  highlightedAreas: Area[];
};
