export interface PlayerData {
    experience: number;
    level: number;
    carrotShooter: boolean;
    carrots: number;
    blueberryBlaster: boolean;
    blueberries: number;
    maizeMauler: boolean;
    corn: number;
}

export const DEFAULT_PLAYER_DATA: PlayerData = {
    experience: 0,
    level: 1,
    carrotShooter: false,
    carrots: 0,
    blueberryBlaster: false,
    blueberries: 0,
    maizeMauler: false,
    corn: 0,
}