import { ReplicatedStorage } from "@rbxts/services";

const PREFABFolder: Folder = ReplicatedStorage.WaitForChild("PREFABS") as Folder;
const SeedPREFABS: Folder = PREFABFolder.WaitForChild("Seeds") as Folder;
const uiPREFABS: Folder = PREFABFolder.WaitForChild("UI") as Folder;
const DropsPREFABS: Folder = PREFABFolder.WaitForChild("Drops") as Folder;
const TracersPREFABS: Folder = PREFABFolder.WaitForChild("Tracers") as Folder;
const NumbersPREFABS: Folder = PREFABFolder.WaitForChild("Numbers") as Folder;


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
            print(targetFolder);
            return targetFolder;
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
    print(Numbers);
}

