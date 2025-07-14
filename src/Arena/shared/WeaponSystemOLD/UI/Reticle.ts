let currentScale = 1;
let targetScale = 1;
let recoilBoost = 3;
let decaySpeed = 8;
let initialSize: UDim2 | undefined;

export const ReticleScaler = {
    boost() {
        targetScale = 1 + recoilBoost;
        print("currentScale:", currentScale, "targetScale:", targetScale);
    },

    step(dt: number, reticle: GuiObject) {
        if (!initialSize) {
            initialSize = reticle.Size; // Capture once
        }

        currentScale += (targetScale - currentScale) * math.clamp(dt * decaySpeed, 0, 1);
        reticle.Size = new UDim2(
            initialSize.X.Scale * currentScale,
            initialSize.X.Offset * currentScale,
            initialSize.Y.Scale * currentScale,
            initialSize.Y.Offset * currentScale
        );
        targetScale = 1;
    },
};