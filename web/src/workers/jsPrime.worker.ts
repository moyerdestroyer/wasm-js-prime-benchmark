/// <reference lib="webworker" />

import { calculatePrimes } from '../utils/primes';
import type { WorkerBenchmarkResult, WorkerRequest } from '../types/benchmark';

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
    const startedAt = performance.now();

    try {
        const primes = calculatePrimes(event.data.limit);
        const result: WorkerBenchmarkResult = {
            ok: true,
            time: performance.now() - startedAt,
            primeCount: primes.length,
        };

        self.postMessage(result);
    } catch (error) {
        const result: WorkerBenchmarkResult = {
            ok: false,
            time: performance.now() - startedAt,
            error: error instanceof Error ? error.message : 'Unknown JavaScript benchmark error',
        };

        self.postMessage(result);
    }
};

export {};