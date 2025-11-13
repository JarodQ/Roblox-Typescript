import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import Constants from "./Constants";
import lerp from "Common/shared/Utility/lerp";

const camera = Workspace.CurrentCamera!;
let recoil = new Vector2();
let zoom = 0;

function onRenderStepped(deltaTime: number) {
    camera.CFrame = camera.CFrame.mul(CFrame.Angles(recoil.Y * deltaTime, recoil.X * deltaTime, 0));
    camera.FieldOfView = Constants.RECOIL_DEFAULT_FOV + zoom;

    recoil = recoil.Lerp(Vector2.zero, math.min(deltaTime * Constants.RECOIL_STOP_SPEED, 1));
    zoom = lerp(zoom, 0, math.min(deltaTime * Constants.RECOIL_ZOOM_RETURN_SPEED, 1));
}

const CameraRecoiler = {
    recoil(recoilAmount: Vector2) {
        zoom = 1;
        recoil = recoil.add(recoilAmount);
    },
};

RunService.BindToRenderStep(Constants.RECOIL_BIND_NAME, Enum.RenderPriority.Camera.Value + 2, onRenderStepped);

export = CameraRecoiler;
