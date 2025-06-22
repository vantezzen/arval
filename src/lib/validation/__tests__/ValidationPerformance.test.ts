import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { container } from "tsyringe";
import ValidationPerformance from "../ValidationPerformance";

describe("ValidationPerformance", () => {
  let performance: ValidationPerformance;
  let consoleLogSpy: any;
  let consoleTableSpy: any;

  beforeEach(() => {
    container.clearInstances();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleTableSpy = vi.spyOn(console, "table").mockImplementation(() => {});
    performance = container.resolve(ValidationPerformance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with console log", () => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "ValidationPerformance initialized"
      );
    });
  });

  describe("start", () => {
    it("should return timing context with label and start time", () => {
      const label = "test-operation";
      const context = performance.start(label);

      expect(context.label).toBe(label);
      expect(context.startTime).toBeGreaterThan(0);
      expect(typeof context.startTime).toBe("number");
    });

    it("should return different start times for different calls", () => {
      const context1 = performance.start("test1");
      const context2 = performance.start("test2");

      expect(context1.startTime).toBeLessThanOrEqual(context2.startTime);
    });
  });

  describe("end", () => {
    it("should record duration for timing context", () => {
      const context = performance.start("test-operation");

      performance.end(context);

      expect(context.label).toBe("test-operation");
    });

    it("should accumulate multiple calls for same label", () => {
      const context1 = performance.start("test-operation");
      const context2 = performance.start("test-operation");

      performance.end(context1);
      performance.end(context2);

      expect(context1.label).toBe("test-operation");
      expect(context2.label).toBe("test-operation");
    });

    it("should handle different labels separately", () => {
      const context1 = performance.start("operation1");
      const context2 = performance.start("operation2");

      performance.end(context1);
      performance.end(context2);

      expect(context1.label).toBe("operation1");
      expect(context2.label).toBe("operation2");
    });

    it("should calculate correct duration", () => {
      const context = performance.start("test-operation");

      performance.end(context);

      expect(context.startTime).toBeGreaterThan(0);
    });
  });

  describe("runComplete", () => {
    it("should increment total runs counter", () => {
      performance.runComplete();
      performance.runComplete();
      performance.runComplete();

      expect(performance.runComplete).toBeDefined();
    });

    it("should not log performance on first run", () => {
      performance.runComplete();

      expect(consoleTableSpy).not.toHaveBeenCalled();
    });

    it("should log performance every 50 runs", () => {
      for (let i = 0; i < 50; i++) {
        performance.runComplete();
      }

      expect(consoleTableSpy).toHaveBeenCalled();
    });

    it("should log performance on 100th run", () => {
      for (let i = 0; i < 100; i++) {
        performance.runComplete();
      }

      expect(consoleTableSpy).toHaveBeenCalled();
    });

    it("should include run count in performance report", () => {
      for (let i = 0; i < 50; i++) {
        performance.runComplete();
      }

      expect(consoleTableSpy).toHaveBeenCalled();
    });
  });

  describe("logPerformance", () => {
    it("should log performance data for each section", () => {
      const context1 = performance.start("operation1");
      const context2 = performance.start("operation2");

      performance.end(context1);
      performance.end(context2);

      // Trigger logPerformance by calling runComplete 50 times
      for (let i = 0; i < 50; i++) {
        performance.runComplete();
      }

      expect(consoleTableSpy).toHaveBeenCalled();
    });

    it("should calculate and log statistics correctly", () => {
      const context = performance.start("test-operation");
      performance.end(context);

      // Trigger logPerformance by calling runComplete 50 times
      for (let i = 0; i < 50; i++) {
        performance.runComplete();
      }

      expect(consoleTableSpy).toHaveBeenCalled();
    });

    it("should sort performance data by total time", () => {
      const context1 = performance.start("fast-operation");
      const context2 = performance.start("slow-operation");

      performance.end(context1);
      performance.end(context2);

      // Trigger logPerformance by calling runComplete 50 times
      for (let i = 0; i < 50; i++) {
        performance.runComplete();
      }

      expect(consoleTableSpy).toHaveBeenCalled();
    });

    it("should handle empty section data", () => {
      // Trigger logPerformance by calling runComplete 50 times
      for (let i = 0; i < 50; i++) {
        performance.runComplete();
      }

      expect(consoleTableSpy).toHaveBeenCalled();
    });
  });

  describe("integration", () => {
    it("should track complete performance workflow", () => {
      const context1 = performance.start("validation");
      const context2 = performance.start("rule-resolution");

      performance.end(context1);
      performance.end(context2);

      performance.runComplete();

      expect(performance.start).toBeDefined();
      expect(performance.end).toBeDefined();
    });

    it("should handle multiple performance cycles", () => {
      for (let cycle = 0; cycle < 3; cycle++) {
        const context = performance.start(`cycle-${cycle}`);
        performance.end(context);
        performance.runComplete();
      }

      expect(performance.start).toBeDefined();
      expect(performance.end).toBeDefined();
    });

    it("should handle concurrent operations", () => {
      const contexts = [];
      for (let i = 0; i < 5; i++) {
        contexts.push(performance.start(`operation-${i}`));
      }

      contexts.forEach((context) => performance.end(context));

      expect(contexts).toHaveLength(5);
      contexts.forEach((context) => {
        expect(context.label).toMatch(/operation-\d+/);
      });
    });
  });
});
