import { Workspace } from "@rbxts/services";

const TeleportService = game.GetService("TeleportService");
const Players = game.GetService("Players");

const TARGET_PLACE_ID = 117052195928729;

const TeleportFolder = Workspace.WaitForChild("Teleports") as Folder
const teleportBall = TeleportFolder.WaitForChild("TeleportBall") as Model;
const teleportToArena = teleportBall.WaitForChild("teleportToArena") as UnionOperation;

teleportToArena.Touched.Connect((hit) => {
    const character = hit.Parent;
    const player = Players.GetPlayerFromCharacter(character);

    if (player) {
        TeleportService.TeleportAsync(TARGET_PLACE_ID, [player]);
    }
})