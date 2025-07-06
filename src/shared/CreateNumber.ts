import { getPREFAB } from "./PREFABS";

function formatNumberWithCommas(num: number): string {
    const str = tostring(num);
    const result: string[] = [];
    let count = 0;

    for (let i = str.size(); i >= 0; i--) {
        const char = str.sub(i, i);
        result.unshift(char);
        count++;
        if (count % 3 === 0 && i !== 0) {
            result.unshift(",");
        }
    }
    return result.join("");
}

export function createNumberDisplay(
    number: number,
    startPosition: Vector3,
    attachment: Attachment,
    spaceing: number = .5,
    parent?: Instance
): Model {
    const ReplicatedStorage = game.GetService("ReplicatedStorage");
    const numberPrefabs = getPREFAB("Numbers", "Numbers") as Folder;

    const numberStr = formatNumberWithCommas(number);
    const model = new Instance("Model");
    model.Parent = parent ?? game.Workspace;

    let currentX = 0;

    for (const char of numberStr) {
        let prefab: Model | undefined;

        if (char === ",") {
            prefab = numberPrefabs.FindFirstChild("comma") as Model;
        } else {
            prefab = numberPrefabs.FindFirstChild(char) as Model;
        }

        if (prefab && prefab.IsA("Model")) {
            const clone = prefab.Clone();
            clone.PrimaryPart ??= clone.FindFirstChildWhichIsA("BasePart");

            if (clone.PrimaryPart) {
                const position = startPosition.add(attachment.WorldSecondaryAxis.mul(currentX));
                const rotation = CFrame.Angles(0, math.rad(attachment.Orientation.Y), 0);
                const finalCFrame = new CFrame(position).mul(rotation);
                clone.PivotTo(finalCFrame);

                //clone.PrimaryPart.CFrame = new CFrame(startPosition.add(new Vector3(currentX, 0, 0)));
                print(char);
                if (char === ",") {
                    currentX += spaceing / 2;
                }
                else if (char === "1") { currentX += spaceing / 1.5; }
                else { currentX += spaceing; }

                clone.Parent = model;
            }
        }
    }
    return model;
}