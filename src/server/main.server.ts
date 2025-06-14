import { makeHello } from "shared/module";
const workspace: Workspace = game.GetService("Workspace");
print(makeHello("main.server.ts"));

const PlayerService = game.GetService("Players");

const addBlock = (position: Vector3) => {
	const part = new Instance("Part");
	part.Parent = workspace;
	part.Size = new Vector3(10, 10, 10);
	part.Position = position;
	part.TopSurface = Enum.SurfaceType.Studs;
}

PlayerService.PlayerAdded.Connect(function (player: Player) {
	//print(player.Name);
	addBlock(new Vector3(0, 0, 0));
});


