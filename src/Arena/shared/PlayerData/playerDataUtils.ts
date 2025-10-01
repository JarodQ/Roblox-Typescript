export function getTrueFlags<T extends object>(flags: T): (keyof T)[] {
    const result: (keyof T)[] = [];

    for (const [key, value] of pairs(flags)) {
        if (typeIs(value, "boolean") && value === true) {
            result.push(key as keyof T);
        }
    }

    return result;
}
