import { TweenService } from "@rbxts/services";

const originalStates = new Map<TextButton | ImageButton, { size: UDim2; position: UDim2 }>();

export function registerOriginalState(button: TextButton | ImageButton) {
    originalStates.set(button, {
        size: button.Size,
        position: button.Position,
    });
}

export function hoverEffect(button: TextButton | ImageButton) {
    const original = originalStates.get(button);
    if (!original) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        Size: original.size.add(UDim2.fromOffset(10, 10)),
        Position: original.position.sub(UDim2.fromScale(0, 0.1)),
    });
    tween.Play();
}

export function unhoverEffect(button: TextButton | ImageButton) {
    const original = originalStates.get(button);
    if (!original) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        Size: original.size,
        Position: original.position,
    });
    tween.Play();
}

let selectedGridButton: TextButton | ImageButton | undefined;
export function hoverGridEffect(button: TextButton | ImageButton) {
    if (button === selectedGridButton) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        BackgroundTransparency: 0.5,
    });
    tween.Play();
}

export function unhoverGridEffect(button: TextButton | ImageButton) {
    if (button === selectedGridButton) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        BackgroundTransparency: 0.7,
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
            BackgroundTransparency: 0.7,
        });
        reset.Play();
    }

    // Update selection
    selectedGridButton = button;

    // Highlight the clicked button
    const highlight = TweenService.Create(button, new TweenInfo(0.2), {
        BackgroundTransparency: 0.2,
    });
    highlight.Play();

    // Dim all other buttons (optional, if you want to emphasize the selected one)
    for (const other of allButtons) {
        if (other !== button) {
            const dim = TweenService.Create(other, new TweenInfo(0.2), {
                BackgroundTransparency: 0.8,
            });
            dim.Play();
        }
    }
}

export function clickEffect(button: TextButton | ImageButton, allButtons: (TextButton | ImageButton)[]) {
    const fade = TweenService.Create(button, new TweenInfo(0.2), {
        BackgroundTransparency: 0.2,
    });
    fade.Play();

    for (const other of allButtons) {
        if (other !== button) {
            const dim = TweenService.Create(other, new TweenInfo(0.2), {
                BackgroundTransparency: 0.8,
            });
            dim.Play();
        }
    }
}