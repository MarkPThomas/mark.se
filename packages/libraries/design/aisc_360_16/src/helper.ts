export function divide(numerator: number, denominator: number, fallback: number) {
  return denominator ? numerator / denominator : fallback;
}