import { Players, ReplicatedStorage, UserInputService, TweenService } from "@rbxts/services";
import { StarterGui } from "@rbxts/services";

// Disable toolbelt and reset button
StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);
pcall(() => StarterGui.SetCore("ResetButtonCallback", false));


const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
const splashGui = playerGui.WaitForChild("SplashScreen") as ScreenGui;

const backgroundImage = splashGui.WaitForChild("BackgroundImage") as ImageLabel;
const progressFrame = splashGui.WaitForChild("ProgressBarFrame") as Frame;
const progressFill = progressFrame.WaitForChild("ProgressBarFill") as Frame;
const continueText = splashGui.WaitForChild("ContinueText") as TextLabel;
const continueSound = splashGui.FindFirstChild("ContinueSound") as Sound | undefined;
const progressValue = ReplicatedStorage.WaitForChild("GameLoadProgress") as NumberValue;

continueText.Visible = false;

const tweenTransparency = (guiObject: GuiObject, property: "ImageTransparency" | "BackgroundTransparency" | "TextTransparency", target: number, duration = 0.5) => {
    const tweenInfo = new TweenInfo(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
    const tween = TweenService.Create(guiObject, tweenInfo, { [property]: target });
    tween.Play();
};


// Fade in splash screen elements
const fadeInSplash = () => {
    backgroundImage.ImageTransparency = 1;
    progressFrame.BackgroundTransparency = 1;
    progressFill.BackgroundTransparency = 1;

    tweenTransparency(backgroundImage, "ImageTransparency", 0, 1);
    tweenTransparency(progressFrame, "BackgroundTransparency", 0, 1);
    tweenTransparency(progressFill, "BackgroundTransparency", 0, 1);
};

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
    continueText.Visible = true;
    continueText.TextTransparency = 1;
    tweenTransparency(continueText, "TextTransparency", 0, 0.5);
};

let hasPrompted = false;

fadeInSplash();

// Listen for progress updates
progressValue.Changed.Connect((value) => {
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