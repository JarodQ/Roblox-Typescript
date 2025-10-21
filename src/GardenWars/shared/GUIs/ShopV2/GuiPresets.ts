// GuiPresets.ts
import { GuiElementDescriptor } from "./Frames/buildGuiComponent";
import { hoverEffect, unhoverEffect, clickEffect, registerOriginalState } from "./GuiEffects";
type GuiChildren = GuiElementDescriptor<keyof CreatableInstances>[];



export function createUICorner(options?: {
    radius?: number;
    children?: GuiChildren;
}): GuiElementDescriptor<"UICorner"> {
    const { radius = 8, children } = options ?? {};
    return {
        type: "UICorner",
        name: "UICorner",
        properties: {
            CornerRadius: new UDim(0, radius),
        },
        children,
    };
}

export function createUIGradient(options?: {
    rotation?: number;
    color1?: Color3;
    color2?: Color3;
    transparency1?: number;
    transparency2?: number;
    children?: GuiChildren;
}): GuiElementDescriptor<"UIGradient"> {
    const {
        rotation = 90,
        color1 = Color3.fromRGB(0, 0, 0),
        color2 = Color3.fromRGB(0, 0, 0),
        transparency1 = 0.5,
        transparency2 = 1,
        children,
    } = options ?? {};

    return {
        type: "UIGradient",
        name: "UIGradient",
        properties: {
            Rotation: rotation,
            Color: new ColorSequence(color1, color2),
            Transparency: new NumberSequence(transparency1, transparency2),
        },
        children,
    };
}

export function createImageLabel(options?: {
    imageId?: string;
    anchorPoint?: Vector2;
    backgroundTransparency?: number;
    position?: UDim2;
    size?: UDim2;
    children?: GuiChildren;
}): GuiElementDescriptor<"ImageLabel"> {
    const {
        imageId = "0",
        anchorPoint = new Vector2(0.5, 0),
        backgroundTransparency = 1,
        position = UDim2.fromScale(0.353, -0.353),
        size = UDim2.fromScale(1.294, 1.294),
        children,
    } = options ?? {};

    return {
        type: "ImageLabel",
        name: "ImageLabel",
        properties: {
            AnchorPoint: anchorPoint,
            BackgroundTransparency: backgroundTransparency,
            Position: position,
            Size: size,
            Image: `rbxassetid://${imageId}`,
        },
        children,
    };
}

export function createTextLabel(options?: {
    anchorPoint?: Vector2;
    text?: string;
    textColor?: Color3;
    position?: UDim2;
    size?: UDim2;
    font?: Enum.Font;
    textSize?: number;
    zIndex?: number;
    textStrokeTransparency?: number;
    backgroundTransparency?: number;
    name?: string;
    children?: GuiChildren;
}): GuiElementDescriptor<"TextLabel"> {
    const {
        anchorPoint = new Vector2(0, 0),
        text = "",
        textColor = Color3.fromRGB(255, 255, 255),
        position = UDim2.fromScale(0, -0.74),
        size = UDim2.fromScale(1, 0.22),
        font = Enum.Font.FredokaOne,
        textSize = 25,
        zIndex = 2,
        textStrokeTransparency = 0,
        backgroundTransparency = 1,
        name = "TextLabel",
        children,
    } = options ?? {};

    return {
        type: "TextLabel",
        name,
        properties: {
            Name: "Title",
            AnchorPoint: anchorPoint,
            BackgroundTransparency: backgroundTransparency,
            Position: position,
            Size: size,
            Text: text,
            TextColor3: textColor,
            ZIndex: zIndex,
            Font: font,
            TextSize: textSize,
            TextStrokeTransparency: textStrokeTransparency,
        },
        children,
    };
}

export function createTextButton(options?: {
    name?: string;
    position?: UDim2;
    size?: UDim2;
    anchorPoint?: Vector2;
    backgroundColor?: Color3;
    backgroundTransparency?: number;
    text?: string;
    onClick?: () => void;
    onHover?: (button: TextButton) => void;
    onUnhover?: (button: TextButton) => void;
    onActivated?: (button: TextButton) => void;
    onMount?: (button: TextButton) => void; // ✅ Add this line
    children?: GuiChildren;
}): GuiElementDescriptor<"TextButton"> {
    const {
        name = "TextButton",
        position = UDim2.fromScale(0.5, 0.5),
        size = UDim2.fromScale(0.2, 1.785),
        anchorPoint = new Vector2(0.5, 0.5),
        backgroundColor = new Color3(0, 0, 0),
        backgroundTransparency = 0.55,
        text = "",
        onClick,
        onHover,
        onUnhover,
        onActivated,
        onMount, // ✅ Destructure it here
        children,
    } = options ?? {};

    return {
        type: "TextButton",
        name,
        properties: {
            AnchorPoint: anchorPoint,
            Position: position,
            Size: size,
            BackgroundColor3: backgroundColor,
            BackgroundTransparency: backgroundTransparency,
            Text: text,
        },
        onClick,
        onMount: (instance: Instance) => {
            if (instance.IsA("TextButton")) {
                const button = instance as TextButton;
                registerOriginalState(button);
                if (onHover) button.MouseEnter.Connect(() => onHover(button));
                if (onUnhover) button.MouseLeave.Connect(() => onUnhover(button));
                if (onActivated) button.Activated.Connect(() => onActivated(button));
                if (onMount) onMount(button); // ✅ Invoke user-defined mount logic
            }
        },
        children,
    };
}