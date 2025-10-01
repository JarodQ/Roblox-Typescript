import { PlayerData } from "Arena/shared/PlayerData/PlayerData";
import { getLoadouts, getSortedLoadouts, getTrueFlags } from "Arena/shared/PlayerData/playerDataUtils";
import { loadPlayerData } from "Arena/shared/PlayerData/DataStoreWrapper";
import { WeaponFlags } from "Arena/shared/PlayerData/PlayerData";

const getLoadoutDataRemote = new Instance("RemoteEvent");
getLoadoutDataRemote.Name = "getLoadoutDataRemote";
getLoadoutDataRemote.Parent = game.GetService("ReplicatedStorage");

function setLoadoutFrames() {

}

// getUnlockedWeaponsRemote.OnServerInvoke = (player) => {
//     let unlockedWeapons: (keyof WeaponFlags)[] | undefined;

//     // Use a coroutine to handle async logic inside a sync wrapper
//     task.spawn(async () => {
//         // const playerData = await loadPlayerData(player.UserId); // ✅ Use player.UserId now
//         const playerData = await loadPlayerData(123456); // ✅ Use player.UserId now

//         // print("✅ Weapon remote load:", playerData);

//         if (playerData) {
//             // print(`Getting Player /Data!!!!!`);
//             unlockedWeapons = getTrueFlags(playerData.weapons);
//             print(`🔓 Unlocked Weapons for ${player.Name}:`, unlockedWeapons);
//         }
//     });
//     print(`🔓 Unlocked Weapons for ${player.Name}:`, unlockedWeapons);

//     // Return immediately — RemoteFunction must return synchronously
//     return unlockedWeapons ?? [];
// };

// getUnlockedWeaponsRemote.OnServerInvoke = async (player) => {
//     const playerData = await loadPlayerData(player.UserId); // ✅ Use actual UserId

//     if (!playerData) {
//         print(`⚠️ No player data found for ${player.Name}`);
//         return [];
//     }

//     const unlockedWeapons = getTrueFlags(playerData.weapons);
//     print(`🔓 Unlocked Weapons for ${player.Name}:`, unlockedWeapons);
//     return unlockedWeapons;
// };

getLoadoutDataRemote.OnServerEvent.Connect(async (player) => {
    const playerData = await loadPlayerData(player.UserId);
    const unlockedWeapons = playerData ? getTrueFlags(playerData.weapons) : [];
    const loadouts = playerData ? getSortedLoadouts(playerData.loadouts) : [];

    getLoadoutDataRemote.FireClient(player, unlockedWeapons, loadouts);
});