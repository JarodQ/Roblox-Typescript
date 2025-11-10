import { ReplicatedStorage } from "@rbxts/services";

const PREFABFolder: Folder = ReplicatedStorage.WaitForChild("PREFABS") as Folder;
const SeedPREFABS: Folder = PREFABFolder.WaitForChild("Seeds") as Folder;
const uiPREFABS: Folder = PREFABFolder.WaitForChild("UI") as Folder;
const DropsPREFABS: Folder = PREFABFolder.WaitForChild("Drops") as Folder;
const TracersPREFABS: Folder = PREFABFolder.WaitForChild("Tracers") as Folder;
const NumbersPREFABS: Folder = PREFABFolder.WaitForChild("Numbers") as Folder;
const SoundsPREFABS: Folder = PREFABFolder.WaitForChild("Sounds") as Folder;
const ShopPREFABS: Folder = PREFABFolder.WaitForChild("Shop") as Folder;
const ToolsPREFABS: Folder = PREFABFolder.WaitForChild("Tools") as Folder;
const AllotmentsPREFABS: Folder = PREFABFolder.WaitForChild("Allotments") as Folder;


export function identifyInstance(instance: Instance): "Model" | "Part" | "Other" {
    if (instance.IsA("Model")) {
        return "Model";
    } else if (instance.IsA("BasePart")) {
        return "Part";
    } else {
        return "Other";
    }
}

function getList(PREFABFolder: Folder): Instance[] {
    const PREFABS: Instance[] = [];
    for (const item of PREFABFolder.GetChildren()) {
        PREFABS.push(item);
    }
    //print(PREFABS);
    return PREFABS;
}

export function getPREFAB(folder: string, targetPREFAB: string): unknown | undefined {
    let PREFAB: Folder | undefined;
    let targetFolder: Folder | undefined;
    let PREFABSList: Instance[] = [];
    switch (folder) {
        case "seeds":
            targetFolder = seeds?.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList;
        case "UI":
            targetFolder = UI?.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList;
        case "Drops":
            targetFolder = Drops?.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList[0];
        case "Tracers":
            targetFolder = Tracers.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList[0];
        case "Numbers":
            targetFolder = Numbers?.get(targetPREFAB);
            return targetFolder;
        case "Sounds":
            targetFolder = Sounds?.get(targetPREFAB);
            return targetFolder;
        case "Shop":
            targetFolder = Shop?.get(targetPREFAB);
            return targetFolder;
        case "Tools":
            targetFolder = Tools?.get(targetPREFAB);
            return targetFolder;
        case "Allotments":
            targetFolder = Allotments.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList[0];
        default:
            return;
    }
}

const seeds: Map<string, Folder> = new Map();
for (let seedFolder of SeedPREFABS.GetChildren()) {
    seeds.set(seedFolder.Name, seedFolder as Folder);
}

const UI: Map<string, Folder> = new Map();
for (let uiFolder of uiPREFABS.GetChildren()) {
    UI.set(uiFolder.Name, uiFolder as Folder);
}

const Drops: Map<string, Folder> = new Map();
for (let dropsFolder of DropsPREFABS.GetChildren()) {
    Drops.set(dropsFolder.Name, dropsFolder as Folder);
}

const Tracers: Map<string, Folder> = new Map();
for (let tracerFolder of TracersPREFABS.GetChildren()) {
    Tracers.set(tracerFolder.Name, tracerFolder as Folder);
}

const Numbers: Map<string, Folder> = new Map();
for (let numberFolder of NumbersPREFABS.GetChildren()) {
    Numbers.set(numberFolder.Name, numberFolder as Folder);
}

const Sounds: Map<string, Folder> = new Map();
for (let soundFolder of SoundsPREFABS.GetChildren()) {
    Sounds.set(soundFolder.Name, soundFolder as Folder);
}

const Shop: Map<string, Folder> = new Map();
for (let shopFolder of ShopPREFABS.GetChildren()) {
    Shop.set(shopFolder.Name, shopFolder as Folder);
}

const Tools: Map<string, Folder> = new Map();
for (let toolFolder of ToolsPREFABS.GetChildren()) {
    Tools.set(toolFolder.Name, toolFolder as Folder);
}

const Allotments: Map<string, Folder> = new Map();
for (let allotmentsFolder of AllotmentsPREFABS.GetChildren()) {
    Allotments.set(allotmentsFolder.Name, allotmentsFolder as Folder);
}
