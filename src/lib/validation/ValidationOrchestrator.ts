import type Object from "@/lib/dto/Object";
import type { ValidationResult } from "@/lib/types/validation";
import ValidationRuleResolver from "./ValidationRuleResolver";
import ValidationExecutor from "./ValidationExecutor";
import ValidationReporter from "./ValidationReporter";
import { injectable, inject } from "tsyringe";
import { TYPES } from "@/lib/di/types";
import { setCustomData } from "r3f-perf";
import type ValidationPerformance from "./ValidationPerformance";

@injectable()
export default class ValidationOrchestrator {
  private activeObjectSessions: Set<string> = new Set();

  private lastValidationStartTime: Map<string, number> = new Map();
  private pendingValidationTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @inject(TYPES.ValidationRuleResolver)
    private ruleResolver: ValidationRuleResolver,
    @inject(TYPES.ValidationExecutor)
    private executor: ValidationExecutor,
    @inject(TYPES.ValidationReporter)
    private reporter: ValidationReporter,
    @inject(TYPES.ValidationPerformance)
    private validationPerformance: ValidationPerformance
  ) {}

  /**
   * Orchestrates the complete validation process for an object.
   * This method coordinates rule resolution, validation execution, and result reporting.
   *
   * @param object - The object to validate
   * @returns Promise<ValidationResult> - The complete validation result with errors and highlighted areas
   */
  async validate(object: Object): Promise<ValidationResult> {
    if (this.activeObjectSessions.has(object.id)) {
      throw new Error(`Validation already in progress for object ${object.id}`);
    }

    this.activeObjectSessions.add(object.id);
    const startTime = performance.now();
    const timing = this.validationPerformance.start("validate");
    const rules = this.ruleResolver.resolveRulesetForObject(object.type);
    const validationResults = await this.executor.execute(object, rules);
    const report = this.reporter.createReport(validationResults, rules);

    const runtime = performance.now() - startTime;
    setCustomData(runtime);
    this.activeObjectSessions.delete(object.id);
    this.validationPerformance.end(timing);
    this.validationPerformance.runComplete();

    return report;
  }

  async debouncedValidate(
    object: Object,
    debounceTime: number = 200
  ): Promise<ValidationResult | null> {
    const lastStartTime = this.lastValidationStartTime.get(object.id) || 0;
    const currentTime = performance.now();
    const timeSinceLastStart = currentTime - lastStartTime;

    if (timeSinceLastStart > debounceTime) {
      // Start right away
      this.lastValidationStartTime.set(object.id, currentTime);
      return await this.validate(object);
    }

    // Too soon — check if there's already a scheduled one
    if (this.pendingValidationTimeouts.has(object.id)) {
      // Already waiting: reject this call
      return Promise.resolve(null);
    }

    const timeToNextValidation = debounceTime - timeSinceLastStart;

    // Schedule the validation to run after the debounce time
    return new Promise((resolve) => {
      const debounceTimeout = setTimeout(async () => {
        this.lastValidationStartTime.set(object.id, performance.now());
        try {
          const result = await this.validate(object);
          resolve(result);
        } catch (error) {
          console.error(`Validation failed for object ${object.id}:`, error);
          resolve(null);
        } finally {
          this.pendingValidationTimeouts.delete(object.id);
        }
      }, timeToNextValidation);

      this.pendingValidationTimeouts.set(object.id, debounceTimeout);
    });
  }

  /**
   * Checks if validation is currently in progress for a specific object.
   * This helps prevent duplicate validation requests for the same object.
   *
   * @param objectId - The ID of the object to check
   * @returns boolean - True if validation is in progress, false otherwise
   */
  isValidationInProgress(objectId: string): boolean {
    return this.activeObjectSessions.has(objectId);
  }
}
