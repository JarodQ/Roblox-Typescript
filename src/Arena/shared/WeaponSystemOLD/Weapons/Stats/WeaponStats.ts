import { WeaponStats } from "../Base/Weapon"

export const weaponStatsConfig: Record<string, WeaponStats> = {
    CarrotShooter: { fireRate: .2, reloadSpeed: 3, damage: 8, range: 1000 },
    BlueberryBlaster: { fireRate: .2, reloadSpeed: 5, damage: 10, range: 1000 },
    MaizeMauler: { fireRate: .2, reloadSpeed: 5, damage: 3, range: 1000 },
}