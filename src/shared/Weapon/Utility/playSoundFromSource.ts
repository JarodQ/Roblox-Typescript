/**
 * Clones and plays an AudioPlayer from a template, wiring it to a target instance.
 * Automatically cleans up after playback ends.
 *
 * @param playerTemplate - The AudioPlayer instance to clone
 * @param target - The instance to wire the audio to
 */
export function playSoundFromSource(playerTemplate: AudioPlayer, target: Instance): void {
    const audioPlayer = playerTemplate.Clone();
    audioPlayer.Parent = target;

    const wire = new Instance("Wire");
    wire.SourceInstance = audioPlayer;
    wire.TargetInstance = target;
    wire.Parent = audioPlayer;

    audioPlayer.Play();

    audioPlayer.Ended.Once(() => {
        audioPlayer.Destroy();
    });
}