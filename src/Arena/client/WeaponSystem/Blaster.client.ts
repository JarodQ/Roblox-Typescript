import { ReplicatedStorage } from "@rbxts/services";
import { BlasterController } from "Arena/shared/WeaponSystemV2/Weapon/WeaponController";
import bindToInstanceDestroyed from "Common/shared/Utility/bindToInstanceDestroyed";
import { Players } from "@rbxts/services";

const player = Players.LocalPlayer!;
const backpack = player.WaitForChild("Backpack") as Backpack;
const blaster = script?.Parent?.Parent as Tool;
// print("Blaster found: ", blaster)

let controller: BlasterController | undefined;

if (blaster && blaster.IsA("Tool")) {
    blaster.Equipped.Connect(() => {
        // print("blaster equipped")
        if (!controller) {
            controller = new BlasterController(blaster);
        }
    });
    // controller = new BlasterController(blaster);
    // print("Controller initialized")
    blaster.Destroying.Connect(() => {
        controller?.destroy();
    });
}


