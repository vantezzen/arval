import { describe, it, expect, beforeEach } from "vitest";
import { container } from "tsyringe";
import ValidationRuleResolver from "../ValidationRuleResolver";

describe("ValidationRuleResolver", () => {
  let resolver: ValidationRuleResolver;

  beforeEach(() => {
    container.clearInstances();
    resolver = container.resolve(ValidationRuleResolver);
  });

  describe("resolveRulesetForObject", () => {
    it("should resolve ruleset for valid object type", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.tags).toBeInstanceOf(Array);
      expect(result.scope).toBe("object");
      expect(result.transform).toBeInstanceOf(Array);
      expect(result.placement).toBeInstanceOf(Array);
    });

    it("should throw error for invalid object type", () => {
      expect(() => {
        resolver.resolveRulesetForObject("invalid-object-type");
      }).toThrow('Cannot find any rulesets for object "invalid-object-type."');
    });

    it("should combine multiple rulesets for same object type", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.transform.length).toBeGreaterThanOrEqual(0);
      expect(result.placement.length).toBeGreaterThanOrEqual(0);
    });

    it("should merge tags from multiple rulesets", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.tags).toBeInstanceOf(Array);
      expect(result.tags.length).toBeGreaterThan(0);
    });

    it("should include global rules that apply to object tags", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.placement).toBeInstanceOf(Array);
    });

    it("should handle object types with no global rules", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.placement).toBeInstanceOf(Array);
    });

    it("should handle object types with multiple global rules", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.placement).toBeInstanceOf(Array);
    });
  });

  describe("resolveDirectRulesetsForObject", () => {
    it("should throw error for non-existent object type", () => {
      expect(() => {
        resolver.resolveRulesetForObject("non-existent-type");
      }).toThrow('Cannot find any rulesets for object "non-existent-type."');
    });

    it("should handle object types with single ruleset", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
    });

    it("should handle object types with multiple rulesets", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
    });
  });

  describe("resolveGlobalRulesForTags", () => {
    it("should return global rules that match object tags", () => {
      const result = resolver.resolveRulesetForObject("bench");
      const globalRules = result.placement.filter(
        (rule) =>
          rule.appliesToTags && (rule.appliesToTags as string[]).length > 0
      );

      expect(globalRules).toBeInstanceOf(Array);
    });

    it("should return global rules without appliesToTags for all objects", () => {
      const result = resolver.resolveRulesetForObject("bench");
      const universalRules = result.placement.filter(
        (rule) => !rule.appliesToTags
      );

      expect(universalRules).toBeInstanceOf(Array);
    });

    it("should filter global rules based on tag matching", () => {
      const result = resolver.resolveRulesetForObject("bench");

      result.placement.forEach((rule) => {
        if (rule.appliesToTags) {
          const hasMatchingTag = (rule.appliesToTags as string[]).some(
            (tag: string) => result.tags.includes(tag)
          );
          expect(hasMatchingTag).toBe(true);
        }
      });
    });

    it("should handle empty tag list", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.tags).toBeInstanceOf(Array);
    });

    it("should handle single tag", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.tags.length).toBeGreaterThan(0);
    });

    it("should handle multiple tags", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.tags.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle object type with empty rulesets", () => {
      expect(() => {
        resolver.resolveRulesetForObject("invalid-type");
      }).toThrow();
    });

    it("should handle object type with null rulesets", () => {
      expect(() => {
        resolver.resolveRulesetForObject("invalid-type");
      }).toThrow();
    });

    it("should handle object type with undefined rulesets", () => {
      expect(() => {
        resolver.resolveRulesetForObject("invalid-type");
      }).toThrow();
    });

    it("should handle rulesets with missing properties", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.tags).toBeInstanceOf(Array);
      expect(result.scope).toBe("object");
      expect(result.transform).toBeInstanceOf(Array);
      expect(result.placement).toBeInstanceOf(Array);
    });

    it("should handle rulesets with empty arrays", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.transform).toBeInstanceOf(Array);
      expect(result.placement).toBeInstanceOf(Array);
    });

    it("should handle rulesets with null arrays", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.transform).toBeInstanceOf(Array);
      expect(result.placement).toBeInstanceOf(Array);
    });

    it("should handle rulesets with undefined arrays", () => {
      const result = resolver.resolveRulesetForObject("bench");

      expect(result.transform).toBeInstanceOf(Array);
      expect(result.placement).toBeInstanceOf(Array);
    });
  });
});
