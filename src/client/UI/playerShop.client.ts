import { Players } from "@rbxts/services";
import { setupGui } from "shared/Shop/guiManager";

const player: Player = Players.LocalPlayer;
const playerGuis = player.WaitForChild("PlayerGui") as PlayerGui;
const playerShop = playerGuis.WaitForChild("Shop") as ScreenGui;
setupGui(playerShop);

