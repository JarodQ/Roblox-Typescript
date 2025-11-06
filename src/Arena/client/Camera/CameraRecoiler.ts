import { Workspace } from "@rbxts/services";
import { Constants } from "Arena/shared/Constants";
import lerp from "Common/shared/Utility/lerp"

// 🔫 Internal camera recoil state
let recoil = new Vector2(0, 0);
let zoom = 0;

// 📌 Screen-space offset for target aiming
let offset = new Vector2(0, 0);

export const CameraRecoiler = {
    // 💥 Apply raw angular recoil
    recoil(amount: Vector2) {
        zoom = 1;
        recoil = recoil.add(amount);
    },

    step(deltaTime: number) {
        recoil = recoil.Lerp(Vector2.zero, math.min(deltaTime * Constants.RECOIL_STOP_SPEED, 1));
        zoom = lerp(zoom, 0, math.min(deltaTime * Constants.RECOIL_ZOOM_RETURN_SPEED, 1));
    },

    getRecoil() {
        return recoil;
    },

    getZoom() {
        return zoom;
    },
};


export const RecoilOffset = {
    add(delta: Vector2) {
        offset = offset.add(delta);
    },

    step(dt: number) {
        offset = offset.Lerp(Vector2.zero, math.min(dt * 5, 1));
    },

    get() {
        return offset;
    },
};

