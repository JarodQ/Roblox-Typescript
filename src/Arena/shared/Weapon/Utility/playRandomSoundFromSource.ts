import { playSoundFromSource } from "./playSoundFromSource";
const rng = new Random();

/**
 * Plays a random Sound from a folder of sound templates.
 * The selected sound is played from the given target instance.
 *
 * @param soundTemplates - A Folder containing Sound instances
 * @param target - The Instance to parent the sound to
 */
export function playRandomSoundFromSource(soundTemplates: Folder, target: Instance): void {
    const players = soundTemplates.GetChildren().filter(
        (child): child is AudioPlayer => child.IsA("AudioPlayer"),
    );

    if (players.size() === 0) {
        warn("playRandomSoundFromSource: No AudioPlayer instances found in folder.");
        return;
    }

    const index = rng.NextInteger(1, players.size());
    const selectedPlayer = players[index - 1];

    playSoundFromSource(selectedPlayer, target); // ✅ Now matches AudioPlayer type
}