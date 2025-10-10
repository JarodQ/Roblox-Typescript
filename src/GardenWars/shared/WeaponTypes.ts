export interface WeaponConfig {
    name: string;
    fireRate: number;
    ammoCapacity: number;
    reloadTime: number;
    projectileSpeed?: number;
    isAutomatic?: boolean;
    viewModelName: string;
    zoomFov?: number;
    effects: {
        beamEffect?: (origin: Vector3, direction: Vector3) => void;
        impactEffect?: (position: Vector3, normal: Vector3, isCharacter: boolean) => void;
    };
    fireFunction: (origin: Vector3, direction: Vector3, player: Player) => void;
}