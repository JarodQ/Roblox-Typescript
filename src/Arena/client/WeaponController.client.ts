import { UserInputService } from "@rbxts/services";
import { ReplicatedStorage } from "@rbxts/services";
import FireWeapon = require("Arena/shared/WeaponSystemOLD/Remotes/FireWeapon");
import ReloadWeapon = require("Arena/shared/WeaponSystemOLD/Remotes/ReloadWeapon");
import { Players } from "@rbxts/services";

let currentAmmo = "Standard";
let weaponType: "hitscan" | "projectile" = "hitscan";

let isFiring = false;

function startFiring(): void {
    isFiring = true;

    task.spawn(() => {
        while (isFiring) {
            const player = Players.LocalPlayer;
            const character = player.Character;
            if (!character) break;

            const head = character.FindFirstChild("Head") as BasePart;
            if (!head) break;

            const mouse = player.GetMouse();
            const direction = mouse.Hit.Position.sub(head.Position).Unit;
            //print(`Firing!`);
            FireWeapon.FireServer(head.Position, direction, weaponType, currentAmmo);

            task.wait(0.2); // Adjust fire rate here
        }
    });
}

function stopFiring(): void {
    isFiring = false;
}

UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;

    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        startFiring();
    }

    if (input.KeyCode === Enum.KeyCode.Q) {
        ReloadWeapon.FireServer();
    }
});

UserInputService.InputEnded.Connect((input) => {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        stopFiring();
    }
});
