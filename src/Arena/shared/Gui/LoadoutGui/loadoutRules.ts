export type WeaponSlot = "primary" | "secondary" | "utility";

export const WEAPON_SLOT_RULES: Record<string, WeaponSlot[]> = {
    carrotShooter: ["secondary"],
    blueberryBlaster: ["utility"],
    maizeMauler: ["primary"],
}