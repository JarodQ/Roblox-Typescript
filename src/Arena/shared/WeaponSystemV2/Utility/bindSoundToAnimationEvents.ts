import playSoundFromSource from "./playSoundFromSource";
import playRandomSoundFromSource from "./playRandomSoundFromSource";

const SOUND_EVENT = "Sound";
const RANDOM_SOUND_EVENT = "RandomSound";

export default function bindSoundsToAnimationEvents(
    animation: AnimationTrack,
    sounds: Folder,
    target: Instance,
): void {
    animation.GetMarkerReachedSignal(SOUND_EVENT).Connect((param?: string) => {
        print("Param: ", param)
        if (!param) return;
        const sound = sounds.FindFirstChild(param) as AudioPlayer | undefined;
        if (!sound) return;
        playSoundFromSource(sound, target);
    });

    animation.GetMarkerReachedSignal(RANDOM_SOUND_EVENT).Connect((param?: string) => {
        if (!param) return;
        const folder = sounds.FindFirstChild(param) as Folder | undefined;
        if (!folder) return;

        playRandomSoundFromSource(folder, target);
    });
}

