

// import { Players, ReplicatedStorage, UserInputService } from "@rbxts/services";

// const player = Players.LocalPlayer;
// const mouse = player.GetMouse();
// const interactEvent = ReplicatedStorage.WaitForChild("InteractEvent") as RemoteEvent;

// function tryInteract() {
//     const target = mouse.Target;
//     if (!target) return;

//     const clickPosition = mouse.Hit.Position;
//     const playerPosition = player.Character?.PrimaryPart?.Position;
//     if (!playerPosition) return;

//     const distance = clickPosition.sub(playerPosition).Magnitude;
//     if (distance > 30) return;

//     const heldItem = player.Character?.FindFirstChildWhichIsA("Tool") as Tool;
//     interactEvent.FireServer(target, clickPosition, heldItem);
// }

// // ✅ Mouse Button 1 (left-click)
// mouse.Button1Down.Connect(() => {
//     tryInteract();
// });

// // ✅ Touch and Gamepad R2
// UserInputService.InputBegan.Connect((input, gameProcessed) => {
//     if (gameProcessed) return;

//     const isTouch = input.UserInputType === Enum.UserInputType.Touch;
//     const isGamepadR2 = input.UserInputType === Enum.UserInputType.Gamepad1 && input.KeyCode === Enum.KeyCode.ButtonR2;

//     if (isTouch || isGamepadR2) {
//         tryInteract();
//     }
// });
