// This file contains the Rust code for the WebAssembly library. It exports a function `calculate_primes` that takes a number "X" and returns a vector of all prime numbers up to "X".

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn count_primes(x: u32) -> u32 {
    (2..=x).filter(|&n| is_prime(n)).count() as u32
}

#[wasm_bindgen]
pub fn calculate_primes(x: u32) -> Vec<u32> {
    let mut primes = Vec::new();
    for num in 2..=x {
        if is_prime(num) {
            primes.push(num);
        }
    }
    primes
}

fn is_prime(n: u32) -> bool {
    if n < 2 {
        return false;
    }
    for i in 2..=((n as f64).sqrt() as u32) {
        if n % i == 0 {
            return false;
        }
    }
    true
}