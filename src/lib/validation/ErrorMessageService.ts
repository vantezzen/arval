import type { ValidationError } from "../types/interface";
import { injectable } from "tsyringe";

@injectable()
export default class ErrorMessageService {
  createErrorMessage(errors: ValidationError[]) {
    if (!errors.length) return [];

    const finalErrors = errors
      .filter((error) => error.type === "full")
      .map((error) => this.formatReason(error.reason));
    const atomicErrors = errors.filter((error) => error.type === "atomic");
    if (atomicErrors.length) {
      finalErrors.push(this.combineAtomicErrors(atomicErrors));
    }

    return finalErrors;
  }

  private combineAtomicErrors(errors: ValidationError[]) {
    return `Das Objekt muss ${errors.map((error) => this.formatReason(error.reason)).join(" und ")}.`;
  }

  private formatReason(reason: string) {
    const [firstPart, secondPart] = reason.split(",", 2);

    if (!secondPart) return `<b>${firstPart}</b>`;

    return `<b>${firstPart}</b>, <c>${secondPart}</c>`;
  }
}
