import { playSoundFromSource } from "./playSoundFromSource";
import { playRandomSoundFromSource } from "./playRandomSoundFromSource";

const SOUND_EVENT = "Sound";
const RANDOM_SOUND_EVENT = "RandomSound";

/**
 * Binds sound playback to animation markers.
 * - "Sound" markers play a named Sound instance from the sounds folder.
 * - "RandomSound" markers play a random Sound from a folder of variations.
 */
export function bindSoundsToAnimationEvents(
    animation: AnimationTrack,
    sounds: Folder,
    target: Instance,
): void {
    animation.GetMarkerReachedSignal(SOUND_EVENT).Connect((param?: string) => {
        const audioPlayer = param ? sounds.FindFirstChild(param) : undefined;
        if (audioPlayer && audioPlayer.IsA("AudioPlayer")) {
            playSoundFromSource(audioPlayer, target); // ✅ audioPlayer is an AudioPlayer
        }
    });

    animation.GetMarkerReachedSignal(RANDOM_SOUND_EVENT).Connect((param?: string) => {
        const folder = param ? sounds.FindFirstChild(param) : undefined;
        if (folder && folder.IsA("Folder")) {
            playRandomSoundFromSource(folder, target);
        }
    });
}