import { Players, UserInputService, RunService, Workspace } from "@rbxts/services";

const player = Players.LocalPlayer;
const character = player.Character ?? player.CharacterAdded.Wait()[0];
const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
const humanoid = character.WaitForChild("Humanoid") as Humanoid;

const camera = Workspace.CurrentCamera!;
camera.CameraType = Enum.CameraType.Scriptable;
UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
UserInputService.MouseIconEnabled = false;

let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;


// 🎯 Pitch limits
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
const shoulderOffset = new Vector3(4, 2, 5); // Left, Up, Back

RunService.RenderStepped.Connect(() => {
    const rotation = CFrame.Angles(0, yaw, 0).mul(CFrame.Angles(pitch, 0, 0));
    const pivot = rootPart.Position;

    // ✅ Rotate character horizontally with camera
    const lookDirection = rotation.LookVector;
    const flatDirection = new Vector3(lookDirection.X, 0, lookDirection.Z).Unit;
    rootPart.CFrame = new CFrame(pivot, pivot.add(flatDirection));

    // ✅ Apply offset in rotated space
    const offsetWorld = rotation.VectorToWorldSpace(shoulderOffset);
    const desiredPosition = pivot.add(offsetWorld);

    // ✅ Raycast to avoid clipping
    const rayParams = new RaycastParams();
    rayParams.FilterDescendantsInstances = [character];
    rayParams.FilterType = Enum.RaycastFilterType.Exclude;

    const result = Workspace.Raycast(pivot, desiredPosition.sub(pivot), rayParams);
    const finalPosition = result ? result.Position : desiredPosition;

    // ✅ Look forward from camera position
    //const lookDirection = rotation.LookVector;
    camera.CFrame = new CFrame(finalPosition, finalPosition.add(lookDirection));
});