let recoilOffset = 0;
let adjustOffset = 0;

export const AdaptiveRecoil = {
    apply(amount: number) {
        recoilOffset += amount;
        adjustOffset += amount * 0.3; // tweak this: how much is “readjusted”
    },

    step(dt: number) {
        // Smooth decay of recoil, followed by subtle readjustment
        recoilOffset = recoilOffset + (0 - recoilOffset) * math.clamp(dt * 6, 0, 1);
        adjustOffset = adjustOffset + (0 - adjustOffset) * math.clamp(dt * 2, 0, 1);
    },

    getTotal(): number {
        return recoilOffset - adjustOffset;
    },
};