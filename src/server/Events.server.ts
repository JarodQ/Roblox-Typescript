import { ReplicatedStorage } from "@rbxts/services";

const remoteEvent = new Instance("RemoteEvent");
remoteEvent.Name = "InteractEvent";
remoteEvent.Parent = ReplicatedStorage;