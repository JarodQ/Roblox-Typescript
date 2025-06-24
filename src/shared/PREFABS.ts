import { ReplicatedStorage } from "@rbxts/services";

const PREFABFolder: Folder = ReplicatedStorage.WaitForChild("PREFABS") as Folder;
const SeedPREFABS: Folder = PREFABFolder.WaitForChild("Seeds") as Folder;
const uiPREFABS: Folder = PREFABFolder.WaitForChild("UI") as Folder;


function getList(PREFABFolder: Folder): Part[] {
    const PREFABS: Part[] = [];
    for (let part of PREFABFolder.GetChildren()) {
        PREFABS.push(part as Part);
    }
    //print(PREFABS);
    return PREFABS;
}

export function getPREFAB(folder: string, targetPREFAB: string): unknown | undefined {
    let PREFAB: Folder | undefined;
    let targetFolder: Folder | undefined;
    let PREFABSList: Part[] = [];
    switch (folder) {
        case "seeds":
            targetFolder = seeds?.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList;
        case "UI":
            targetFolder = UI?.get(targetPREFAB);
            if (targetFolder) PREFABSList = getList(targetFolder);
            return PREFABSList;
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

