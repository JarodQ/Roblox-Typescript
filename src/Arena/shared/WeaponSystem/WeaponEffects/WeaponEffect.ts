export interface WeaponEffect {
    name: string;
    apply(target: Instance): void;
}