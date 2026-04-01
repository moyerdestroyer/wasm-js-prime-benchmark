import React, { useEffect, useRef, useState } from 'react';
import type { BenchmarkResults, EngineStatus } from '../types/benchmark';

type BenchmarkPanelProps = {
    inputValue: number | '';
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onStartBenchmark: () => Promise<void>;
    results: BenchmarkResults | null;
    isRunning: boolean;
    jsStatus: EngineStatus;
    wasmStatus: EngineStatus;
};

const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
    inputValue,
    onInputChange,
    onStartBenchmark,
    results,
    isRunning,
    jsStatus,
    wasmStatus,
}) => {
    const [jsLiveMs, setJsLiveMs] = useState(0);
    const [wasmLiveMs, setWasmLiveMs] = useState(0);
    const jsTimerRef = useRef<number | null>(null);
    const wasmTimerRef = useRef<number | null>(null);

    const clearJsTimer = () => {
        if (jsTimerRef.current !== null) {
            window.clearInterval(jsTimerRef.current);
            jsTimerRef.current = null;
        }
    };

    const clearWasmTimer = () => {
        if (wasmTimerRef.current !== null) {
            window.clearInterval(wasmTimerRef.current);
            wasmTimerRef.current = null;
        }
    };

    useEffect(() => {
        if (jsStatus !== 'running') {
            clearJsTimer();
            return;
        }

        setJsLiveMs(0);
        const startedAt = performance.now();
        jsTimerRef.current = window.setInterval(() => {
            setJsLiveMs(performance.now() - startedAt);
        }, 20);

        return () => clearJsTimer();
    }, [jsStatus]);

    useEffect(() => {
        if (wasmStatus !== 'running') {
            clearWasmTimer();
            return;
        }

        setWasmLiveMs(0);
        const startedAt = performance.now();
        wasmTimerRef.current = window.setInterval(() => {
            setWasmLiveMs(performance.now() - startedAt);
        }, 20);

        return () => clearWasmTimer();
    }, [wasmStatus]);

    useEffect(() => {
        return () => {
            clearJsTimer();
            clearWasmTimer();
        };
    }, []);

    const jsDisplayMs = jsStatus === 'running' ? jsLiveMs : results?.jsTime;
    const wasmDisplayMs = wasmStatus === 'running'
        ? wasmLiveMs
        : (results?.wasmTime ?? results?.wasmCheckTime ?? null);

    const formatMs = (value: number | null | undefined) => (typeof value === 'number' ? `${value.toFixed(2)} ms` : '--');

    const jsStatusText =
        jsStatus === 'running'
            ? 'Computing primes in JavaScript...'
            : jsStatus === 'error'
                ? 'JavaScript benchmark failed.'
            : jsStatus === 'done'
                ? 'JavaScript benchmark finished.'
                : 'Ready to start JavaScript benchmark.';

    const wasmStatusText =
        wasmStatus === 'running'
            ? 'Computing primes in WebAssembly...'
            : wasmStatus === 'error'
                ? 'WASM benchmark failed.'
            : wasmStatus === 'unavailable'
                ? 'WASM failed to initialize or execute.'
                : wasmStatus === 'done'
                    ? 'WebAssembly benchmark finished.'
                : 'WASM lane is waiting.';

    const jsStateClass = jsStatus === 'running'
        ? 'is-running'
        : jsStatus === 'done'
            ? 'is-done'
            : jsStatus === 'error'
                ? 'is-unavailable'
                : '';
    const wasmStateClass = wasmStatus === 'running'
        ? 'is-running'
        : wasmStatus === 'unavailable'
            ? 'is-unavailable'
            : wasmStatus === 'error'
                ? 'is-unavailable'
            : wasmStatus === 'done'
                ? 'is-done'
                : '';

    return (
        <div className="panel-shell">
            <div className="panel-header">
                <h2>Benchmark Arena</h2>
                <p>Run prime generation and compare each engine lane in real time.</p>
            </div>

            <div className="control-card">
                <label htmlFor="prime-limit-input">Prime limit</label>
                <div className="control-row">
                    <input
                        id="prime-limit-input"
                        className="prime-input"
                        type="number"
                        value={inputValue}
                        onChange={onInputChange}
                        min={1}
                        placeholder="Try 100000"
                        disabled={isRunning}
                    />
                    <button className="run-button" onClick={onStartBenchmark} disabled={isRunning || inputValue === ''}>
                        {isRunning ? 'Running...' : 'Run Benchmark'}
                    </button>
                </div>
            </div>

            <div className="timer-grid">
                <article className={`lane-card ${jsStateClass}`}>
                    <header>
                        <h3>JavaScript</h3>
                        <span className="status-chip">{jsStatus === 'idle' ? 'READY' : jsStatus.toUpperCase()}</span>
                    </header>
                    <p className="lane-time">{formatMs(jsDisplayMs)}</p>
                    <p className="lane-meta">{jsStatusText}</p>
                    {!isRunning && results?.jsPrimeCount != null && (
                        <p className="lane-detail">Primes found: {results.jsPrimeCount.toLocaleString()}</p>
                    )}
                    {results?.jsErrorMessage && <p className="lane-detail">Error: {results.jsErrorMessage}</p>}
                </article>

                <article className={`lane-card ${wasmStateClass}`}>
                    <header>
                        <h3>WASM</h3>
                        <span className="status-chip">{wasmStatus === 'idle' ? 'READY' : wasmStatus.toUpperCase()}</span>
                    </header>
                    <p className="lane-time">{formatMs(wasmDisplayMs)}</p>
                    <p className="lane-meta">{wasmStatusText}</p>
                    {!isRunning && results && results.wasmPrimeCount != null && (
                        <p className="lane-detail">Primes found: {results.wasmPrimeCount.toLocaleString()}</p>
                    )}
                    {!isRunning && results && results.wasmPrimeCount === null && (wasmStatus === 'unavailable' || wasmStatus === 'error') && (
                        <p className="lane-detail">Prime count unavailable</p>
                    )}
                </article>
            </div>

            {results && (
                <div className="results-card">
                    <h3>Result Snapshot</h3>
                    <p>JavaScript lane: {results.jsErrorMessage ? 'Execution failed' : formatMs(results.jsTime)}</p>
                    <p>
                        WASM lane: {results.wasmTime === null ? 'Execution unavailable' : formatMs(results.wasmTime)}
                    </p>
                    {results.jsErrorMessage && <p>JavaScript error: {results.jsErrorMessage}</p>}
                    {!results.wasmAvailable && (
                        <p>
                            WASM error: {results.wasmErrorMessage ?? 'Unknown initialization failure'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BenchmarkPanel;