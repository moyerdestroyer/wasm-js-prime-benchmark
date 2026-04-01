import init, { count_primes, type InitOutput } from '../wasm/pkg/prime_wasm';

let wasmInitPromise: Promise<InitOutput> | null = null;

async function ensureWasmInitialized(): Promise<void> {
    if (!wasmInitPromise) {
        wasmInitPromise = init().catch((error) => {
            wasmInitPromise = null;
            throw error;
        });
    }

    await wasmInitPromise;
}

export async function countPrimesWasm(x: number): Promise<number> {
    await ensureWasmInitialized();
    return count_primes(x);
}
