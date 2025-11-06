import { Players } from "@rbxts/services";

const player = Players.LocalPlayer!;
const destructionHandlerTemplate = script.WaitForChild("DestructionHandler") as LocalScript;

export default function bindToInstanceDestroyed(instance: Instance, callback: () => void): void {
    const destructionHandler = destructionHandlerTemplate.Clone();
    destructionHandler.Parent = player.WaitForChild("PlayerScripts");

    // Defer firing the BindableEvent so the script can initialize first
    task.defer(() => {
        const bindEvent = destructionHandler.WaitForChild("Bind") as BindableEvent;
        bindEvent.Fire(instance, callback);
    });
}
