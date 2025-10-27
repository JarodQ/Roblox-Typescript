import { PlayerData } from "Common/shared/PlayerData/PlayerData";
import { getLoadouts, getSortedLoadouts, getTrueFlags } from "Common/shared/PlayerData/playerDataUtils";
import { loadPlayerData } from "Common/server/DataStoreWrapper";
import { WeaponFlags } from "Common/shared/PlayerData/PlayerData";

const getLoadoutDataRemote = new Instance("RemoteEvent");
getLoadoutDataRemote.Name = "getLoadoutDataRemote";
getLoadoutDataRemote.Parent = game.GetService("ReplicatedStorage");

const loadLoadoutRemote = new Instance("RemoteEvent");
loadLoadoutRemote.Name = "loadLoadoutRemote";
loadLoadoutRemote.Parent = game.GetService("ReplicatedStorage");

getLoadoutDataRemote.OnServerEvent.Connect(async (player) => {
    const playerData = await loadPlayerData(player.UserId);
    const unlockedWeapons = playerData ? getTrueFlags(playerData.weapons) : [];
    const loadouts = playerData ? getSortedLoadouts(playerData.loadouts) : [];

    getLoadoutDataRemote.FireClient(player, unlockedWeapons, loadouts);
});

loadLoadoutRemote.OnServerEvent.Connect(async (player) => {
    const playerData = await loadPlayerData(player.UserId);
    const loadouts = playerData ? getSortedLoadouts(playerData.loadouts) : [];
    loadLoadoutRemote.FireClient(player, playerData.loadouts, loadouts);
})