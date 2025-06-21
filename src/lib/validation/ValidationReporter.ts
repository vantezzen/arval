import type { ResolvedRuleset } from "@/lib/types/rules";
import type ErrorMessageService from "./ErrorMessageService";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import { getUniqueAreas } from "./utils";
import type {
  ValidationCheckResult,
  ValidationResult,
} from "@/lib/types/validation";
import type ValidationPerformance from "./ValidationPerformance";

@injectable()
export default class ValidationReporter {
  constructor(
    @inject(TYPES.ErrorMessageService)
    private errorMessageService: ErrorMessageService,

    @inject(TYPES.ValidationPerformance)
    private performance: ValidationPerformance
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
    results: ValidationCheckResult[],
    rules: ResolvedRuleset
  ): ValidationResult {
    const timing = this.performance.start("createReport");
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

    this.performance.end(timing);
    this.performance.runComplete();

    return report;
  }
}
