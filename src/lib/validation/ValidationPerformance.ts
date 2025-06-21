import { singleton } from "tsyringe";

interface TimingContext {
  label: string;
  startTime: number;
}

interface TimingData {
  durations: number[];
  callCount: number;
}

@singleton()
export default class ValidationPerformance {
  private static readonly REPORT_INTERVAL = 50;

  private sectionData: Map<string, TimingData> = new Map();
  private totalRuns = 0;

  constructor() {
    console.log("ValidationPerformance initialized");
  }

  start(label: string): TimingContext {
    return {
      label,
      startTime: performance.now(),
    };
  }

  end(context: TimingContext): void {
    const duration = performance.now() - context.startTime;

    const data = this.sectionData.get(context.label) ?? {
      durations: [],
      callCount: 0,
    };
    data.durations.push(duration);
    data.callCount += 1;
    this.sectionData.set(context.label, data);
  }

  runComplete(): void {
    this.totalRuns += 1;
    if (this.totalRuns % ValidationPerformance.REPORT_INTERVAL === 0) {
      this.logPerformance();
    }
  }

  private logPerformance(): void {
    const tableData = Array.from(this.sectionData.entries()).map(
      ([label, data]) => {
        const total = data.durations.reduce((a, b) => a + b, 0);
        const avg = total / data.durations.length;
        console.log(
          `Performance for ${data.durations.length} runs of "${label}"`
        );

        const min = this.safeMath(data.durations, Math.min);
        const max = this.safeMath(data.durations, Math.max);
        return {
          Label: label,
          Calls: data.callCount,
          "Total (ms)": total,
          "Avg (ms)": avg,
          "Min (ms)": min,
          "Max (ms)": max,
        };
      }
    );

    tableData.sort((a, b) => b["Total (ms)"] - a["Total (ms)"]);

    console.log(
      `\n--- Validation Performance Report (Runs: ${this.totalRuns}) ---`
    );
    console.table(tableData);
  }

  /**
   * Some of the datasets we iterate over are too large to use native unfolding like "Math.max(...array)".
   * This method provides a safe way to perform mathematical operations on arrays by reducing them
   * with a provided operation function.
   *
   * @param numbers Numbers to operate on
   * @param operation The operation to perform on the numbers, e.g. Math.max or Math.min
   * @returns The result of the operation on the numbers
   */
  private safeMath(
    numbers: number[],
    operation: (a: number, b: number) => number
  ): number {
    if (numbers.length === 0) return 0;

    const first = numbers[0];
    return numbers.reduce((acc, num) => operation(acc, num), first);
  }
}
