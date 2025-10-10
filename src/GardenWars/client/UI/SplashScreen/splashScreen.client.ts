throw "This module is disabled temporarily";
import { Players, ReplicatedStorage, UserInputService, TweenService } from "@rbxts/services";
import { StarterGui } from "@rbxts/services";

// Disable toolbelt and reset button
StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);
pcall(() => StarterGui.SetCore("ResetButtonCallback", false));

const splashProgressRemote = ReplicatedStorage.WaitForChild("SplashProgressRemote") as RemoteEvent;

const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
const splashGui = playerGui.WaitForChild("SplashScreen") as ScreenGui;

const backgroundImage = splashGui.WaitForChild("BackgroundImage") as ImageLabel;
const titleImage = splashGui.WaitForChild("TitleImage") as ImageLabel;
const titleSound = splashGui.WaitForChild("TitleSound") as Sound;
const grassSound = splashGui.WaitForChild("GrassSound") as Sound;
const progressFrame = splashGui.WaitForChild("ProgressBarFrame") as Frame;
const progressFill = progressFrame.WaitForChild("ProgressBarFill") as Frame;
const continueText = splashGui.WaitForChild("ContinueText") as TextLabel;
const continueSound = splashGui.FindFirstChild("ContinueSound") as Sound | undefined;
const progressValue = ReplicatedStorage.WaitForChild("GameLoadProgress") as NumberValue;

const tweenTransparency = (guiObject: GuiObject, property: "ImageTransparency" | "BackgroundTransparency" | "TextTransparency" | "TextStrokeTransparency", target: number, duration = 0.5, waitCompleted: boolean) => {

    const tweenInfo = new TweenInfo(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.In);
    const tween = TweenService.Create(guiObject, tweenInfo, { [property]: target });
    tween.Play();
    if (waitCompleted) tween.Completed.Wait();
    print(`Tween Completed for: ${guiObject}`)
};

const tweenSize = (guiObject: GuiObject, property: "Size" | "TextSize", target: UDim2, duration = 0.5, waitCompleted: boolean) => {
    const tweenInfo = new TweenInfo(duration, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
    const tween = TweenService.Create(guiObject, tweenInfo, { [property]: target });
    tween.Play();
    if (waitCompleted) tween.Completed.Wait();
    print(`Tween Completed for: ${guiObject}`)

};


// Fade in splash screen elements
const fadeInSplash = () => {
    backgroundImage.ImageTransparency = 1;
    grassSound.Play();
    tweenTransparency(backgroundImage, "ImageTransparency", 0, 3, true);

};

const fadeInProgress = () => {
    progressFrame.BackgroundTransparency = 1;
    progressFill.BackgroundTransparency = 1;
    tweenTransparency(progressFrame, "BackgroundTransparency", 0, 1, false);
    tweenTransparency(progressFill, "BackgroundTransparency", 0, 1, true);
}

const tweenInTitle = () => {
    titleImage.Size = new UDim2(2.75, 0, 1.5, 0);
    titleImage.ImageTransparency = 1;

    tweenTransparency(titleImage, "ImageTransparency", 0, 1, false);
    titleSound.Play();
    tweenSize(titleImage, "Size", new UDim2(.75, 0, .5, 0), .5, true);
}

// Update progress bar fill
const updateProgress = (value: number) => {
    const clamped = math.clamp(value, 0, 100);
    progressFill.Size = new UDim2(clamped / 100, 0, 1, 0);
};

// Fade out progress bar
const fadeOutProgressBar = () => {
    progressFrame.TweenSize(new UDim2(0, 0, 0, 0), Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 0.5, true);
};

// Fade in "Press any key" text
const fadeInContinueText = () => {
    continueText.TextTransparency = 1;
    continueText.TextStrokeTransparency = 1
    tweenTransparency(continueText, "TextTransparency", 0, 0.5, false);
    tweenTransparency(continueText, "TextStrokeTransparency", 0, 0.5, false);
};

let hasPrompted = false;

fadeInSplash();
tweenInTitle();
fadeInProgress();
splashProgressRemote.FireServer();
// Listen for progress updates
progressValue.Changed.Connect((value) => {
    print("Progress Change entered;")
    updateProgress(value);

    if (value >= 100 && !hasPrompted) {
        hasPrompted = true;
        //fadeOutProgressBar();
        wait(0.6);
        fadeInContinueText();
    }
});


// Listen for any input to continue
UserInputService.InputBegan.Connect(() => {
    if (hasPrompted) {
        if (continueSound) continueSound.Play();
        splashGui.Enabled = false;
    }

    // Re-enable toolbelt and reset button
    StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, true);
    pcall(() => StarterGui.SetCore("ResetButtonCallback", true));
});