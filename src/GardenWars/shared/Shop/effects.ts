//Define Effects for guielements in guiManager.ts

export function applyHoverExpand(instance: GuiObject) {
    const originalSize = instance.Size;
    const originalPosition = instance.Position;

    instance.MouseEnter.Connect(() => {
        instance.TweenSizeAndPosition(
            new UDim2(
                originalSize.X.Scale * 1.05,
                originalSize.X.Offset * 1.05,
                originalSize.Y.Scale * 1.05,
                originalSize.Y.Offset * 1.05
            ),
            new UDim2(
                originalPosition.X.Scale,
                originalPosition.X.Offset,
                originalPosition.Y.Scale - 0.02,
                originalPosition.Y.Offset - 2
            ),
            Enum.EasingDirection.Out,
            Enum.EasingStyle.Quad,
            0.2,
            true
        );
    });

    instance.MouseLeave.Connect(() => {
        instance.TweenSizeAndPosition(
            originalSize,
            originalPosition,
            Enum.EasingDirection.Out,
            Enum.EasingStyle.Quad,
            0.2,
            true
        );
    });
}

export function applyHoverShrink(instance: GuiObject) {
    const originalSize = instance.Size;
    const originalPosition = instance.Position;

    instance.MouseEnter.Connect(() => {
        instance.TweenSizeAndPosition(
            new UDim2(
                originalSize.X.Scale * 0.95,
                originalSize.X.Offset,
                originalSize.Y.Scale * 0.95,
                originalSize.Y.Offset
            ),
            new UDim2(
                originalPosition.X.Scale,
                originalPosition.X.Offset,
                originalPosition.Y.Scale,
                originalPosition.Y.Offset
            ),
            Enum.EasingDirection.Out,
            Enum.EasingStyle.Quad,
            0.2,
            true
        );
    });

    instance.MouseLeave.Connect(() => {
        instance.TweenSizeAndPosition(
            originalSize,
            originalPosition,
            Enum.EasingDirection.Out,
            Enum.EasingStyle.Quad,
            0.2,
            true
        );
    });
}

export function applyPressEffect(instance: GuiObject) {
    const originalSize = instance.Size;
    const originalPosition = instance.Position;

    if (instance.IsA("TextButton") || instance.IsA("ImageButton")) {
        const button = instance as TextButton | ImageButton;

        button.MouseButton1Down.Connect(() => {
            button.TweenSizeAndPosition(
                new UDim2(
                    originalSize.X.Scale * 0.95,
                    originalSize.X.Offset * 0.95,
                    originalSize.Y.Scale * 0.95,
                    originalSize.Y.Offset * 0.95
                ),
                new UDim2(
                    originalPosition.X.Scale,
                    originalPosition.X.Offset,
                    originalPosition.Y.Scale,
                    originalPosition.Y.Offset
                ),
                Enum.EasingDirection.Out,
                Enum.EasingStyle.Quad,
                0.1,
                true
            );
        });

        button.MouseButton1Up.Connect(() => {
            button.TweenSizeAndPosition(
                originalSize,
                originalPosition,
                Enum.EasingDirection.Out,
                Enum.EasingStyle.Quad,
                0.1,
                true
            );
        });
    }
}