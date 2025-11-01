import { TweenService, ReplicatedStorage, SoundService } from "@rbxts/services";

const originalStates = new Map<TextButton | ImageButton, { size: UDim2; position: UDim2 }>();


export function registerOriginalState(button: TextButton | ImageButton) {
    originalStates.set(button, {
        size: button.Size,
        position: button.Position,
    });
}

export function playSound(soundId: string) {
    print("Attempting to play sound");
    if (!soundId) return;

    const sound = new Instance("Sound");
    sound.SoundId = soundId;
    sound.Volume = 1;
    sound.PlaybackSpeed = 1;
    sound.Parent = SoundService;

    sound.Play();
    sound.Ended.Connect(() => sound.Destroy());
}

export function hoverEffect(button: TextButton | ImageButton, soundId?: string) {
    const original = originalStates.get(button);
    if (!original) return;

    playSound("rbxassetid://86901006903445");

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        Size: original.size.add(UDim2.fromOffset(5, 5)),
        //Position: original.position.sub(UDim2.fromScale(0, 0.1)),
    });
    tween.Play();
}

export function unhoverEffect(button: TextButton | ImageButton) {
    const original = originalStates.get(button);
    if (!original) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        Size: original.size,
        //Position: original.position,
    });
    tween.Play();
}

let selectedGridButton: TextButton | ImageButton | undefined;
export function hoverGridEffect(button: TextButton | ImageButton) {
    if (button === selectedGridButton) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        BackgroundColor3: Color3.fromRGB(180, 110, 0)
    });
    tween.Play();
}

export function unhoverGridEffect(button: TextButton | ImageButton) {
    if (button === selectedGridButton) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        BackgroundColor3: Color3.fromRGB(255, 180, 60)
    });
    tween.Play();
}

export function clickGridEffect(
    button: TextButton | ImageButton,
    allButtons: (TextButton | ImageButton)[]
) {
    // Reset previously selected button if it exists and isn't the same
    if (selectedGridButton && selectedGridButton !== button) {
        const reset = TweenService.Create(selectedGridButton, new TweenInfo(0.2), {
            BackgroundColor3: Color3.fromRGB(255, 180, 60)
        });
        reset.Play();
    }

    // Update selection
    selectedGridButton = button;

    // Highlight the clicked button
    const highlight = TweenService.Create(button, new TweenInfo(0.2), {
        BackgroundColor3: Color3.fromRGB(180, 110, 0)
    });
    highlight.Play();

    // Dim all other buttons (optional, if you want to emphasize the selected one)
    // for (const other of allButtons) {
    //     if (other !== button) {
    //         const dim = TweenService.Create(other, new TweenInfo(0.2), {
    //             BackgroundTransparency: 0.8,
    //         });
    //         dim.Play();
    //     }
    // }
}

// export function clickEffect(button: TextButton | ImageButton, allButtons: (TextButton | ImageButton)[]) {
//     const fade = TweenService.Create(button, new TweenInfo(0.2), {
//         BackgroundTransparency: 0.2,
//     });
//     fade.Play();

//     for (const other of allButtons) {
//         if (other !== button) {
//             const dim = TweenService.Create(other, new TweenInfo(0.2), {
//                 BackgroundTransparency: 0.8,
//             });
//             dim.Play();
//         }
//     }
// }

export function clickEffect(
    button: TextButton | ImageButton,
    allButtons: (TextButton | ImageButton)[],
) {
    button.ZIndex = 1;
    for (const other of allButtons) {
        if (other === button) {
            other.BackgroundColor3 = Color3.fromRGB(255, 200, 150); // Highlighted
        } else {
            other.ZIndex = 0;
            other.BackgroundColor3 = Color3.fromRGB(150, 100, 85); // Dimmed
        }
    }
}