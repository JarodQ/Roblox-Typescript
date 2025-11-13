class CharacterAnimationController {
    private enabled = false;
    private loadedAnimations = false;
    private blaster: Tool;
    // private animationTracks: Record<string, AnimationTrack> = {};
    private animationTracks = new Map<string, AnimationTrack>();


    constructor(blaster: Tool) {
        this.blaster = blaster;
    }

    playShootAnimation() {
        // this.animationTracks.Shoot?.Play(0);
        this.animationTracks.get("Shoot")?.Play(0);
    }

    playReloadAnimation(reloadTime: number) {
        // const reloadTrack = this.animationTracks.Reload;
        const reloadTrack = this.animationTracks.get("Reload");
        if (!reloadTrack) return;

        const speed = reloadTrack.Length / reloadTime;
        reloadTrack.Play(0.1, 1, speed);
    }

    private loadAnimations() {
        if (this.loadedAnimations) return;
        this.loadedAnimations = true;

        const animationsFolder = this.blaster.WaitForChild("Animations") as Folder;
        const humanoid = this.blaster.Parent?.FindFirstChildOfClass("Humanoid");
        assert(humanoid, "Blaster is not equipped");

        const animator = humanoid.WaitForChild("Animator") as Animator;
        // const animationTracks: Record<string, AnimationTrack> = {};
        const animationsTracks = new Map<string, AnimationTrack>();

        for (const animation of animationsFolder.GetChildren()) {
            if (animation.IsA("Animation")) {
                const track = animator.LoadAnimation(animation);
                animationsTracks.set(animation.Name, track);
            }
        }

        this.animationTracks = animationsTracks;

    }

    enable() {
        if (this.enabled) return;
        this.enabled = true;

        if (!this.loadedAnimations) {
            this.loadAnimations();
        }

        // this.animationTracks.Idle?.Play();
        this.animationTracks.get("Idle")?.Play();
    }

    disable() {
        if (!this.enabled) return;
        this.enabled = false;

        this.animationTracks.forEach((track) => {
            track.Stop();
        });
    }


    destroy() {
        this.disable();
        this.animationTracks.clear();
    }

}

export = CharacterAnimationController;
