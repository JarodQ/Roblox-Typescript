throw "This module is disabled temporarily";
import { Players, UserInputService, RunService, Workspace } from "@rbxts/services";
import { Constants } from "Arena/shared/Constants";
import { CameraTilt } from "Arena/client/Camera/CameraTilt";
import { PitchRecoil } from "./PitchRecoil";
import { AdaptiveRecoil } from "./AdaptiveRecoil";
import { ReticleScaler } from "Arena/shared/WeaponSystem/UI/Reticle";

const player = Players.LocalPlayer;
const character = player.Character ?? player.CharacterAdded.Wait()[0];
const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
const humanoid = character.WaitForChild("Humanoid") as Humanoid;

const camera = Workspace.CurrentCamera!;
camera.CameraType = Enum.CameraType.Scriptable;
UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
UserInputService.MouseIconEnabled = false;

//Reticle
const playerGui = player.WaitForChild("PlayerGui");
const reticlGui = playerGui.WaitForChild("ReticleGui");
const mainFrame = reticlGui.WaitForChild("Main") as Frame;
const reticle = mainFrame.WaitForChild("Reticle") as CanvasGroup;

let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

const shoulderOffset = new Vector3(4, 2, 6); // Right, Up, Back

const pitchLimit = {
    up: math.rad(60),
    down: math.rad(80),
};

UserInputService.InputChanged.Connect((input: InputObject) => {
    if (input.UserInputType === Enum.UserInputType.MouseMovement) {
        const deltaY = input.Delta.Y * sensitivity;
        const deltaX = input.Delta.X * sensitivity;

        const proposedPitch = pitch - deltaY;
        if ((pitch > -pitchLimit.up || deltaY < 0) && (pitch < pitchLimit.down || deltaY > 0)) {
            pitch = math.clamp(proposedPitch, -pitchLimit.up, pitchLimit.down);
        }

        yaw -= deltaX;
    }
});

RunService.RenderStepped.Connect((dt) => {
    const rotation = CFrame.Angles(0, yaw, 0).mul(CFrame.Angles(pitch, 0, 0));
    const pivot = rootPart.Position;

    // 🔁 Rotate character to match aim
    const lookDirection = rotation.LookVector;
    const flatDirection = new Vector3(lookDirection.X, 0, lookDirection.Z).Unit;
    rootPart.CFrame = new CFrame(pivot, pivot.add(flatDirection));

    // 🎯 Camera target offset (shoulder follow)
    const offsetWorld = rotation.VectorToWorldSpace(shoulderOffset);
    const desiredPosition = pivot.add(offsetWorld);

    // 🧱 Raycast to prevent clipping
    const rayParams = new RaycastParams();
    rayParams.FilterDescendantsInstances = [character];
    rayParams.FilterType = Enum.RaycastFilterType.Exclude;

    const result = Workspace.Raycast(pivot, desiredPosition.sub(pivot), rayParams);
    const finalPosition = result ? result.Position : desiredPosition;

    // 🔁 Z-axis tilt effect (screen shake)
    CameraTilt.step(dt);
    const zTilt = CameraTilt.get();

    /* PitchRecoil.step(dt);
    const recoilPitch = PitchRecoil.consume();
    pitch += recoilPitch; */
    AdaptiveRecoil.step(dt);
    pitch += AdaptiveRecoil.getTotal();

    ReticleScaler.step(dt, reticle);

    const baseCFrame = new CFrame(finalPosition, finalPosition.add(rotation.LookVector));
    const finalCFrame = baseCFrame.mul(CFrame.Angles(0, 0, zTilt));

    camera.CFrame = finalCFrame;
});