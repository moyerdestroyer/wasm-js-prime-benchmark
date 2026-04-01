# Prime benchmark (JavaScript vs WebAssembly)

Small React app that benchmarks how long it takes **JavaScript** and **Rust/WebAssembly** to count primes up to a limit you choose. Each engine runs in its own **Web Worker** so the UI stays responsive.

## Live demo

**[https://moyerdestroyer.github.io/wasm-js-prime-benchmark/](https://moyerdestroyer.github.io/wasm-js-prime-benchmark/)**

(If you fork this repo, your URL will be `https://<user>.github.io/<repo>/` once Pages is enabled.)

## Project structure

```
├── .github/workflows/deploy-pages.yml   # GitHub Pages deploy (build WASM + Vite)
├── wasm/                                # Rust crate → wasm-pack output
│   ├── src/lib.rs
│   └── Cargo.toml
├── web/                                 # Vite + React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/BenchmarkPanel.tsx
│   │   ├── types/benchmark.ts
│   │   ├── utils/primes.ts              # JS prime logic
│   │   ├── utils/wasmPrimes.ts         # WASM init + count API
│   │   ├── utils/runWorkerBenchmark.ts
│   │   ├── workers/jsPrime.worker.ts
│   │   ├── workers/wasmPrime.worker.ts
│   │   └── wasm/pkg/                   # wasm-pack bundle (committed for clone-and-run)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json                         # Root scripts (WASM build + delegate to web)
└── README.md
```

## Local setup

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   npm ci
   npm ci --prefix web
   ```

2. **Develop** (compiles WASM, then starts Vite on port 3000)

   ```bash
   npm run start
   ```

   Open [http://localhost:3000](http://localhost:3000).

3. **Production build** (from repo root)

   ```bash
   npm run build
   ```

   Output is in `web/dist/`. For a subdirectory deploy (e.g. GitHub project pages), set `BASE_PATH` when building:

   ```bash
   BASE_PATH=/your-repo-name/ npm run build
   ```

4. **Preview the production build**

   ```bash
   npm run serve
   ```

## Usage

- Enter a positive integer as the upper bound.
- Click **Start benchmark**. Two workers run in parallel: one runs the JS implementation, the other loads WASM and runs the Rust code.
- The UI shows **elapsed time** and **how many primes** were found for each side (not the full list of primes).

## How it works

- **JavaScript:** prime sieve-style logic in `web/src/utils/primes.ts`, executed in `jsPrime.worker.ts`.
- **WebAssembly:** Rust in `wasm/src/lib.rs`, built with **wasm-pack** (`count_primes` / `calculate_primes`), loaded in `wasmPrime.worker.ts` via `wasmPrimes.ts`.
- **GitHub Pages:** workflow `.github/workflows/deploy-pages.yml` installs Rust (`wasm32-unknown-unknown`), runs `npm run build`, and publishes `web/dist`. In the repo **Settings → Pages**, set **Source** to **GitHub Actions** (required before deploy succeeds). For a site at the domain root (e.g. a `username.github.io` repo), set repository variable **`PAGES_BASE_PATH`** to `/` instead of the default `/repo-name/`.

## Contributing

Pull requests and issues are welcome.
