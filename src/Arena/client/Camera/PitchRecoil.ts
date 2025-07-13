// PitchRecoil.ts
let addedPitch = 0;

export const PitchRecoil = {
    apply(amount: number) {
        addedPitch += amount;
    },

    step(dt: number) {
        // No smoothing! We let pitch accumulate
    },

    consume(): number {
        const out = addedPitch;
        addedPitch = 0;
        return out;
    },
};