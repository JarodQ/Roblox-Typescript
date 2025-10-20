import { Players, Workspace, RunService, ContextActionService, ReplicatedStorage } from "@rbxts/services";
import { GuiElements, setPlayersItems } from "GardenWars/shared/Shop/guiManager";
import { getPREFAB } from "GardenWars/shared/PREFABS";
import { setupGui } from "GardenWars/shared/Shop/guiManager";
import { getPreviewModel } from "GardenWars/shared/Shop/shopModelController";


// const player: Player = Players.LocalPlayer;
// const playerGuis = player.WaitForChild("PlayerGui") as PlayerGui;
// const playerShop = playerGuis.WaitForChild("Shop") as ScreenGui;



const player = Players.LocalPlayer;
const playerGui = player.WaitForChild("PlayerGui");
const shopGui = playerGui.WaitForChild("ShopV2") as ScreenGui;
const tweenFrame = shopGui.WaitForChild("TweenFrame") as Frame;
const camera = Workspace.CurrentCamera!;
const shopScene = Workspace.WaitForChild("ShopScene");
const shopCamera = shopScene.WaitForChild("shopCamera") as BasePart;
const placeItem = shopScene.WaitForChild("PlaceItem") as BasePart;
const spotLight = shopCamera.WaitForChild("SpotLight") as SpotLight;
const proximityPrompt = shopCamera.WaitForChild("ProximityPrompt") as ProximityPrompt;
setupGui(player, shopGui);

//Rotation logic
let dragging = false;
let lastPosition = new Vector2();
let storeActive = false;
let currentPitch = 0; // in radians
const minPitch = math.rad(-45); // lower limit
const maxPitch = math.rad(45);  // upper limit
let angularVelocity = new Vector2(0, 0); // X = yaw, Y = pitch
const maxSpeed = .2;//2; // radians per frame
const damping = 0.95; // momentum decay

// 🔒 Hide other players
function hideOtherPlayers() {
    for (const otherPlayer of Players.GetPlayers()) {
        if (otherPlayer !== player) {
            const char = otherPlayer.Character;
            if (char) {
                for (const part of char.GetDescendants()) {
                    if (part.IsA("BasePart") || part.IsA("Decal")) {
                        part.Transparency = 1;
                    }
                }
            }
        }
    }
}

// 🌀 Rotation logic bound via ContextActionService
function handleMouseInput(
    actionName: string,
    inputState: Enum.UserInputState,
    input: InputObject,
) {
    if (!storeActive) return Enum.ContextActionResult.Pass;

    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        if (inputState === Enum.UserInputState.Begin) {
            dragging = true;
            lastPosition = new Vector2(input.Position.X, input.Position.Y);
        } else if (inputState === Enum.UserInputState.End) {
            dragging = false;
        }
    }

    if (input.UserInputType === Enum.UserInputType.MouseMovement && dragging) {
        const currentPosition = new Vector2(input.Position.X, input.Position.Y);
        const delta = currentPosition.sub(lastPosition);
        lastPosition = currentPosition;

        // Clamp speed
        const clampedDelta = new Vector2(
            math.clamp(delta.X * 0.01, -maxSpeed, maxSpeed),
            math.clamp(delta.Y * 0.01, -maxSpeed, maxSpeed),
        );

        angularVelocity = clampedDelta;
    }

    return Enum.ContextActionResult.Sink;
}

let previewModel = shopScene.WaitForChild("PreviewModel") as Model;
// export function switchModel(instance: Instance, guiElements: GuiElements) {
//     const modelFolder = getPREFAB("Shop", "Models") as Folder;
//     const itemString = instance.GetAttribute("Item") as string;
//     if (!itemString) return;
//     const newModel = modelFolder.FindFirstChild(itemString) as Model;
//     if (!newModel) return;

//     if (previewModel) previewModel.Destroy();
//     previewModel = newModel.Clone();
//     previewModel.Name = "PreviewModel";
//     previewModel.MoveTo(placeItem.Position);
//     previewModel.Parent = Workspace;

// }
// 🧭 Apply rotation each frame
// let previewModel;

RunService.RenderStepped.Connect(() => {
    if (!storeActive || angularVelocity.Magnitude < 0.001) return;

    const previewModel = getPreviewModel();
    if (!previewModel) return;
    const primary = previewModel.PrimaryPart;
    if (!primary) return;

    const center = primary.Position;
    const currentPivot = previewModel.GetPivot();

    // Calculate new pitch and clamp it
    let newPitch = currentPitch + angularVelocity.Y;
    newPitch = math.clamp(newPitch, minPitch, maxPitch);
    const pitchDelta = newPitch - currentPitch;
    currentPitch = newPitch;

    // Apply rotation
    const yaw = CFrame.Angles(0, angularVelocity.X, 0);
    const pitch = CFrame.Angles(pitchDelta, 0, 0);
    const rotation = yaw.mul(pitch);

    const newPivot = new CFrame(center).mul(rotation).mul(currentPivot.sub(center));
    previewModel.PivotTo(newPivot);

    // Apply damping
    angularVelocity = angularVelocity.mul(damping);
});

