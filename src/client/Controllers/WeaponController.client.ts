import { UserInputService } from "@rbxts/services";
import { ReplicatedStorage } from "@rbxts/services";
import FireWeapon = require("shared/WeaponSystem/Remotes/FireWeapon");
import ReloadWeapon = require("shared/WeaponSystem/Remotes/ReloadWeapon");
import { Players } from "@rbxts/services";

let currentAmmo = "Standard";
let weaponType: "hitscan" | "projectile" = "hitscan";

UserInputService.InputBegan.Connect((input, gameProcessed) => {
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
})