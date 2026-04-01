import React, { useEffect, useRef, useState } from 'react';
import BenchmarkPanel from './components/BenchmarkPanel';
import type { BenchmarkResults, EngineStatus } from './types/benchmark';
import { runWorkerBenchmark } from './utils/runWorkerBenchmark';

const createJsWorker = () => new Worker(new URL('./workers/jsPrime.worker.ts', import.meta.url), { type: 'module' });

const createWasmWorker = () => new Worker(new URL('./workers/wasmPrime.worker.ts', import.meta.url), { type: 'module' });

const emptyResults = (): BenchmarkResults => ({
    jsTime: null,
    wasmTime: null,
    wasmCheckTime: null,
    jsPrimeCount: null,
    wasmPrimeCount: null,
    wasmAvailable: true,
    wasmErrorMessage: null,
    jsErrorMessage: null,
});

const App: React.FC = () => {
    const [inputValue, setInputValue] = useState<number | ''>('');
    const [results, setResults] = useState<BenchmarkResults | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [jsStatus, setJsStatus] = useState<EngineStatus>('idle');
    const [wasmStatus, setWasmStatus] = useState<EngineStatus>('idle');
    const workersRef = useRef<Worker[]>([]);
    const activeRunIdRef = useRef(0);

    const terminateWorkers = () => {
        workersRef.current.forEach((worker) => worker.terminate());
        workersRef.current = [];
    };

    useEffect(() => terminateWorkers, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value === '' ? '' : Number(value));
    };

    const startBenchmark = async () => {
        if (typeof inputValue !== 'number' || inputValue <= 0) return;

        terminateWorkers();

        const runId = activeRunIdRef.current + 1;
        activeRunIdRef.current = runId;
        const limit = inputValue;
        const jsWorker = createJsWorker();
        const wasmWorker = createWasmWorker();

        workersRef.current = [jsWorker, wasmWorker];
        setResults(emptyResults());
        setIsRunning(true);
        setJsStatus('running');
        setWasmStatus('running');

        const applyIfCurrent = (callback: () => void) => {
            if (activeRunIdRef.current !== runId) {
                return;
            }

            callback();
        };

        const jsPromise = runWorkerBenchmark(jsWorker, limit)
            .then((result) => {
                applyIfCurrent(() => {
                    if (result.ok) {
                        setResults((previous) => ({
                            ...(previous ?? emptyResults()),
                            jsTime: result.time,
                            jsPrimeCount: result.primeCount,
                            jsErrorMessage: null,
                        }));
                        setJsStatus('done');
                        return;
                    }

                    setResults((previous) => ({
                        ...(previous ?? emptyResults()),
                        jsTime: result.time,
                        jsErrorMessage: result.error,
                    }));
                    setJsStatus('error');
                });
            })
            .catch((error) => {
                applyIfCurrent(() => {
                    setResults((previous) => ({
                        ...(previous ?? emptyResults()),
                        jsErrorMessage: error instanceof Error ? error.message : 'Unknown JavaScript benchmark error',
                    }));
                    setJsStatus('error');
                });
            });

        const wasmPromise = runWorkerBenchmark(wasmWorker, limit)
            .then((result) => {
                applyIfCurrent(() => {
                    if (result.ok) {
                        setResults((previous) => ({
                            ...(previous ?? emptyResults()),
                            wasmTime: result.time,
                            wasmCheckTime: null,
                            wasmPrimeCount: result.primeCount,
                            wasmAvailable: true,
                            wasmErrorMessage: null,
                        }));
                        setWasmStatus('done');
                        return;
                    }

                    setResults((previous) => ({
                        ...(previous ?? emptyResults()),
                        wasmTime: null,
                        wasmCheckTime: result.time,
                        wasmPrimeCount: null,
                        wasmAvailable: false,
                        wasmErrorMessage: result.error,
                    }));
                    setWasmStatus('unavailable');
                });
            })
            .catch((error) => {
                applyIfCurrent(() => {
                    setResults((previous) => ({
                        ...(previous ?? emptyResults()),
                        wasmAvailable: false,
                        wasmErrorMessage: error instanceof Error ? error.message : 'Unknown WASM benchmark error',
                    }));
                    setWasmStatus('unavailable');
                });
            });

        await Promise.allSettled([jsPromise, wasmPromise]);

        applyIfCurrent(() => {
            setIsRunning(false);
            terminateWorkers();
        });
    };

    return (
        <div>
            <h1>Prime Number Benchmark</h1>
            <BenchmarkPanel
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onStartBenchmark={startBenchmark}
                results={results}
                isRunning={isRunning}
                jsStatus={jsStatus}
                wasmStatus={wasmStatus}
            />
        </div>
    );
};

export default App;