// ProfileManager.server.ts
import { Players, RunService, ReplicatedStorage } from "@rbxts/services";
import ProfileStore from "@rbxts/profile-store";
import { templateData, PlayerTemplate } from "./Template";
import { PlayerProfile, Profiles } from "./DataManager";
import DataManager from "./DataManager";

const storeName = RunService.IsStudio() ? "Test" : "Live";
const PlayerStore = ProfileStore.New<PlayerTemplate>(storeName, templateData);


function initialize(player: Player, profile: PlayerProfile) {
    const leaderstats = new Instance("Folder");
    leaderstats.Name = "leaderstats";
    leaderstats.Parent = player;

    const gold = new Instance("NumberValue");
    gold.Name = "Gold";
    gold.Value = profile.Data.Gold;
    gold.Parent = leaderstats;

    const valor = new Instance("NumberValue");
    valor.Name = "Valor";
    valor.Value = profile.Data.Valor;
    valor.Parent = leaderstats;

    (ReplicatedStorage.WaitForChild("UpdateGold") as RemoteEvent).FireClient(player, gold.Value);
    (ReplicatedStorage.WaitForChild("UpdateValor") as RemoteEvent).FireClient(player, valor.Value);

}

async function addPlayer(player: Player) {
    const profile = await PlayerStore.StartSessionAsync(`Player_${player.UserId}`, {
        Cancel: () => player.Parent !== Players,
    });

    if (!profile) {
        player.Kick("Data error occurred. Please rejoin.");
        return;
    }

    profile.AddUserId(player.UserId);
    profile.Reconcile();

    profile.OnSessionEnd.Connect(() => {
        Profiles.delete(player);
        player.Kick("Data error occurred. Please rejoin.");
    });

    if (!player.IsDescendantOf(Players)) {
        profile.EndSession();
        return;
    }

    Profiles.set(player, profile);
    initialize(player, profile);
}

function removePlayer(player: Player) {
    const profile = Profiles.get(player);
    if (!profile) return;

    profile.EndSession();
    Profiles.delete(player);
}

for (const player of Players.GetPlayers()) {
    task.spawn(() => addPlayer(player));
}

Players.PlayerAdded.Connect(addPlayer);
Players.PlayerRemoving.Connect(removePlayer);



