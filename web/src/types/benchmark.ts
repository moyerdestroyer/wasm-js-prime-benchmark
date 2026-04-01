export type BenchmarkResults = {
    jsTime: number | null;
    wasmTime: number | null;
    wasmCheckTime: number | null;
    jsPrimeCount: number | null;
    wasmPrimeCount: number | null;
    wasmAvailable: boolean;
    wasmErrorMessage: string | null;
    jsErrorMessage: string | null;
};

export type EngineStatus = 'idle' | 'running' | 'done' | 'unavailable' | 'error';

export type WorkerRequest = {
    limit: number;
};

export type WorkerSuccessResult = {
    ok: true;
    time: number;
    primeCount: number;
};

export type WorkerErrorResult = {
    ok: false;
    time: number;
    error: string;
};

export type WorkerBenchmarkResult = WorkerSuccessResult | WorkerErrorResult;