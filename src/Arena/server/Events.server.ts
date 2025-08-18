import { ReplicatedStorage } from "@rbxts/services";

const FireWeapon = new Instance("RemoteEvent");
FireWeapon.Name = "FireWeapon";
FireWeapon.Parent = ReplicatedStorage

const FireTracer = new Instance("RemoteEvent");
FireTracer.Name = "FireTracer";
FireTracer.Parent = ReplicatedStorage

const ReloadWeapon = new Instance("RemoteEvent");
ReloadWeapon.Name = "ReloadWeapon";
ReloadWeapon.Parent = ReplicatedStorage

const PlaySound = new Instance("RemoteEvent");
PlaySound.Name = "PlaySound";
PlaySound.Parent = ReplicatedStorage

const DamageEvents = new Instance("Folder");
DamageEvents.Name = "DamageEvents";

DamageEvents.Parent = ReplicatedStorage
const DamageConfirmed = new Instance("RemoteEvent");
DamageConfirmed.Name = "DamageConfirmed";
DamageConfirmed.Parent = DamageEvents;

const DamageTaken = new Instance("RemoteEvent");
DamageTaken.Name = "DamageTaken";
DamageTaken.Parent = DamageEvents;
