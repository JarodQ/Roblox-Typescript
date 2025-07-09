import { UserInputService } from "@rbxts/services";
import { ReplicatedStorage } from "@rbxts/services";
import FireWeapon = require("shared/WeaponSystemOLD/Remotes/FireWeapon");
import ReloadWeapon = require("shared/WeaponSystemOLD/Remotes/ReloadWeapon");
import { Players } from "@rbxts/services";

let currentAmmo = "Standard";
let weaponType: "hitscan" | "projectile" = "hitscan";

/* UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        const character = Players.LocalPlayer.Character;
        if (!character) return;
        const head = character.FindFirstChild("Head") as BasePart;
        const mouse = Players.LocalPlayer.GetMouse();
        const direction = (mouse.Hit.Position.sub(head.Position)).Unit;;

        FireWeapon.FireServer(head.Position, direction, weaponType, currentAmmo);
    }

    if (input.KeyCode === Enum.KeyCode.Q) {
        ReloadWeapon.FireServer();
    }
}) */
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

            FireWeapon.FireServer(head.Position, direction, weaponType, currentAmmo);

            task.wait(0.5); // Adjust fire rate here
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
