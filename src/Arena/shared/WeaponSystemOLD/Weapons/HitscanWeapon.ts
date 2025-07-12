import { Workspace } from "@rbxts/services";
import { Weapon } from "./Weapon";
import { Players } from "@rbxts/services";
import { TracerPool } from "./TracerPool";
import { TweenService } from "@rbxts/services";

export class HitscanWeapon extends Weapon {
    fire(origin: Vector3, direction: Vector3, weaponTool: Tool) {
        if (this.currentAmmo <= 0) return;
        this.currentAmmo--;

        //print("Firing Hitscan");

        const rayDirection = direction.Unit.mul(this.stats.range);

        const raycastParams = new RaycastParams();
        raycastParams.FilterDescendantsInstances = [];
        raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
        raycastParams.IgnoreWater = true;

        const player = Players.GetPlayerFromCharacter(this.owner);
        if (player && player.Character) {
            raycastParams.FilterDescendantsInstances = [player.Character];
        } else {
            raycastParams.FilterDescendantsInstances = [];
        }

        const result = Workspace.Raycast(origin, rayDirection, raycastParams);

        const hitPosition = result ? result.Position : origin.add(rayDirection);
        const tracer = TracerPool.get();

        //Tracer Logic
        const weaponHandle = weaponTool.FindFirstChild("Handle") as Part;
        const muzzle = weaponHandle.FindFirstChild("Muzzle") as Attachment;
        if (muzzle) {
            const tracerOrigin = muzzle.WorldPosition;
            const distance = origin.sub(hitPosition).Magnitude;

            //print(tracer.Name);
            tracer.Size = new Vector3(1, 1, 1);
            //tracer.CFrame = new CFrame(tracerOrigin, hitPosition).mul(new CFrame(0, 0, -distance / 2));
            tracer.CFrame = new CFrame(tracerOrigin);
            tracer.Parent = Workspace;
            tracer.CFrame = CFrame.lookAt(tracerOrigin, hitPosition);
            const duration = distance / 200;
            //const tween = TweenService.Create(tracer, new TweenInfo(1), { CFrame: new CFrame(hitPosition) });
            const tween = TweenService.Create(tracer, new TweenInfo(duration), { Position: hitPosition });
            tween.Play();
            tween.Completed.Once(() => {
                TracerPool.release(tracer);
            })
            for (let muzzleFlash of muzzle.GetChildren()) {
                if (muzzleFlash.IsA("ParticleEmitter")) {
                    muzzleFlash.Emit(1);
                }
            }
        }


        if (result && result.Instance) {
            this.ammoType.effect?.apply(result.Instance);
            print(`Hit ${result.Instance.Name} for ${this.stats.damage} damage`);
        }
    }
}