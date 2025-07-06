import { Workspace } from "@rbxts/services";
import { createNumberDisplay } from "shared/CreateNumber";


const numberTest: BasePart = Workspace.FindFirstChild("numberTest") as BasePart;
const numberAttachment: Attachment = numberTest.FindFirstChild("Attachment") as Attachment;
createNumberDisplay(2147483647, numberTest.Position.add(new Vector3(0, 0, 0)), numberAttachment);

