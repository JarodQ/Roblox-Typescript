/**
 * Linearly interpolates between two numbers.
 *
 * @param a - The start value
 * @param b - The end value
 * @param t - The interpolation factor (0 to 1)
 * @returns The interpolated number
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}