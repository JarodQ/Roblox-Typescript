import PlaySound = require("Arena/shared/WeaponSystem/Remotes/PlaySound");


PlaySound.OnClientEvent.Connect((soundString: string, weaponTool: Tool) => {
    playSound(soundString, weaponTool);
});

function playSound(soundString: string, weaponTool: Tool): void {
    const soundFolder = weaponTool.FindFirstChild("Sounds") as Folder;
    print(soundString)
    const soundSubFolder = soundFolder.FindFirstChild(soundString) as Folder;
    const variants = soundSubFolder.GetChildren()
    const sound = variants[math.random(0, variants.size() - 1)] as Sound;

    if (!sound) return;
    const pitch = math.clamp(math.random() * 0.4 + 0.8, 0.8, 1.2); // Random between 0.8–1.2
    sound.PlaybackSpeed = pitch;
    sound.Play();
}