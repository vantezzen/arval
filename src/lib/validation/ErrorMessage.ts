import type { ValidationError } from "../types/interface";

export default class ErrorMessage {
  createErrorMessage(errors: ValidationError[]) {
    if (!errors.length) return [];

    const finalErrors = errors
      .filter((error) => error.type === "full")
      .map((error) => error.reason);
    const atomicErrors = errors.filter((error) => error.type === "atomic");
    if (atomicErrors) {
      finalErrors.push(this.combineAtomicErrors(atomicErrors));
    }

    return finalErrors;
  }

  private combineAtomicErrors(errors: ValidationError[]) {
    return `Das Objekt muss ${errors.map((error) => this.formatAtomicReason(error.reason)).join(" und ")}.`;
  }

  private formatAtomicReason(reason: string) {
    const [firstPart, secondPart] = reason.split(",", 2);

    if (!secondPart) return `<b>${firstPart}</b>`;

    return `<b>${firstPart}</b>, <c>${secondPart}</c>`;
  }
}
