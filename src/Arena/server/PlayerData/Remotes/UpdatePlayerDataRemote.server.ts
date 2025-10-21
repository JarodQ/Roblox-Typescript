import { updateFlag } from "Common/shared/PlayerData/PlayerDataService";
import { PlayerData } from "Common/shared/PlayerData/PlayerData";

// 👇 Create a local alias to ensure consistent typing
type PD = PlayerData;

const updatePlayerDataRemote = new Instance("RemoteEvent");
updatePlayerDataRemote.Name = "updatePlayerDataRemote";
updatePlayerDataRemote.Parent = game.GetService("ReplicatedStorage");

updatePlayerDataRemote.OnServerEvent.Connect((player, ...args: unknown[]) => {
    const [group, key, value] = args as [keyof PD, keyof PD[keyof PD], unknown];

    updateFlag(
        player,
        group as keyof PD,
        key as keyof PD[typeof group],
        value as PD[typeof group][typeof key]
    );
});