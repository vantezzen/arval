import { describe, it, expect, beforeEach } from "vitest";
import {
  createTestObject,
  createTestRule,
  type TestObject,
} from "@/test/utils/testUtils";
import Validator from "../Validator";
import type { ResolvedRule } from "@/lib/types/rules";
import type Object from "@/lib/dto/Object";
import { z } from "zod/v4";

// Create a concrete implementation of Validator for testing
class TestValidator extends Validator<ResolvedRule> {
  protected validatesRule(rule: ResolvedRule): boolean {
    return rule.subject === "test";
  }

  protected getRuleSchema() {
    return z.object({
      subject: z.string(),
      action: z.enum(["allow-only", "forbid", "require"]),
      reason: z.string(),
    });
  }

  protected async passes(
    rule: ResolvedRule,
    object: Object
  ): Promise<{ passes: boolean; highlightedAreas?: any[] }> {
    // Simple test: pass if object type matches rule subject
    return {
      passes: object.type === rule.subject,
      highlightedAreas: [],
    };
  }
}

describe("Validator", () => {
  let validator: TestValidator;
  let testObject: TestObject;

  beforeEach(() => {
    validator = new TestValidator();
    testObject = createTestObject("test");
  });

  describe("validate", () => {
    it("should return empty result when validator does not handle rule", async () => {
      const rule = createTestRule("other", "forbid");
      const result = await validator.validate(
        rule,
        testObject as unknown as Object
      );
      expect(result).toEqual({});
    });

    it("should return empty result when rule schema is invalid", async () => {
      const invalidRule = {
        subject: "test",
        action: "invalid",
        reason: "test",
      } as unknown as ResolvedRule;
      const result = await validator.validate(
        invalidRule,
        testObject as unknown as Object
      );
      expect(result).toEqual({});
    });

    it("should return error when rule is not fulfilled", async () => {
      const rule = createTestRule("test", "forbid", "Test error");
      const result = await validator.validate(
        rule,
        testObject as unknown as Object
      );

      expect(result).toEqual({
        error: {
          reason: "Test error",
          type: "atomic",
        },
        highlightedAreas: [],
      });
    });

    it("should return empty result when rule is fulfilled", async () => {
      const rule = createTestRule("test", "require", "Test success");
      const result = await validator.validate(
        rule,
        testObject as unknown as Object
      );
      expect(result).toEqual({});
    });

    it("should handle allow-only action correctly", async () => {
      const rule = createTestRule("test", "allow-only", "Test allow-only");
      const result = await validator.validate(
        rule,
        testObject as unknown as Object
      );
      expect(result).toEqual({});
    });
  });

  describe("isRuleFulfilled", () => {
    it("should return false for forbid action when check passes", () => {
      const rule = createTestRule("test", "forbid");
      const result = validator["isRuleFulfilled"](rule, true);
      expect(result).toBe(false);
    });

    it("should return true for forbid action when check fails", () => {
      const rule = createTestRule("test", "forbid");
      const result = validator["isRuleFulfilled"](rule, false);
      expect(result).toBe(true);
    });

    it("should return true for require action when check passes", () => {
      const rule = createTestRule("test", "require");
      const result = validator["isRuleFulfilled"](rule, true);
      expect(result).toBe(true);
    });

    it("should return false for require action when check fails", () => {
      const rule = createTestRule("test", "require");
      const result = validator["isRuleFulfilled"](rule, false);
      expect(result).toBe(false);
    });

    it("should return true for allow-only action when check passes", () => {
      const rule = createTestRule("test", "allow-only");
      const result = validator["isRuleFulfilled"](rule, true);
      expect(result).toBe(true);
    });

    it("should return false for allow-only action when check fails", () => {
      const rule = createTestRule("test", "allow-only");
      const result = validator["isRuleFulfilled"](rule, false);
      expect(result).toBe(false);
    });
  });
});
