import { ReplicatedStorage } from "@rbxts/services";

const splashProgressRemote = new Instance("RemoteEvent");
splashProgressRemote.Parent = ReplicatedStorage;
splashProgressRemote.Name = "SplashProgressRemote";

const progress = new Instance("NumberValue");
progress.Name = "GameLoadProgress";
progress.Value = 0;
progress.Parent = ReplicatedStorage;

splashProgressRemote.OnServerEvent.Connect((player) => {


    task.spawn(() => {
        for (let i = 0; i <= 100; i += 5) {
            progress.Value = i;
            wait(0.1);
        }
    });
});