// 🎥 Activate store scene and bind input
function activateStoreScene() {
    storeActive = true;
    tweenFrame.Visible = true;
    spotLight.Enabled = true;
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.CFrame = shopCamera.CFrame;
    hideOtherPlayers();

    // 🌫️ Add blur effect
    // print("CurrentCamera is:", Workspace.CurrentCamera?.ClassName);
    // task.delay(0.1, () => {
    //     const blur = new Instance("BlurEffect");
    //     blur.Size = 12;
    //     blur.Name = "ShopBlur";
    //     blur.Parent = Workspace.CurrentCamera!;
    // });

    ContextActionService.BindAction(
        "RotatePreviewModel",
        handleMouseInput,
        false,
        Enum.UserInputType.MouseButton1,
        Enum.UserInputType.MouseMovement,
    );
}

// 🎯 Triggered by proximity prompt
proximityPrompt.Triggered.Connect(() => {
    activateStoreScene();
    setPlayersItems(player, shopGui);
});




// const player = Players.LocalPlayer;
// const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
// const shopGui = playerGui.WaitForChild("ShopV2") as ScreenGui;
// const tweenFrame = shopGui.WaitForChild("TweenFrame") as Frame;
// const viewport = tweenFrame.WaitForChild("ViewportFrame") as ViewportFrame;
// const shopScene = Workspace.WaitForChild("ShopScene");
// const shopCamera = shopScene.WaitForChild("ShopPrompt") as BasePart;
// const proximityPrompt = shopCamera.WaitForChild("ProximityPrompt") as ProximityPrompt;


// const viewportCamera = new Instance("Camera");
// viewportCamera.Name = "ShopCamera";
// viewportCamera.CFrame = shopCamera.CFrame; // Position camera 10 studs away
// viewport.CurrentCamera = viewportCamera;
// viewportCamera.Parent = viewport;


// // Clone model into viewport
// const originalModel = getPREFAB("Shop", "Models") as Folder;
// const previewModel = originalModel.FindFirstChild("maizeMauler")!.Clone() as Model;
// previewModel.Parent = viewport;
// previewModel.PivotTo(CFrame.identity);

// let dragging = false;
// let lastPosition = new Vector2();
// let storeActive = false;
// let currentPitch = 0;
// const minPitch = math.rad(-45);
// const maxPitch = math.rad(45);
// let angularVelocity = new Vector2(0, 0);
// const maxSpeed = 0.2;
// const damping = 0.95;

// function handleMouseInput(
//     actionName: string,
//     inputState: Enum.UserInputState,
//     input: InputObject,
// ) {
//     if (!storeActive) return Enum.ContextActionResult.Pass;

//     if (input.UserInputType === Enum.UserInputType.MouseButton1) {
//         if (inputState === Enum.UserInputState.Begin) {
//             dragging = true;
//             lastPosition = new Vector2(input.Position.X, input.Position.Y);
//         } else if (inputState === Enum.UserInputState.End) {
//             dragging = false;
//         }
//     }

//     if (input.UserInputType === Enum.UserInputType.MouseMovement && dragging) {
//         const currentPosition = new Vector2(input.Position.X, input.Position.Y);
//         const delta = currentPosition.sub(lastPosition);
//         lastPosition = currentPosition;

//         angularVelocity = new Vector2(
//             math.clamp(delta.X * 0.01, -maxSpeed, maxSpeed),
//             math.clamp(delta.Y * 0.01, -maxSpeed, maxSpeed),
//         );
//     }

//     return Enum.ContextActionResult.Sink;
// }

// RunService.RenderStepped.Connect(() => {
//     if (!storeActive || angularVelocity.Magnitude < 0.001) return;

//     const primary = previewModel.PrimaryPart;
//     if (!primary) return;

//     const center = primary.Position;
//     const currentPivot = previewModel.GetPivot();

//     let newPitch = currentPitch + angularVelocity.Y;
//     newPitch = math.clamp(newPitch, minPitch, maxPitch);
//     const pitchDelta = newPitch - currentPitch;
//     currentPitch = newPitch;

//     const yaw = CFrame.Angles(0, angularVelocity.X, 0);
//     const pitch = CFrame.Angles(pitchDelta, 0, 0);
//     const rotation = yaw.mul(pitch);

//     const newPivot = new CFrame(center).mul(rotation).mul(currentPivot.sub(center));
//     previewModel.PivotTo(newPivot);

//     angularVelocity = angularVelocity.mul(damping);
// });

// function activateStoreScene() {
//     storeActive = true;

//     ContextActionService.BindAction(
//         "RotatePreviewModel",
//         handleMouseInput,
//         false,
//         Enum.UserInputType.MouseButton1,
//         Enum.UserInputType.MouseMovement,
//     );
// }

// // 🎯 Triggered by proximity prompt
// proximityPrompt.Triggered.Connect(() => {
//     activateStoreScene();
// });