import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { getPREFAB } from "Arena/shared/PREFABS";
import { Debris } from "@rbxts/services";

const carrotTracer = getPREFAB("Tracers", "CarrotTracer") as MeshPart;
//const TestPart = getPREFAB("Tracers", "TestPart") as Part;

//const tracerTemplate = new Instance("Part");
const tracerTemplate = carrotTracer.Clone();
//const tracerTemplate = TestPart.Clone();
tracerTemplate.Parent = Workspace;
tracerTemplate.Name = "Tracer";
tracerTemplate.Anchored = true;
tracerTemplate.CanCollide = false;
//tracerTemplate.Material = Enum.Material.Neon;
tracerTemplate.Color = Color3.fromRGB(255, 200, 0);
tracerTemplate.Size = new Vector3(1, 1, 1);
tracerTemplate.Transparency = 0;

const pool: (Part | MeshPart)[] = [];

export const TracerPool = {
    get(): Part | MeshPart {
        //print("Getting Tracer");
        return pool.pop() || tracerTemplate.Clone();
    },

    release(tracer: Part | MeshPart) {
        tracer.Parent = undefined;
        //pool.push(tracer);
    }
}