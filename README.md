# Prime Benchmark App

This project is a web application that benchmarks the performance of JavaScript and WebAssembly in calculating prime numbers up to a user-defined number "X". The application allows users to input a number, start the benchmark, and visually compare the execution times of both implementations.

## Project Structure

```
prime-benchmark-app
├── web
│   ├── src
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components
│   │   │   └── BenchmarkPanel.tsx
│   │   └── utils
│   │       └── primes.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── wasm
│   ├── src
│   │   └── lib.rs
│   └── Cargo.toml
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd prime-benchmark-app
   ```

2. **Install dependencies for the web application:**
   ```
   cd web
   npm install
   ```

3. **Build and run from the repository root:**
   ```
   npm run start
   ```

4. **Create a production build:**
   ```
   npm run build
   ```

These commands compile the Rust crate into web-ready wasm-bindgen artifacts first, then run Vite.

## Usage

- Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).
- Input a number "X" in the provided field.
- Click the "Start Benchmark" button to begin the calculations.
- The application will display the prime numbers calculated by both JavaScript and WebAssembly, along with the time taken for each process.

## Functionality Overview

- **JavaScript Implementation:** Utilizes a simple algorithm to calculate prime numbers up to "X".
- **WebAssembly Implementation:** Written in Rust, compiled with wasm-pack, and loaded directly by the Vite React frontend.
- **Benchmarking:** The application measures and displays the time taken by both implementations, allowing users to compare their performance visually.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.