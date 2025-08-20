import { Workspace } from "@rbxts/services";
import { createWeapon } from "Arena/shared/WeaponSystemOLD/Weapons/WeaponFactory";

const weaponOwner = Workspace.WaitForChild("FireTester") as Instance;
const weaponNozzle = weaponOwner.WaitForChild("Nozzle") as Part
const weaponTool = weaponOwner?.WaitForChild("CarrotShooter_w") as Tool;
const weapon = createWeapon(weaponOwner, "hitscan", "Standard", weaponTool);
const weaponHandle = weaponTool.FindFirstChild("Handle") as Instance;
const weaponMuzzle = weaponHandle.FindFirstChild("Muzzle") as Attachment;
const origin = weaponMuzzle.WorldPosition;
//const direction = weaponMuzzle.Axis.Unit.mul(1000);
const direction = new Vector3(-1, 0, 0)

let weaponType: "hitscan" | "projectile" = "hitscan";
while (true) {
    wait(1);
    const damageContext = weapon.fire(origin, direction, weaponTool);
}