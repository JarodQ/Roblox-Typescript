import { Workspace } from "@rbxts/services";
import { createNumberDisplay } from "GardenWars/shared/CreateNumber";


// const numberTest: BasePart = Workspace.FindFirstChild("numberTest") as BasePart;
// const numberAttachment: Attachment = numberTest.FindFirstChild("Attachment") as Attachment;
// createNumberDisplay(2147483647, numberTest.Position.add(new Vector3(0, 0, 0)), numberAttachment);

const shop = Workspace.WaitForChild("ShopScene") as Model;
const shopNumbers = shop.WaitForChild("PlaceNumbers") as BasePart;
createNumberDisplay(2147483647, shopNumbers, .7, shopNumbers);

