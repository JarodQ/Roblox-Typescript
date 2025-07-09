import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { Constants } from "shared/Weapon/Constants";
import { lerp } from "shared/Utility/lerp";

const camera = Workspace.CurrentCamera!;
let recoil = new Vector2(0, 0);
let zoom = 0;

/**
 * Applies recoil and zoom effects to the camera each frame.
 */
function onRenderStepped(deltaTime: number): void {
    camera.CFrame = camera.CFrame.mul(CFrame.Angles(recoil.Y * deltaTime, recoil.X * deltaTime, 0));
    camera.FieldOfView = Constants.RECOIL_DEFAULT_FOV + zoom;

    recoil = recoil.Lerp(Vector2.zero, math.min(deltaTime * Constants.RECOIL_STOP_SPEED, 1));
    zoom = lerp(zoom, 0, math.min(deltaTime * Constants.RECOIL_ZOOM_RETURN_SPEED, 1));
}

const CameraRecoiler = {
    /**
     * Applies a recoil impulse to the camera.
     * @param recoilAmount - The amount of recoil to apply
     */
    recoil(recoilAmount: Vector2): void {
        zoom = 1;
        recoil = recoil.add(recoilAmount);
    },
};

RunService.BindToRenderStep(
    Constants.RECOIL_BIND_NAME,
    Enum.RenderPriority.Camera.Value + 1,
    onRenderStepped,
);

export = CameraRecoiler;