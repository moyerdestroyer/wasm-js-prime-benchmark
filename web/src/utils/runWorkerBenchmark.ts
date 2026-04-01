import type { WorkerBenchmarkResult, WorkerRequest } from '../types/benchmark';

export function runWorkerBenchmark(worker: Worker, limit: number): Promise<WorkerBenchmarkResult> {
    return new Promise((resolve, reject) => {
        const cleanup = () => {
            worker.onmessage = null;
            worker.onerror = null;
            worker.onmessageerror = null;
        };

        worker.onmessage = (event: MessageEvent<WorkerBenchmarkResult>) => {
            cleanup();
            resolve(event.data);
        };

        worker.onerror = (event) => {
            cleanup();
            reject(new Error(event.message || 'Worker execution failed'));
        };

        worker.onmessageerror = () => {
            cleanup();
            reject(new Error('Worker returned an unreadable message'));
        };

        const request: WorkerRequest = { limit };
        worker.postMessage(request);
    });
}