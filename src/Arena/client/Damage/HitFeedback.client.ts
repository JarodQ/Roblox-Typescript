import { ReplicatedStorage, Players } from "@rbxts/services";
import { DamageContext } from "Arena/shared/Damage/DamageService";

//Get damage RemoteEvent from replicatedStorage
const damageEvent = ReplicatedStorage.WaitForChild("DamageEvents") as Folder;
const toVictim = damageEvent.WaitForChild("DamageTaken") as RemoteEvent;
print(toVictim)

//Get Player and Player UI from StarterPlayer
const player = Players.LocalPlayer
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const StatusBars = playerGui.WaitForChild("StatusBars") as ScreenGui;
const tweenFrame = StatusBars.WaitForChild("TweenFrame") as Frame;
const healthBar = tweenFrame.WaitForChild("Health") as Frame;
const healthStatus = healthBar.WaitForChild("Status") as Frame;
const healthNumber = healthStatus.WaitForChild("Number") as TextLabel;
const character = player.Character as Model;
const playerHumanoid = character.FindFirstChildOfClass("Humanoid") as Humanoid;
// toVictim.OnClientEvent.Connect((context: DamageContext) => {
//     print(`Client event received for: ${player}`)
//     const character = player.Character as Model;
//     const playerHumanoid = character.FindFirstChildOfClass("Humanoid") as Humanoid;
//     print(`PlayerHumanoid: ${playerHumanoid}`)
//     const playerHealth = playerHumanoid.Health;
//     const maxHealth = playerHumanoid.MaxHealth;
//     print(`Players current health is: ${playerHealth} | Players max health is: ${maxHealth}`);
//     const currentHealth = playerHealth / maxHealth;
//     healthStatus.Size = new UDim2(currentHealth, 0, 1, 0);
//     print(`Player health bar size changed to: `)
// })

while (true) {
    wait();
    healthStatus.Size = new UDim2(playerHumanoid.Health / playerHumanoid.MaxHealth, 0, 1, 0);
    healthNumber.Text = tostring(math.floor(playerHumanoid.Health));

}