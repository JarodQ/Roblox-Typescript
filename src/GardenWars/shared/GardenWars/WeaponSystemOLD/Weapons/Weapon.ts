import { AmmoType } from "../Ammo/AmmoType";

export interface WeaponStats {
    fireRate: number;
    reloadSpeed: number;
    damage: number;
    range: number;
}


export abstract class Weapon {
    protected stats: WeaponStats;
    protected currentAmmo: number;
    protected reserveAmmo: number;
    protected ammoType: AmmoType;
    protected owner: Instance;
    protected tool: Tool;

    constructor(owner: Instance, baseStats: WeaponStats, ammoType: AmmoType, weaponTool: Tool) {
        this.owner = owner;
        this.tool = weaponTool;
        this.stats = { ...baseStats };
        this.ammoType = ammoType;
        this.applyAmmoModifiers();
        this.currentAmmo = 10000000;
        this.reserveAmmo = 30;
    }

    abstract fire(origin: Vector3, direction: Vector3, weaponTool: Tool): void;

    reload(): void {
        const needed = 10 - this.currentAmmo;
        const toReload = math.min(needed, this.reserveAmmo);
        print(`Current Ammo: ${this.currentAmmo} | ReserveAmmo: ${this.reserveAmmo} | Ammo Needed: ${toReload}`);
        this.currentAmmo += toReload;
        this.reserveAmmo -= toReload;
    }

    private applyAmmoModifiers() {
        const mods = this.ammoType.modifiers;
        for (const [key, value] of pairs(mods)) {
            if (value !== undefined) {
                this.stats[key as keyof WeaponStats] += value;
            }
        }
    }
}



