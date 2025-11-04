import { Workspace, UserInputService, RunService, ReplicatedStorage, Players, TweenService } from "@rbxts/services";
import FireWeapon = require("Arena/shared/WeaponSystem/Remotes/FireWeapon");
import ReloadWeapon = require("Arena/shared/WeaponSystem/Remotes/ReloadWeapon");
import { CameraTilt } from "Arena/client/Camera/CameraTilt";
import { PitchRecoil } from "./Camera/PitchRecoil";
import { AdaptiveRecoil } from "./Camera/AdaptiveRecoil";
import { ReticleScaler } from "Arena/shared/WeaponSystem/UI/Reticle";
import { ArmRecoilController } from "Arena/shared/WeaponSystem/VisualEffects/ArmRecoilController";
import { TracerPool } from "Arena/shared/WeaponSystem/Weapons/Utils/TracerPool";



let currentAmmo = "Standard";

const player = Players.LocalPlayer;
const character = player.Character ?? player.CharacterAdded.Wait()[0];
const rightArm = character.WaitForChild("RightUpperArm")!;
const shoulder = rightArm.WaitForChild("RightShoulder") as Motor6D;

const armRecoil = new ArmRecoilController(shoulder);

let isFiring = false;
const maxTilt = .95;
const lastFireTimestamps = new Map<Player, number>();
const FIRE_RATE = 0.2;

let firingThread: thread | undefined;
// function startFiring(): void {
//     if (isFiring || firingThread) return; // ✅ Prevent multiple spawns

//     isFiring = true;

//     firingThread = task.spawn(() => {
//         let lastShotTime = Workspace.GetServerTimeNow();
//         while (isFiring) {
//             const now = Workspace.GetServerTimeNow();
//             const timeSinceLastShot = now - lastShotTime;

//             if (timeSinceLastShot >= FIRE_RATE) {
//                 lastShotTime = now;
//                 const player = Players.LocalPlayer;
//                 const character = player.Character;
//                 const weaponTool = character?.FindFirstChildOfClass("Tool");
//                 if (!character) break;

//                 const head = character.FindFirstChild("Head") as BasePart;
//                 if (!head) break;

//                 const mouse = player.GetMouse();
//                 const direction = mouse.Hit.Position.sub(head.Position).Unit;

//                 // 🔫 Fire the weapon

//                 FireWeapon.FireServer(head.Position, direction, weaponType, currentAmmo, {

//                 });

//                 //Apply tracer to local player who fired weapon

//                 if (weaponTool) {
//                     localTracer(head.Position, weaponTool);
//                     localSound("Fire", weaponTool);
//                 }

//                 // 💥 Trigger camera tilt via lockCamera system
//                 // 💥 Apply random tilt and lerp over fireRate
//                 let angle: number;
//                 //do {
//                 angle = math.random(-maxTilt, maxTilt);
//                 //} while (math.abs(angle) < 1);

//                 const randomTilt = math.rad(angle);
//                 //const randomTilt = math.rad(math.random(-maxTilt, maxTilt));
//                 //CameraTilt.setTarget(randomTilt, fireRate);
//                 //PitchRecoil.apply(math.rad(1.5)); // tweak for more or less kick
//                 AdaptiveRecoil.apply(math.rad(.5)); // Don't make > 2.0 math.random() -- too impredictable maybe? or maybe use withing a small interval

//                 ReticleScaler.boost();
//                 armRecoil.triggerRecoil();
//                 //task.wait(FIRE_RATE); // Adjust fire rate
//             }
//             RunService.Heartbeat.Wait();
//         }
//         firingThread = undefined;
//     });
// }
// function startFiringOld(): void {
//     if (isFiring || firingThread) return;

//     isFiring = true;

//     const player = Players.LocalPlayer;
//     const character = player.Character;
//     const weaponTool = character?.FindFirstChildOfClass("Tool");
//     const head = character?.FindFirstChild("Head") as BasePart;
//     const mouse = player.GetMouse();

//     if (!character || !head || !mouse) return;

//     const direction = mouse.Hit.Position.sub(head.Position).Unit;

//     // 🔫 Fire immediately
//     FireWeapon.FireServer(head.Position, direction);
//     if (weaponTool) {
//         localTracer(head.Position, weaponTool);
//         localSound("Fire", weaponTool);
//     }

//     const angle = math.random(-maxTilt, maxTilt);
//     const randomTilt = math.rad(angle);
//     AdaptiveRecoil.apply(math.rad(.5));
//     ReticleScaler.boost();
//     armRecoil.triggerRecoil();

