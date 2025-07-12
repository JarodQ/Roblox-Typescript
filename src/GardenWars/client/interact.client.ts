import { Players, ReplicatedStorage } from "@rbxts/services";

const player = game.GetService("Players").LocalPlayer;
const mouse = player.GetMouse();
const interactEvent = ReplicatedStorage.WaitForChild("InteractEvent") as RemoteEvent;

mouse.Button2Down.Connect(() => {
    const target = mouse.Target;
    if (target) {
        const clickPosition = mouse.Hit.Position;
        const playerPosition = player.Character?.PrimaryPart?.Position;

        if (playerPosition) {
            const distance = (clickPosition.sub(playerPosition)).Magnitude;
            //print(`Player is: ${distance} away from where they clicked!`);
            if (distance <= 30) {
                const heldItem = player.Character?.FindFirstChildWhichIsA("Tool") as Tool;
                interactEvent.FireServer(target, clickPosition, heldItem);
            }
        }
    }
})