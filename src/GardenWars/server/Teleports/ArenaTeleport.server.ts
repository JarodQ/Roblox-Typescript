import { Workspace } from "@rbxts/services";

const TeleportService = game.GetService("TeleportService");
const Players = game.GetService("Players");

const TARGET_PLACE_ID = 117052195928729;

const TeleportFolder = Workspace.WaitForChild("Teleports") as Folder
print(TeleportFolder)
const teleportBall = TeleportFolder.WaitForChild("TeleportBall") as Model;
const teleportToArena = teleportBall.WaitForChild("teleportToArena") as UnionOperation;
print(teleportToArena)

teleportToArena.Touched.Connect((hit) => {
    const character = hit.Parent;
    const player = Players.GetPlayerFromCharacter(character);

    if (player) {
        TeleportService.TeleportAsync(TARGET_PLACE_ID, [player]);
    }
})