//     // let lastShotTime = Workspace.GetServerTimeNow();

//     // 🔁 Continue firing loop
//     firingThread = task.spawn(() => {
//         while (isFiring) {
//             // const now = Workspace.GetServerTimeNow();
//             // const timeSinceLastShot = now - lastShotTime;

//             // if (timeSinceLastShot >= FIRE_RATE - 0.05) {
//             // lastShotTime = now;

//             const character = player.Character;
//             const weaponTool = character?.FindFirstChildOfClass("Tool");
//             const head = character?.FindFirstChild("Head") as BasePart;
//             const mouse = player.GetMouse();

//             if (!character || !head || !mouse) break;

//             const direction = mouse.Hit.Position.sub(head.Position).Unit;

//             FireWeapon.FireServer(head.Position, direction, currentAmmo, {});
//             if (weaponTool) {
//                 localTracer(head.Position, weaponTool);
//                 localSound("Fire", weaponTool);
//             }

//             const angle = math.random(-maxTilt, maxTilt);
//             const randomTilt = math.rad(angle);
//             AdaptiveRecoil.apply(math.rad(.5));
//             ReticleScaler.boost();
//             armRecoil.triggerRecoil();
//             // }

//             RunService.Heartbeat.Wait();
//         }

//         firingThread = undefined;
//     });
// }

function startFiring(): void {
    if (isFiring) return;
    isFiring = true;

    const player = Players.LocalPlayer;
    const character = player.Character;
    const weaponTool = character?.FindFirstChildOfClass("Tool");
    const head = character?.FindFirstChild("Head") as BasePart;
    const mouse = player.GetMouse();
    if (!character || !head || !mouse) return;

    const direction = mouse.Hit.Position.sub(head.Position).Unit;
    FireWeapon.FireServer(head.Position, direction);
    if (weaponTool) {
        localTracer(head.Position, weaponTool);
        localSound("Fire", weaponTool);
    }

    const angle = math.random(-maxTilt, maxTilt);
    const randomTilt = math.rad(angle);
    AdaptiveRecoil.apply(math.rad(.5));
    ReticleScaler.boost();
    armRecoil.triggerRecoil();
}

function stopFiring(): void {
    isFiring = false;
    // firingThread = undefined
    CameraTilt.reset();
}

function localTracer(origin: Vector3, weaponTool: Tool): void {
    const camera = Workspace.CurrentCamera!;
    const mouseLocation = UserInputService.GetMouseLocation();
    const viewportRay = camera.ViewportPointToRay(mouseLocation.X, mouseLocation.Y);
    const direction = viewportRay.Direction;
    const rayDirection = direction.Unit.mul(1000);

    const raycastParams = new RaycastParams();
    raycastParams.FilterDescendantsInstances = [weaponTool, character];
    raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
    raycastParams.IgnoreWater = true;

    const result = Workspace.Raycast(origin, rayDirection, raycastParams);

    const hitPosition = result ? result.Position : origin.add(rayDirection);
    let tracer = TracerPool.get();

    //Tracer Logic
    const weaponHandle = weaponTool.FindFirstChild("Handle") as Part;
    const muzzle = weaponHandle.FindFirstChild("Muzzle") as Attachment;
    if (muzzle) {
        const tracerOrigin = muzzle.WorldPosition;
        const distance = origin.sub(hitPosition).Magnitude;

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
}

function localSound(soundString: string, weaponTool: Tool): void {
    const soundFolder = weaponTool.FindFirstChild("Sounds") as Folder;
    const soundSubFolder = soundFolder.FindFirstChild(soundString) as Folder;
    const variants = soundSubFolder.GetChildren()
    const sound = variants[math.random(0, variants.size() - 1)] as Sound;

    if (!sound) return;
    const pitch = math.clamp(math.random() * 0.4 + 0.8, 0.8, 1.2); // Random between 0.8–1.2
    sound.PlaybackSpeed = pitch;
    sound.Play();
}

UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;

    // const now = Workspace.GetServerTimeNow();
    // const lastFire = lastFireTimestamps.get(player) ?? 0;
    // if (now - lastFire < FIRE_RATE - .05) {
    //     warn(`Client Side Fire rate violation by ${player.Name}`);
    //     return;
    // };

    // lastFireTimestamps.set(player, now);

    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        startFiring();
    }

    if (input.KeyCode === Enum.KeyCode.Q) {
        ReloadWeapon.FireServer();
    }
});

UserInputService.InputEnded.Connect((input) => {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        stopFiring();
    }
});
