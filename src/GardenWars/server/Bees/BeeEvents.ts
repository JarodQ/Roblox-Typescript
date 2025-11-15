import { ReplicatedStorage } from "@rbxts/services";

export const BeeEvents = new Instance("Folder");
BeeEvents.Name = "BeeEvents";
BeeEvents.Parent = ReplicatedStorage;

export const HarvestEvent = new Instance("BindableEvent");
HarvestEvent.Name = "HarvestEvent";
HarvestEvent.Parent = BeeEvents;

export const StingEvent = new Instance("BindableEvent");
StingEvent.Name = "StingEvent";
StingEvent.Parent = BeeEvents;
