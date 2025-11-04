throw "This module is disabled temporarily";
import { Workspace, UserInputService, RunService, ReplicatedStorage, Players, TweenService } from "@rbxts/services";
import { Weapon } from "Arena/shared/WeaponSystem/Weapons/Base/Weapon";
import FireWeapon = require("Arena/shared/WeaponSystem/Remotes/FireWeapon");
import ReloadWeapon = require("Arena/shared/WeaponSystem/Remotes/ReloadWeapon");
// import { CameraTilt } from "Arena/client/Camera/CameraTilt";
import { PitchRecoil } from "./Camera/PitchRecoil";
// import { AdaptiveRecoil } from "../client/Camera/AdaptiveRecoil";
import { ReticleScaler } from "Arena/shared/WeaponSystem/UI/Reticle";
import { ArmRecoilController } from "Arena/shared/WeaponSystem/VisualEffects/ArmRecoilController";
import { TracerPool } from "Arena/shared/WeaponSystem/Weapons/Utils/TracerPool";
import { CarrotShooter } from "Arena/shared/WeaponSystem/Weapons/Types/WeaponType/CarrotShooter";



const owner = Workspace.WaitForChild("Folder") as Folder;

const weapons: { weapon: Weapon; muzzle: BasePart }[] = [];

type WeaponConstructor = new (
    owner: Instance,
    tool: Tool,
) => Weapon;

const weaponRegistry: Record<string, WeaponConstructor> = {
    CarrotShooter_w: CarrotShooter,
};

export function createWeapon(
    weaponType: string,
    owner: Instance,
    tool: Tool,
): Weapon {
    const WeaponClass = weaponRegistry[weaponType];
    if (!WeaponClass) {
        throw `Unknown weapon type: ${weaponType}`;
    }

    return new WeaponClass(owner, tool);
}

for (const child of owner.GetChildren()) {
    if (!child.IsA("Model")) continue;

    const fireTester = child.FindFirstChild("FireTester") as Part;
    if (!fireTester?.IsA("Part")) continue;

    const nozzle = fireTester.FindFirstChild("Nozzle") as BasePart;
    if (!nozzle?.IsA("BasePart")) continue;

    const tool = fireTester.FindFirstChild("CarrotShooter_w") as Tool;
    if (!tool?.IsA("Tool")) continue;

    const weaponType = "CarrotShooter_w"; // ✅ fixed typo from "CarroShooter_w"
    if (!(weaponType in weaponRegistry)) continue;

    const weapon = createWeapon(weaponType, owner, tool);
    weapons.push({ weapon, muzzle: nozzle });
    print("Weapon added");
}

const TURNOFF = false;
while (!TURNOFF) {
    wait(1);
    // print("Firing~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    for (const { weapon, muzzle } of weapons) {
        // weapon.startFiring(muzzle.Position, muzzle.CFrame.LookVector);
        FireWeapon.FireServer(muzzle.Position, muzzle.CFrame.LookVector);

    }
}
// 🔫 Fire each weapon from its own muzzle


