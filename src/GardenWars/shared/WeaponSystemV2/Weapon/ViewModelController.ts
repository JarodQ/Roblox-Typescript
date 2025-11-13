
// import { ReplicatedStorage, RunService, SoundService, Workspace } from "@rbxts/services";
// import Constants from "./Constants";
// import disconnectAndClear from "Common/shared/Utility/disconnectAndClear";
// import lerp from "Common/shared/Utility/lerp";
// import bindSoundsToAnimationEvents from "Arena/shared/WeaponSystemV2/Utility/bindSoundToAnimationEvents";

// const camera = Workspace.CurrentCamera!;
// const viewModels = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("ViewModels") as Folder;
// const maybeAudio = (SoundService as unknown) as {
//     Audio?: {
//         Busses?: {
//             UI?: {
//                 AudioCompressor?: Instance;
//             };
//         };
//     };
// };

// const audioTarget = maybeAudio.Audio!.Busses!.UI!.AudioCompressor;


// class ViewModelController {
//     private enabled = false;
//     private blaster: Tool;
//     private handle: BasePart;
//     private model: Model;
//     private muzzle: Attachment;
//     // private animations: Record<string, AnimationTrack> = {};
//     private animations = new Map<string, AnimationTrack>();
//     private toolInstances: Instance[] = [];
//     private connections: RBXScriptConnection[] = [];
//     private stride = 0;
//     private bobbing = 0;

//     constructor(blaster: Tool) {
//         this.blaster = blaster;
//         this.handle = blaster.WaitForChild("Handle") as BasePart;
//         const sounds = blaster.WaitForChild("Sounds") as Folder;

//         const viewModelName = blaster.GetAttribute(Constants.VIEW_MODEL_ATTRIBUTE) as string;
//         const viewModelTemplate = viewModels.FindFirstChild(viewModelName) as Model;
//         const viewModel = viewModelTemplate.Clone();
//         const muzzle = viewModel.FindFirstChild("MuzzleAttachment", true) as Attachment;
//         assert(muzzle, `${viewModel.Name} is missing MuzzleAttachment`);

//         const animatorController = (viewModel.FindFirstChild("AnimationController") as AnimationController)
//         const animator = animatorController.FindFirstChild("Animator") as Animator;
//         const animationsFolder = viewModel.WaitForChild("Animations") as Folder;

//         viewModel.Parent = ReplicatedStorage;
//         this.model = viewModel;
//         this.muzzle = muzzle;

//         if (!animator) return;
//         for (const animation of animationsFolder.GetChildren()) {
//             if (animation.IsA("Animation")) {
//                 const track = animator.LoadAnimation(animation);
//                 // this.animations[animation.Name] = track;
//                 this.animations.set(animation.Name, track);
//                 print("Binding animations: ", track, sounds, audioTarget)
//                 if (audioTarget) bindSoundsToAnimationEvents(track, sounds, audioTarget);
//             }
//         }


//     }

//     private update(deltaTime: number): void {
//         for (const instance of this.toolInstances) {
//             if ("LocalTransparencyModifier" in instance) {
//                 (instance as BasePart).LocalTransparencyModifier = 1;
//             }
//         }

//         const moveSpeed = this.handle.AssemblyLinearVelocity.mul(new Vector3(1, 0, 1)).Magnitude;
//         const bobbingSpeed = moveSpeed * Constants.VIEW_MODEL_BOBBING_SPEED;
//         const bobbing = math.min(bobbingSpeed, 1);

//         this.stride = (this.stride + bobbingSpeed * deltaTime) % (math.pi * 2);
//         this.bobbing = lerp(this.bobbing, bobbing, math.min(deltaTime * Constants.VIEW_MODEL_BOBBING_TRANSITION_SPEED, 1));

//         const x = math.sin(this.stride);
//         const y = math.sin(this.stride * 2);
//         const bobbingOffset = new Vector3(x, y, 0).mul(Constants.VIEW_MODEL_BOBBING_AMOUNT * this.bobbing);
//         const bobbingCFrame = new CFrame(bobbingOffset);

//         this.model.PivotTo(camera.CFrame.mul(Constants.VIEW_MODEL_OFFSET).mul(bobbingCFrame));
//     }

//     private checkForToolInstance(instance: Instance): void {
//         if (!(instance.IsA("BasePart") || instance.IsA("Decal"))) return;

//         const tool = instance.FindFirstAncestorOfClass("Tool");
//         if (tool) this.toolInstances.push(instance);
//     }

//     private hideToolInstances(): void {
//         const character = this.blaster.Parent;
//         if (!character) return;

//         this.connections.push(
//             character.DescendantAdded.Connect((descendant) => this.checkForToolInstance(descendant)),
//             character.DescendantRemoving.Connect((descendant) => {
//                 const index = this.toolInstances.indexOf(descendant);
//                 if (index !== -1) this.toolInstances.remove(index);
//             }),
//         );

//         for (const descendant of character.GetDescendants()) {
//             this.checkForToolInstance(descendant);
//         }
//     }

//     private stopHidingToolInstances(): void {
//         this.toolInstances.clear();
//         disconnectAndClear(this.connections);
//     }

//     public getMuzzlePosition(): Vector3 {
//         return this.muzzle.WorldPosition;
//     }

//     public playShootAnimation(): void {
//         // this.animations.Shoot?.Play(0);
//         this.animations.get("Shoot")?.Play(0);
//         (this.muzzle.FindFirstChild("FlashEmitter") as ParticleEmitter)?.Emit(1);
//         (this.muzzle.FindFirstChild("CircleEmitter") as ParticleEmitter)?.Emit(1);
//     }

//     public playReloadAnimation(reloadTime: number): void {
//         // this.animations.Shoot?.Stop();
//         this.animations.get("Shoot")?.Stop();
//         // const reload = this.animations.Reload;
//         const reload = this.animations.get("Reload");
//         if (reload) {
//             const speed = reload.Length / reloadTime;
//             reload.Play(Constants.VIEW_MODEL_RELOAD_FADE_TIME, 1, speed);
//         }
//     }

//     public enable(): void {
//         if (this.enabled) return;
//         this.enabled = true;

//         RunService.BindToRenderStep(
//             Constants.VIEW_MODEL_BIND_NAME,
//             Enum.RenderPriority.Camera.Value + 2,
//             (deltaTime) => this.update(deltaTime),
//         );

//         this.model.Parent = Workspace;
//         this.hideToolInstances();

//         // this.animations.Idle?.Play();
//         // this.animations.Equip?.Play(0);
//         this.animations.get("Idle")?.Play();
//         this.animations.get("Equip")?.Play(0);

//     }

//     public disable(): void {
//         if (!this.enabled) return;
//         this.enabled = false;

//         RunService.UnbindFromRenderStep(Constants.VIEW_MODEL_BIND_NAME);
//         this.model.Parent = undefined;
//         this.stopHidingToolInstances();

//         // for (const key in this.animations) {
//         //     const animation = this.animations[key];
//         //     if (animation && animation.IsA("AnimationTrack")) {
//         //         animation.Stop(0);
//         //     }
//         // }
//         this.animations.forEach((animation) => {
//             if (animation.IsA("AnimationTrack")) {
//                 animation.Stop(0);
//             }
//         });



//     }

//     public destroy(): void {
//         this.disable();
//         disconnectAndClear(this.connections);
//         this.model.Destroy();
//     }
// }

// export default ViewModelController;
