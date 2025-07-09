export class CharacterAnimationController {
    private enabled = false;
    private loadedAnimations = false;
    private blaster: Tool;
    private animationTracks: Record<string, AnimationTrack> = {};

    constructor(blaster: Tool) {
        this.blaster = blaster;
    }

    public playShootAnimation(): void {
        this.animationTracks["Shoot"]?.Play(0);
    }

    public playReloadAnimation(reloadTime: number): void {
        const reloadTrack = this.animationTracks["Reload"];
        if (reloadTrack) {
            const speed = reloadTrack.Length / reloadTime;
            reloadTrack.Play(0.1, 1, speed);
        }
    }

    private loadAnimations(): void {
        if (this.loadedAnimations) return;
        this.loadedAnimations = true;

        const animationsFolder = this.blaster.FindFirstChild("Animations") as Folder;
        const humanoid = this.blaster.Parent?.FindFirstChildOfClass("Humanoid");
        assert(humanoid, "Blaster is not equipped to a character with a Humanoid");

        const animator = humanoid.FindFirstChildOfClass("Animator");
        assert(animator, "Humanoid is missing an Animator");

        for (const anim of animationsFolder.GetChildren()) {
            if (anim.IsA("Animation")) {
                const track = animator.LoadAnimation(anim);
                this.animationTracks[anim.Name] = track;
            }
        }
    }

    public enable(): void {
        if (this.enabled) return;
        this.enabled = true;

        if (!this.loadedAnimations) {
            this.loadAnimations();
        }

        this.animationTracks["Idle"]?.Play();
    }

    public disable(): void {
        if (!this.enabled) return;
        this.enabled = false;

        for (const [key, track] of pairs(this.animationTracks)) {
            track.Stop();
        }
    }

    public destroy(): void {
        this.disable();
        for (const [key] of pairs(this.animationTracks)) {
            delete this.animationTracks[key];
        }
    }
}