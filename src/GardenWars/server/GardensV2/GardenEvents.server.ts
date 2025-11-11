import { ReplicatedStorage } from "@rbxts/services";

const requestGardenEvent = new Instance("RemoteFunction");
requestGardenEvent.Name = "RequestGardenEvent";
requestGardenEvent.Parent = ReplicatedStorage;

const initializePlayerGarden = new Instance("RemoteEvent");
initializePlayerGarden.Name = "InitializePlayerGarden";
initializePlayerGarden.Parent = ReplicatedStorage;

const teleportToGarden = new Instance("RemoteEvent");
teleportToGarden.Name = "TeleportToGarden";
teleportToGarden.Parent = ReplicatedStorage;

///////////////////////////////////
const allotmentAction = new Instance('RemoteEvent');
allotmentAction.Name = 'AllotmentAction';
allotmentAction.Parent = ReplicatedStorage;

const allotmentStateChange = new Instance('RemoteEvent');
allotmentStateChange.Name = 'AllotmentStateChange';
allotmentStateChange.Parent = ReplicatedStorage;

const collectIncome = new Instance('RemoteEvent');
collectIncome.Name = 'CollectIncome';
collectIncome.Parent = ReplicatedStorage;

const getPassiveIncome = new Instance('RemoteFunction');
getPassiveIncome.Name = 'GetPassiveIncome';
getPassiveIncome.Parent = ReplicatedStorage;
////////////////////////////////////