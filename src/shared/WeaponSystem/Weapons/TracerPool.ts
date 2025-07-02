import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { getPREFAB } from "shared/PREFABS";

const carrotTracer = getPREFAB("Tracers", "CarrotTracer") as UnionOperation;

//const tracerTemplate = new Instance("Part");
const tracerTemplate = carrotTracer.Clone();
tracerTemplate.Parent = Workspace;
tracerTemplate.Name = "Tracer";
tracerTemplate.Anchored = true;
tracerTemplate.CanCollide = false;
//tracerTemplate.Material = Enum.Material.Neon;
tracerTemplate.Color = Color3.fromRGB(255, 200, 0);
tracerTemplate.Size = new Vector3(1, 1, 1);
tracerTemplate.Transparency = 0;

const pool: (Part | UnionOperation)[] = [];

export const TracerPool = {
    get(): Part | UnionOperation {
        print("Getting Tracer");
        return pool.pop() || tracerTemplate.Clone();
    },

    release(tracer: Part | UnionOperation) {
        tracer.Parent = undefined;
        pool.push(tracer);
    }
}