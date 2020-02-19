export function sigmoid(x) {
  return 1.0 / (1.0 + Math.pow(Math.E, -4.9 * x));
}

export function relu(x) {
  return x > 0 ? x : x / 2;
}