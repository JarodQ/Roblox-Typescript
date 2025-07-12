import { ReplicatedStorage } from "@rbxts/services";

const FireWeapon = new Instance("RemoteEvent");
FireWeapon.Name = "FireWeapon";
FireWeapon.Parent = game.GetService("ReplicatedStorage");

const ReloadWeapon = new Instance("RemoteEvent");
ReloadWeapon.Name = "ReloadWeapon";
ReloadWeapon.Parent = game.GetService("ReplicatedStorage");