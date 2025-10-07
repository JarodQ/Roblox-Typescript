import { ReplicatedStorage } from "@rbxts/services";

const progress = new Instance("NumberValue");
progress.Name = "GameLoadProgress";
progress.Value = 0;
progress.Parent = ReplicatedStorage;

task.spawn(() => {
    for (let i = 0; i <= 100; i += 5) {
        progress.Value = i;
        wait(0.1);
    }
});