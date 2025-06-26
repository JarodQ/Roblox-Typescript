export interface PlayerData {
    experience: number;
    level: number;
    carrotShooter: number;
    carrots: number;
}

export const DEFAULT_PLAYER_DATA: PlayerData = {
    experience: 0,
    level: 1,
    carrotShooter: 0,
    carrots: 0
}