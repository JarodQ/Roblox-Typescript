// import { Workspace } from "@rbxts/services";
// import { createWeapon } from "Arena/shared/WeaponSystem/Weapons/Factory/WeaponFactoryV2";

// let TURNOFF = false;
// const weaponOwner = Workspace.WaitForChild("FireTester") as Instance;
// const weaponNozzle = weaponOwner.WaitForChild("Nozzle") as Part
// const weaponTool = weaponOwner?.WaitForChild("CarrotShooter_w") as Tool;
// const weapon = createWeapon("CarrotShooter_w", weaponOwner, weaponTool);
// const weaponHandle = weaponTool.FindFirstChild("Handle") as Instance;
// const weaponMuzzle = weaponHandle.FindFirstChild("Muzzle") as Attachment;
// const origin = weaponMuzzle.WorldPosition;
// //const direction = weaponMuzzle.Axis.Unit.mul(1000);
// const direction = new Vector3(-1, 0, 0)

// let weaponType: "hitscan" | "projectile" = "hitscan";
// while (!TURNOFF) {
//     wait(.01);
//     // print(`Firing!!!`)
//     const damageContext = weapon.startFiring(origin, direction);
// }