import { describe, it, expect, beforeEach } from "vitest";
import { container } from "tsyringe";
import ValidationOrchestrator from "../ValidationOrchestrator";
import {
  createTestObject,
  createAreaRule,
  createDistanceRule,
  createUndergroundRule,
  createCircleArea,
} from "@/test/utils/testUtils";
import {
  MockValidationRuleResolver,
  MockSegmentationProvider,
  MockSizeService,
  MockGroundService,
} from "@/test/mocks/mockServices";
import type { ResolvedRuleset } from "@/lib/types/rules";
import { TYPES } from "@/lib/di/types";
import type Object from "@/lib/dto/Object";
import ValidationExecutor from "../ValidationExecutor";
import ValidationReporter from "../ValidationReporter";
import ErrorMessageService from "../ErrorMessageService";

describe("ValidationOrchestrator", () => {
  let orchestrator: ValidationOrchestrator;
  let mockRuleResolver: MockValidationRuleResolver;
  let mockSegmentationProvider: MockSegmentationProvider;
  let mockSizeService: MockSizeService;
  let mockGroundService: MockGroundService;
  let object: Object;

  beforeEach(() => {
    container.clearInstances();

    // Create mocks
    mockRuleResolver = new MockValidationRuleResolver();
    mockSegmentationProvider = new MockSegmentationProvider();
    mockSizeService = new MockSizeService();
    mockGroundService = new MockGroundService();

    // Register mocks in DI container
    container.registerInstance(TYPES.ValidationRuleResolver, mockRuleResolver);
    container.registerInstance(
      TYPES.SegmentationService,
      mockSegmentationProvider
    );
    container.registerInstance(TYPES.SizeService, mockSizeService);
    container.registerInstance(TYPES.GroundService, mockGroundService);
    container.registerInstance(
      TYPES.ValidationExecutor,
      new ValidationExecutor()
    );
    container.registerInstance(
      TYPES.ErrorMessageService,
      new ErrorMessageService()
    );
    container.registerInstance(
      TYPES.ValidationReporter,
      new ValidationReporter(new ErrorMessageService())
    );

    // Resolve orchestrator from DI
    orchestrator = container.resolve(ValidationOrchestrator);
    object = createTestObject() as unknown as Object;
  });

  describe("validate", () => {
    it("should return empty result when no ruleset found", async () => {
      const result = await orchestrator.validate(object);

      expect(result).toEqual({
        errors: [],
        highlightedAreas: [],
      });
    });

    it("should return empty result when ruleset has no rules", async () => {
      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [],
      };
      mockRuleResolver.setRuleset(object.type, ruleset);

      const result = await orchestrator.validate(object);

      expect(result).toEqual({
        errors: [],
        highlightedAreas: [],
      });
    });

    it("should validate single rule successfully", async () => {
      const area = createCircleArea([0, 0], 5);
      const rule = createAreaRule(area, "forbid");
      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [rule],
      };
      mockRuleResolver.setRuleset(object.type, ruleset);

      const result = await orchestrator.validate(object);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("Area validation rule");
      expect(result.highlightedAreas).toEqual([area]);
    });

    it("should validate multiple rules and collect all errors", async () => {
      const area1 = createCircleArea([0, 0], 5);
      const area2 = createCircleArea([2, 2], 3);
      const rule1 = createAreaRule(area1, "forbid");
      const rule2 = createAreaRule(area2, "forbid");
      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [rule1, rule2],
      };
      mockRuleResolver.setRuleset(object.type, ruleset);

      // Position object inside both forbidden areas to violate both rules
      object.position = new (await import("three")).Vector3(1, 0, 1);

      const result = await orchestrator.validate(object);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.highlightedAreas).toEqual([area1, area2]);
    });

    it("should return valid result when all rules pass", async () => {
      const area = createCircleArea([0, 0], 5);
      const rule = createAreaRule(area, "require");
      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [rule],
      };
      mockRuleResolver.setRuleset(object.type, ruleset);

      // Position object inside the required area
      object.position = new (await import("three")).Vector3(2, 0, 2);

      const result = await orchestrator.validate(object);

      expect(result).toEqual({
        errors: [],
        highlightedAreas: [],
      });
    });

    it("should handle mixed validation results", async () => {
      const area1 = createCircleArea([0, 0], 5);
      const area2 = createCircleArea([10, 10], 3);
      const rule1 = createAreaRule(area1, "forbid");
      const rule2 = createAreaRule(area2, "require");
      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [rule1, rule2],
      };
      mockRuleResolver.setRuleset(object.type, ruleset);

      // Position object inside forbidden area1 but outside required area2
      object.position = new (await import("three")).Vector3(2, 0, 2);

      const result = await orchestrator.validate(object);

      expect(result.errors.length).toBeGreaterThan(0);
      // Both areas should be highlighted: area1 because it's forbidden and object is inside,
      // area2 because it's required and object is outside
      expect(result.highlightedAreas).toEqual([area1, area2]);
    });

    it("should handle different rule types", async () => {
      const area = createCircleArea([0, 0], 5);
      const areaRule = createAreaRule(area, "forbid");
      const distanceRule = createDistanceRule(["tree"], 5);
      const undergroundRule = createUndergroundRule(["grass"]);

      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [areaRule, distanceRule, undergroundRule],
      };
      mockRuleResolver.setRuleset(object.type, ruleset);

      const result = await orchestrator.validate(object);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle ruleset resolution errors gracefully", async () => {
      // Don't set any ruleset, so it will throw an error

      const result = await orchestrator.validate(object);

      expect(result).toEqual({
        errors: [],
        highlightedAreas: [],
      });
    });
  });

  describe("edge cases", () => {
    it("should handle object with undefined type", async () => {
      const area = createCircleArea([0, 0], 5);
      const rule = createAreaRule(area, "forbid");
      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [rule],
      };
      mockRuleResolver.setRuleset("", ruleset);

      // Set type to undefined - this should use empty string as type
      object.type = undefined as any;

      const result = await orchestrator.validate(object);

      // Should handle undefined type gracefully and return empty result
      expect(result).toEqual({
        errors: [],
        highlightedAreas: [],
      });
    });

    it("should handle rules with invalid schemas", async () => {
      const invalidRule = {
        subject: "area",
        action: "invalid" as any,
        reason: "test",
      };
      const ruleset: ResolvedRuleset = {
        name: "test",
        tags: ["test"],
        scope: "object",
        transform: [],
        placement: [invalidRule],
      };
      mockRuleResolver.setRuleset(object.type, ruleset);

      const result = await orchestrator.validate(object);

      // Should handle invalid schemas gracefully and skip validation
      expect(result.errors).toHaveLength(0);
    });
  });
});
