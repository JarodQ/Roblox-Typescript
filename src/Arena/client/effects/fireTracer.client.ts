import { Workspace, TweenService } from "@rbxts/services";
import FireTracer = require("Arena/shared/WeaponSystemOLD/Remotes/FireTracer");
import { TracerPool } from "Arena/shared/WeaponSystemOLD/Weapons/TracerPool";


FireTracer.OnClientEvent.Connect((origin, direction, weaponTool) => {
    runTracerEffect(origin, direction, weaponTool);
});

function runTracerEffect(origin: Vector3, direction: Vector3, weaponTool: Tool): void {
    const weaponHandle = weaponTool.FindFirstChild("Handle") as Part;
    const muzzle = weaponHandle?.FindFirstChild("Muzzle") as Attachment;
    if (!muzzle) return;

    const rayLength = 1000;
    const rayDirection = direction.Unit.mul(rayLength);

    const raycastParams = new RaycastParams();
    raycastParams.FilterDescendantsInstances = [weaponTool];
    raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
    raycastParams.IgnoreWater = true;

    const result = Workspace.Raycast(origin, rayDirection, raycastParams);
    const hitPosition = result ? result.Position : origin.add(rayDirection);

    const tracer = TracerPool.get();
    const tracerOrigin = muzzle.WorldPosition;
    const distance = tracerOrigin.sub(hitPosition).Magnitude;

    tracer.Size = new Vector3(1, 1, 1);
    tracer.CFrame = CFrame.lookAt(tracerOrigin, hitPosition);
    tracer.Parent = Workspace;

    const duration = distance / 200;
    const tween = TweenService.Create(tracer, new TweenInfo(duration), { Position: hitPosition });
    tween.Play();
    tween.Completed.Once(() => TracerPool.release(tracer));

    for (const muzzleFlash of muzzle.GetChildren()) {
        if (muzzleFlash.IsA("ParticleEmitter")) {
            muzzleFlash.Emit(1);
        }
    }
    print("Succesfully copied tracer effect to other clients");
}

