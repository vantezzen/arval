import type { ResolvedRuleset } from "@/lib/types/rules";
import type { ValidationExecutionResult } from "./ValidationExecutor";
import type ErrorMessageService from "./ErrorMessageService";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import { getUniqueAreas } from "./utils";
import type { Area } from "@/lib/types/area";

export type ValidationResult = {
  errors: string[];
  highlightedAreas: Area[];
};

@injectable()
export default class ValidationReporter {
  constructor(
    @inject(TYPES.ErrorMessageService)
    private errorMessageService: ErrorMessageService
  ) {}

  /**
   * Creates a comprehensive validation report from execution results.
   * This method formats error messages and aggregates highlighted areas.
   *
   * @param results - Array of validation execution results
   * @param rules - The resolved ruleset for context
   * @returns ValidationResult - Formatted validation result with errors and highlighted areas
   */
  createReport(
    results: ValidationExecutionResult[],
    rules: ResolvedRuleset
  ): ValidationResult {
    const errors = results.map((result) => result.error).filter(Boolean);

    const highlightedAreas = getUniqueAreas(
      results
        .map((result) => result.highlightedAreas)
        .filter(Boolean)
        .flat()
    );

    const report: ValidationResult = {
      errors: this.errorMessageService.createErrorMessage(errors, rules),
      highlightedAreas,
    };

    return report;
  }
}
