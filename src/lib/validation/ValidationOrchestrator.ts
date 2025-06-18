import type Object from "@/lib/dto/Object";
import type { ValidationResult } from "./ValidationReporter";
import ValidationRuleResolver from "./ValidationRuleResolver";
import ValidationExecutor from "./ValidationExecutor";
import ValidationReporter from "./ValidationReporter";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import { setCustomData } from "r3f-perf";

@injectable()
export default class ValidationOrchestrator {
  constructor(
    @inject(TYPES.ValidationRuleResolver)
    private ruleResolver: ValidationRuleResolver,
    @inject(TYPES.ValidationExecutor)
    private executor: ValidationExecutor,
    @inject(TYPES.ValidationReporter)
    private reporter: ValidationReporter
  ) {}

  /**
   * Orchestrates the complete validation process for an object.
   * This method coordinates rule resolution, validation execution, and result reporting.
   *
   * @param object - The object to validate
   * @returns Promise<ValidationResult> - The complete validation result with errors and highlighted areas
   */
  async validate(object: Object): Promise<ValidationResult> {
    const startTime = performance.now();
    const rules = this.ruleResolver.resolveRulesetForObject(object.type);
    const validationResults = await this.executor.execute(object, rules);
    const report = this.reporter.createReport(validationResults, rules);

    const runtime = performance.now() - startTime;
    setCustomData(runtime);

    return report;
  }
}
