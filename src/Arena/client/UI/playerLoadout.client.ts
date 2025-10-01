import { ReplicatedStorage } from "@rbxts/services";
import { Players } from "@rbxts/services";
import { setupGui } from "Arena/shared/Gui/LoadoutGui/guiManager";
import { WeaponFlags } from "Arena/shared/PlayerData/PlayerData";


const player: Player = Players.LocalPlayer;
const playerGuis = player.WaitForChild("PlayerGui") as PlayerGui;
const playerLoadout = playerGuis.WaitForChild("LoadoutGui") as ScreenGui;
setupGui(playerLoadout);

