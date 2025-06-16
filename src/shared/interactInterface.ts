export interface Interactable {
    interact(player: Player, hitPos: Vector3, interactable: Instance): void;
}