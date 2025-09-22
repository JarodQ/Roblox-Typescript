import { DamageContext } from "Arena/shared/Damage/DamageService";
import { AmmoType } from "../../Ammo/AmmoType";
import { FindFirstChild } from "../../Remotes/FireWeapon";
import { FiringMode } from "../FiringModes/FiringMode";
import { BulletModifier } from "../Modifiers/bulletModifiers";
import { TraceStrategy } from "../TraceStrategy/TraceStrategy";

export interface IWeapon {
    reload(): void;
    equip(): void;
    unequip(): void;
    getStats(): WeaponStats;
}

export interface WeaponStats {
    fireRate: number;
    reloadSpeed: number;
    damage: number;
    range: number;
}


export abstract class Weapon implements IWeapon {
    public tool: Tool;
    public stats: WeaponStats;
    public owner: Instance;
    protected currentAmmo: number;
    protected reserveAmmo: number;
    protected firingMode?: FiringMode;
    protected bulletModifiers: BulletModifier[] = [];

    constructor(
        owner: Instance,
        baseStats: WeaponStats,
        weaponTool: Tool
    ) {
        this.owner = owner;
        this.tool = weaponTool;
        // this.stats = { ...baseStats };
        //this.stats = { fireRate: 1, reloadSpeed: 1, damage: 10, range: 1000 };
        this.stats = baseStats;
        this.applyAmmoModifiers();
        this.currentAmmo = 10000000;
        this.reserveAmmo = 30;
    }

    //abstract fire(origin: Vector3, direction: Vector3, weaponTool: Tool): DamageContext | undefined;
    // public abstract fire(): void;

    public reload(): void {
        const needed = 10 - this.currentAmmo;
        const toReload = math.min(needed, this.reserveAmmo);
        print(`Current Ammo: ${this.currentAmmo} | ReserveAmmo: ${this.reserveAmmo} | Ammo Needed: ${toReload}`);
        this.currentAmmo += toReload;
        this.reserveAmmo -= toReload;
    }

    public equip(): void {
        // Optional: play equip animation, attach to character, etc.
    }

    public unequip(): void {
        // Optional: cleanup, detach, etc.
    }

    public getStats(): WeaponStats {
        return this.stats;
    }

    public startFiring(origin: Vector3, direction: Vector3) {
        if (this.firingMode) {
            this.firingMode.startFiring(origin, direction);
        }
        else { print(`Firing mode is not set!!!`) }
    }

    public stopFiring() {
        if (this.firingMode) {
            this.firingMode.stopFiring();
        }
        else { print(`Firing mode is not set!!!`) }
    }

    public addModifier(mod: BulletModifier) {
        this.bulletModifiers.push(mod);
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

    protected applyModifiers(context: DamageContext): DamageContext {
        for (const mod of this.bulletModifiers) {
            mod.apply(context);
        }
        return context;
    }

    private applyAmmoModifiers() {
        // const mods = this.ammoType.modifiers;
        // for (const [key, value] of pairs(mods)) {
        //     if (value !== undefined) {
        //         this.stats[key as keyof WeaponStats] += value;
        //     }
        // }
    }
}



