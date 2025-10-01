// import { HitscanWeapon } from "../TraceStrategy/HitscanWeapon";
// import { ProjectileWeapon } from "../TraceStrategy/ProjectileWeapon";
// import { AmmoRegistry } from "../../Ammo/AmmoRegistry";
// import { IWeapon, Weapon } from "../Base/Weapon";
// import { SemiAutoFiring } from "../FiringModes/SemiAutoFiring";
// import { BaseWeapon } from "../Base/BaseWeapon";
// import { WeaponStats } from "../Base/Weapon";


// // export function createWeapon(owner: Instance, weaponType: "hitscan" | "projectile", ammoName: string, weaponTool: Tool): Weapon {

// //     const baseStats = {
// //         fireRate: 1,
// //         reloadSpeed: 2,
// //         damage: 10,
// //         range: 100,
// //     };
// //     const ammo = AmmoRegistry[ammoName];
// //     if (!ammo) error(`Unknown ammo type: ${ammoName}`);
// //     const firingMode = new SemiAutoFiring();

// //     if (weaponType === "hitscan") {
// //         return new HitscanWeapon(owner, baseStats, ammo, weaponTool);
// //     } else {
// //         return new ProjectileWeapon(owner, baseStats, ammo, weaponTool);
// //     }
// // }

// export function createWeapon(
//     owner: Instance,
//     weaponType: "hitscan" | "projectile",
//     ammoName: string,
//     weaponTool: Tool
// ): IWeapon {
//     const baseStats: WeaponStats = {
//         fireRate: 1,
//         reloadSpeed: 2,
//         damage: 10,
//         range: 100,
//     };

//     const ammo = AmmoRegistry[ammoName];
//     if (!ammo) error(`Unknown ammo type: ${ammoName}`);

//     // Step 1: Create a placeholder firing mode
//     const firingMode = new SemiAutoFiring();

//     // Step 2: Create the weapon and inject the firing mode
//     let weapon: Weapon;
//     if (weaponType === "hitscan") {
//         weapon = new HitscanWeapon(owner, baseStats, ammo, weaponTool);
//     } else {
//         weapon = new ProjectileWeapon(owner, baseStats, ammo, weaponTool);
//     }

//     // Step 3: Link the weapon back to the firing mode
//     firingMode.setWeapon(weapon);

//     return weapon;
// }