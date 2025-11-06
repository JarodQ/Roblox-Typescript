export default function playSoundFromSource(playerTemplate: AudioPlayer, target: Instance): void {
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
