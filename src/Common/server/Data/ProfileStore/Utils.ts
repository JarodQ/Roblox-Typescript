
// Util.ts

export function DeepCopyTable<T extends object>(t: T): T {
    const copy = {} as T;
    for (const [key, value] of pairs(t)) {
        if (typeOf(value) === "table") {
            copy[key as keyof T] = DeepCopyTable(value as object) as T[keyof T];
        } else {
            copy[key as keyof T] = value as T[keyof T];
        }
    }
    return copy;
}


export function ReconcileTable(
    target: Record<string, unknown>,
    template: Record<string, unknown>,
) {
    for (const [k, v] of pairs(template)) {
        if (typeOf(k) === "string") {
            if (target[k] === undefined) {
                if (typeOf(v) === "table") {
                    target[k] = DeepCopyTable(v as Record<string | number, unknown>);
                } else {
                    target[k] = v;
                }
            } else if (typeOf(target[k]) === "table" && typeOf(v) === "table") {
                ReconcileTable(
                    target[k] as Record<string, unknown>,
                    v as Record<string, unknown>,
                );
            }
        }
    }
}
