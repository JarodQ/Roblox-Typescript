import { TweenService } from "@rbxts/services";

const originalStates = new Map<TextButton, { size: UDim2; position: UDim2 }>();

export function registerOriginalState(button: TextButton) {
    originalStates.set(button, {
        size: button.Size,
        position: button.Position,
    });
}

export function hoverEffect(button: TextButton) {
    const original = originalStates.get(button);
    if (!original) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        Size: original.size.add(UDim2.fromOffset(10, 10)),
        Position: original.position.sub(UDim2.fromScale(0, 0.1)),
    });
    tween.Play();
}

export function unhoverEffect(button: TextButton) {
    const original = originalStates.get(button);
    if (!original) return;

    const tween = TweenService.Create(button, new TweenInfo(0.2), {
        Size: original.size,
        Position: original.position,
    });
    tween.Play();
}

export function clickEffect(button: TextButton, allButtons: TextButton[]) {
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