import { makeHello } from "shared/module";
const workspace: Workspace = game.GetService("Workspace");
print(makeHello("main.server.ts"));

const PlayerService = game.GetService("Players");

