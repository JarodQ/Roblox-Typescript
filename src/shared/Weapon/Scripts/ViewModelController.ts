import {
    ReplicatedStorage,
    RunService,
    SoundService,
    Workspace,
} from "@rbxts/services";
import { Constants } from "shared/Weapon/Constants";
import { disconnectAndClear } from "shared/Utility/disconnectAndClear";
import { lerp } from "shared/Utility/lerp";
import { bindSoundsToAnimationEvents } from "../Utility/BindSoundsToAnimationEvents";

const camera = Workspace.CurrentCamera!;
const viewModels = ReplicatedStorage.WaitForChild("ViewModels") as Folder;
const audioTarget = SoundService.WaitForChild("Audio").WaitForChild("Busses").WaitForChild("UI").WaitForChild("AudioCompressor");

export class ViewModelController {
    private blaster: Tool;
    private handle: BasePart;
    private model: Model;
    private muzzle: Attachment;
    private animations: Record<string, AnimationTrack> = {};
    private toolInstances: Instance[] = [];
    private connections: RBXScriptConnection[] = [];
    private enabled = false;
    private stride = 0;
    private bobbing = 0;

    constructor(blaster: Tool) {
        this.blaster = blaster;
        this.handle = blaster.WaitForChild("Handle") as BasePart;
        const sounds = blaster.WaitForChild("Sounds") as Folder;

        const viewModelName = blaster.GetAttribute(Constants.VIEW_MODEL_ATTRIBUTE) as string;
        const viewModelTemplate = viewModels.WaitForChild(viewModelName) as Model;
        this.model = viewModelTemplate.Clone();

        this.muzzle = this.model.FindFirstChild("MuzzleAttachment", true) as Attachment;
        assert(this.muzzle, `${viewModelName} is missing MuzzleAttachment!`);

        const animator = this.model
            .WaitForChild("AnimationController")
            .WaitForChild("Animator") as Animator;
        const animationsFolder = this.model.WaitForChild("Animations") as Folder;

        // Parent to ReplicatedStorage temporarily to allow animation loading
        this.model.Parent = ReplicatedStorage;

        for (const anim of animationsFolder.GetChildren()) {
            if (anim.IsA("Animation")) {
                const track = animator.LoadAnimation(anim);
                this.animations[anim.Name] = track;
                bindSoundsToAnimationEvents(track, sounds, audioTarget);
            }
        }
    }

    private update(deltaTime: number): void {
        for (const instance of this.toolInstances) {
            if ("LocalTransparencyModifier" in instance) {
                (instance as BasePart | Decal).LocalTransparencyModifier = 1;
            }
        }

        const moveSpeed = this.handle.AssemblyLinearVelocity.mul(new Vector3(1, 0, 1)).Magnitude;
        const bobbingSpeed = moveSpeed * Constants.VIEW_MODEL_BOBBING_SPEED;
        const bobbing = math.min(bobbingSpeed, 1);

        this.stride = (this.stride + bobbingSpeed * deltaTime) % (math.pi * 2);
        this.bobbing = lerp(
            this.bobbing,
            bobbing,
            math.min(deltaTime * Constants.VIEW_MODEL_BOBBING_TRANSITION_SPEED, 1),
        );

        const x = math.sin(this.stride);
        const y = math.sin(this.stride * 2);
        const offset = new Vector3(x, y, 0).mul(Constants.VIEW_MODEL_BOBBING_AMOUNT * this.bobbing);
        const bobbingCFrame = new CFrame(offset);

        this.model.PivotTo(camera.CFrame.mul(Constants.VIEW_MODEL_OFFSET).mul(bobbingCFrame));
    }

    private checkForToolInstance(instance: Instance): void {
        if (!(instance.IsA("BasePart") || instance.IsA("Decal"))) return;

        const tool = instance.FindFirstAncestorOfClass("Tool");
        if (tool) {
            this.toolInstances.push(instance);
        }
    }

    private hideToolInstances(): void {
        const character = this.blaster.Parent;
        if (!character) return;

        this.connections.push(
            character.DescendantAdded.Connect((descendant) => this.checkForToolInstance(descendant)),
            character.DescendantRemoving.Connect((descendant) => {
                const index = this.toolInstances.indexOf(descendant);
                if (index !== -1) this.toolInstances.remove(index);
            }),
        );

        for (const descendant of character.GetDescendants()) {
            this.checkForToolInstance(descendant);
        }
    }

    private stopHidingToolInstances(): void {
        this.toolInstances.clear();
        disconnectAndClear(this.connections);
    }

    public getMuzzlePosition(): Vector3 {
        return this.muzzle.WorldPosition;
    }

    public playShootAnimation(): void {
        this.animations["Shoot"]?.Play(0);
        this.muzzle.FindFirstChild("FlashEmitter")?.IsA("ParticleEmitter") &&
            (this.muzzle.FindFirstChild("FlashEmitter") as ParticleEmitter).Emit(1);
        this.muzzle.FindFirstChild("CircleEmitter")?.IsA("ParticleEmitter") &&
            (this.muzzle.FindFirstChild("CircleEmitter") as ParticleEmitter).Emit(1);
    }

    public playReloadAnimation(reloadTime: number): void {
        this.animations["Shoot"]?.Stop();
        const reloadTrack = this.animations["Reload"];
        if (reloadTrack) {
            const speed = reloadTrack.Length / reloadTime;
            reloadTrack.Play(Constants.VIEW_MODEL_RELOAD_FADE_TIME, 1, speed);
        }
    }

    public enable(): void {
        if (this.enabled) return;
        this.enabled = true;

        RunService.BindToRenderStep(
            Constants.VIEW_MODEL_BIND_NAME,
            Enum.RenderPriority.Camera.Value + 1,
            (dt) => this.update(dt),
        );

        this.model.Parent = Workspace;
        this.hideToolInstances();

        this.animations["Idle"]?.Play();
        this.animations["Equip"]?.Play(0);
    }

    public disable(): void {
        if (!this.enabled) return;
        this.enabled = false;

        RunService.UnbindFromRenderStep(Constants.VIEW_MODEL_BIND_NAME);
        this.model.Parent = undefined;
        this.stopHidingToolInstances();

        for (const [, track] of pairs(this.animations)) {
            track.Stop(0);
        }
    }

    public destroy(): void {
        this.disable();
        disconnectAndClear(this.connections);
        this.model.Destroy();
    }
}