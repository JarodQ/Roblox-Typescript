import { Players } from "@rbxts/services";

const player = Players.LocalPlayer!;
const destructionHandlerTemplate = script.WaitForChild("DestructionHandler") as LocalScript;

/**
 * Binds a callback to run when the given instance is destroyed.
 * Uses a cloned script workaround to survive Deferred signal mode.
 *
 * @param instance - The instance to monitor for destruction
 * @param callback - The function to call when the instance is destroyed
 */
export function bindToInstanceDestroyed(instance: Instance, callback: () => void): void {
    const destructionHandler = destructionHandlerTemplate.Clone();
    destructionHandler.Parent = player.WaitForChild("PlayerScripts");

    // Defer firing the BindableEvent so the script has time to initialize
    task.defer(() => {
        const bindEvent = destructionHandler.WaitForChild("Bind") as BindableEvent;
        bindEvent.Fire(instance, callback);
    });
}