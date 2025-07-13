let currentTilt = 0;
let targetTilt = 0;
let isFiring = false;
let fireDuration = 0.2; // Default fire rate duration (seconds)

export const CameraTilt = {
    // Called when firing starts
    setTarget(tilt: number, duration: number) {
        isFiring = true;
        fireDuration = duration;
        targetTilt = tilt;
    },

    // Called when firing stops
    reset() {
        isFiring = false;
        targetTilt = 0;
    },

    step(dt: number) {
        const lerpSpeed = isFiring ? 1 / fireDuration : 5;
        currentTilt = currentTilt + (targetTilt - currentTilt) * math.clamp(dt * lerpSpeed, 0, 1);
    },

    get() {
        return currentTilt;
    },
};