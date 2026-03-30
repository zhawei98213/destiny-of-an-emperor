export type PerformanceIssueKind = "runtime" | "resource" | "import";

export interface PerformanceStepSample {
  id: string;
  label: string;
  issueKind: PerformanceIssueKind;
  durationMs: number;
}

export interface PerformanceMetricSample {
  id: string;
  label: string;
  issueKind: PerformanceIssueKind;
  durationMs: number;
  steps: PerformanceStepSample[];
  notes?: string[];
}

export interface PerformanceMetricSummary {
  id: string;
  label: string;
  issueKind: PerformanceIssueKind;
  iterations: number;
  averageMs: number;
  minMs: number;
  maxMs: number;
  steps: Array<{
    id: string;
    label: string;
    issueKind: PerformanceIssueKind;
    averageMs: number;
    maxMs: number;
  }>;
}

function nowMs(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function roundMs(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, entry) => sum + entry, 0) / values.length;
}

export function createPerformanceRecorder(
  metricId: string,
  label: string,
  issueKind: PerformanceIssueKind,
) {
  const startedAt = nowMs();
  const steps: PerformanceStepSample[] = [];

  return {
    measure<T>(
      stepId: string,
      stepLabel: string,
      stepKind: PerformanceIssueKind,
      action: () => T,
    ): T {
      const stepStartedAt = nowMs();
      try {
        return action();
      } finally {
        steps.push({
          id: stepId,
          label: stepLabel,
          issueKind: stepKind,
          durationMs: roundMs(nowMs() - stepStartedAt),
        });
      }
    },

    async measureAsync<T>(
      stepId: string,
      stepLabel: string,
      stepKind: PerformanceIssueKind,
      action: () => Promise<T>,
    ): Promise<T> {
      const stepStartedAt = nowMs();
      try {
        return await action();
      } finally {
        steps.push({
          id: stepId,
          label: stepLabel,
          issueKind: stepKind,
          durationMs: roundMs(nowMs() - stepStartedAt),
        });
      }
    },

    finish(notes?: string[]): PerformanceMetricSample {
      return {
        id: metricId,
        label,
        issueKind,
        durationMs: roundMs(nowMs() - startedAt),
        steps: [...steps],
        notes,
      };
    },
  };
}

export function summarizePerformanceMetricSamples(
  metricId: string,
  samples: PerformanceMetricSample[],
): PerformanceMetricSummary {
  const firstSample = samples[0];
  if (!firstSample) {
    throw new Error(`Performance metric "${metricId}" has no samples.`);
  }

  const stepMap = new Map<string, PerformanceMetricSummary["steps"][number]>();
  samples.forEach((sample) => {
    sample.steps.forEach((step) => {
      const current = stepMap.get(step.id);
      if (!current) {
        stepMap.set(step.id, {
          id: step.id,
          label: step.label,
          issueKind: step.issueKind,
          averageMs: step.durationMs,
          maxMs: step.durationMs,
        });
        return;
      }

      current.averageMs += step.durationMs;
      current.maxMs = Math.max(current.maxMs, step.durationMs);
    });
  });

  const steps = [...stepMap.values()]
    .map((step) => ({
      ...step,
      averageMs: roundMs(step.averageMs / samples.length),
      maxMs: roundMs(step.maxMs),
    }))
    .sort((left, right) => right.averageMs - left.averageMs);

  const durations = samples.map((sample) => sample.durationMs);
  return {
    id: firstSample.id,
    label: firstSample.label,
    issueKind: firstSample.issueKind,
    iterations: samples.length,
    averageMs: roundMs(average(durations)),
    minMs: roundMs(Math.min(...durations)),
    maxMs: roundMs(Math.max(...durations)),
    steps,
  };
}
