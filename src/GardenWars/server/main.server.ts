import { makeHello } from "GardenWars/shared/GardenWars/module";
const workspace: Workspace = game.GetService("Workspace");
print(makeHello("main.server.ts"));

const PlayerService = game.GetService("Players");

