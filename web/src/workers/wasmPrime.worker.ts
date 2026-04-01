/// <reference lib="webworker" />

import { countPrimesWasm } from '../utils/wasmPrimes';
import type { WorkerBenchmarkResult, WorkerRequest } from '../types/benchmark';

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const startedAt = performance.now();

    try {
        const primeCount = await countPrimesWasm(event.data.limit);
        const result: WorkerBenchmarkResult = {
            ok: true,
            time: performance.now() - startedAt,
            primeCount,
        };

        self.postMessage(result);
    } catch (error) {
        const result: WorkerBenchmarkResult = {
            ok: false,
            time: performance.now() - startedAt,
            error: error instanceof Error ? error.message : 'Unknown WASM benchmark error',
        };

        self.postMessage(result);
    }
};

export {};