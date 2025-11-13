import { ReplicatedStorage } from "@rbxts/services";
// const Constants = require(ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Constants") as ModuleScript);
import Constants from "GardenWars/shared/WeaponSystemV2/Weapon/Constants";

export default function validateReload(player: Player, blaster: Tool): boolean {
    const character = player.Character;
    if (!character) {
        return false;
    }

    if (blaster.Parent !== character) {
        return false;
    }

    if (blaster.GetAttribute(Constants.RELOADING_ATTRIBUTE)) {
        return false;
    }

    return true;
}
