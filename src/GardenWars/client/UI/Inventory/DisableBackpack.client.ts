import { Players, StarterGui } from "@rbxts/services";

Players.LocalPlayer.CharacterAdded.Connect(() => {
    wait(5)
    StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, true);
});
try {
    StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, true);
} catch (error) {
    print("Failed to disable Backpack UI:", error);
}
