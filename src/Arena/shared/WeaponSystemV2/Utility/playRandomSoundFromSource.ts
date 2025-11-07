import playSoundFromSource from "./playSoundFromSource";

const random = new Random();

export default function playRandomSoundFromSource(soundTemplates: Folder, target: Instance): void {
    const sounds = soundTemplates.GetChildren();
    if (sounds.size() === 0) return;

    const index = random.NextInteger(1, sounds.size());
    const sound = sounds[index - 1] as AudioPlayer;

    if (!sound) return;
    const pitch = math.clamp(math.random() * 0.4 + 0.8, 0.8, 1.2); // Random between 0.8–1.2
    sound.PlaybackSpeed = pitch;

    playSoundFromSource(sound, target);
}
