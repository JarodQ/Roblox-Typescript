import { DamageContext } from "Arena/shared/Damage/DamageService";
import { AmmoType } from "../Ammo/AmmoType";
import { FindFirstChild } from "../Remotes/FireWeapon";

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

    abstract fire(origin: Vector3, direction: Vector3, weaponTool: Tool): DamageContext | undefined;

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

    public playFireSound(soundString: string): void {
        const soundFolder = this.tool.FindFirstChild("Sounds") as Folder;
        const soundSubFolder = soundFolder.FindFirstChild(soundString) as Folder;
        const variants = soundSubFolder.GetChildren()
        const sound = variants[math.random(0, variants.size() - 1)] as Sound;

        if (!sound) return;
        const pitch = math.clamp(math.random() * 0.4 + 0.8, 0.8, 1.2); // Random between 0.8–1.2
        sound.PlaybackSpeed = pitch;
        sound.Play();
    }
}



