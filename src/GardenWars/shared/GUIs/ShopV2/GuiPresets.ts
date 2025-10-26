// GuiPresets.ts
import { GuiElementDescriptor } from "./Frames/buildGuiComponent";
import { hoverEffect, unhoverEffect, clickEffect, registerOriginalState } from "./GuiEffects";
type GuiChildren = GuiElementDescriptor<keyof CreatableInstances>[];


export function createFrame(options?: {
    name?: string;
    position?: UDim2;
    size?: UDim2;
    anchorPoint?: Vector2;
    backgroundColor?: Color3;
    backgroundTransparency?: number;
    borderSizePixel?: number;
    clipDescendants?: boolean;
    zIndex?: number;
    children?: GuiChildren;
}): GuiElementDescriptor<"Frame"> {
    const {
        name = "Frame",
        position = UDim2.fromScale(0.5, 0.5),
        size = UDim2.fromScale(0.3, 0.3),
        anchorPoint = new Vector2(0, 0),
        backgroundColor = new Color3(0, 0, 0),
        backgroundTransparency = 0.55,
        borderSizePixel = 0,
        clipDescendants = false,
        zIndex = 1,
        children,
    } = options ?? {};

    return {
        type: "Frame",
        name,
        properties: {
            AnchorPoint: anchorPoint,
            Position: position,
            Size: size,
            BackgroundColor3: backgroundColor,
            BackgroundTransparency: backgroundTransparency,
            BorderSizePixel: borderSizePixel,
            ClipsDescendants: clipDescendants,
            ZIndex: zIndex,
        },
        children,
    };
}

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

export function createUIstroke(options?: {
    applyStrokeMode?: Enum.ApplyStrokeMode;
    thickness?: number;
    color?: Color3;
    children?: GuiChildren;
}): GuiElementDescriptor<"UIStroke"> {
    const {
        applyStrokeMode = Enum.ApplyStrokeMode.Contextual,
        thickness = 8,
        color = new Color3(0, 0, 0),
        children } = options ?? {};
    return {
        type: "UIStroke",
        name: "UIStroke",
        properties: {
            ApplyStrokeMode: applyStrokeMode,
            Thickness: thickness,
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
    name?: string;
    imageId?: string;
    anchorPoint?: Vector2;
    backgroundColor?: Color3;
    backgroundTransparency?: number;
    position?: UDim2;
    size?: UDim2;
    onMount?: (label: ImageLabel) => void;
    children?: GuiChildren;
}): GuiElementDescriptor<"ImageLabel"> {
    const {
        name = "ImageLabel",
        imageId = "",
        anchorPoint = new Vector2(0, 0),
        backgroundColor = Color3.fromRGB(0, 0, 0),
        backgroundTransparency = 1,
        position = UDim2.fromScale(0.353, -0.353),
        size = UDim2.fromScale(1.294, 1.294),
        onMount,
        children,
    } = options ?? {};

    return {
        type: "ImageLabel",
        name,
        properties: {
            AnchorPoint: anchorPoint,
            BackgroundColor3: backgroundColor,
            BackgroundTransparency: backgroundTransparency,
            Position: position,
            Size: size,
            Image: imageId,
        },
        onMount: (instance) => {
            if (instance.IsA("ImageLabel") && onMount) {
                onMount(instance);
            }
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
    textWrapped?: boolean;
    textScaled?: boolean;
    zIndex?: number;
    textStrokeColor?: Color3;
    textStrokeTransparency?: number;
    backgroundTransparency?: number;
    name?: string;
    onMount?: (label: TextLabel) => void;
    children?: GuiChildren;
}): GuiElementDescriptor<"TextLabel"> {
    const {
        anchorPoint = new Vector2(0, 0),
        text = "Default Text",
        textColor = Color3.fromRGB(255, 255, 255),
        position = UDim2.fromScale(0, -0.74),
        size = UDim2.fromScale(1, 0.22),
        font = Enum.Font.FredokaOne,
        textSize = 25,
        textWrapped = false,
        textScaled = false,
        zIndex = 2,
        textStrokeColor = Color3.fromRGB(0, 0, 0),
        textStrokeTransparency = 1,
        backgroundTransparency = 1,
        name = "TextLabel",
        onMount,
        children,
    } = options ?? {};

    return {
        type: "TextLabel",
        name,
        properties: {
            Name: name,
            AnchorPoint: anchorPoint,
            BackgroundTransparency: backgroundTransparency,
            Position: position,
            Size: size,
            Text: text,
            TextColor3: textColor,
            TextWrapped: textWrapped,
            TextScaled: textScaled,
            ZIndex: zIndex,
            Font: font,
            TextSize: textSize,
            TextStrokeColor3: textStrokeColor,
            TextStrokeTransparency: textStrokeTransparency,
        },
        onMount: (instance) => {
            if (instance.IsA("TextLabel") && onMount) {
                onMount(instance);
            }
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
    font?: Enum.Font;
    text?: string;
    textWrapped?: boolean;
    textColor?: Color3;
    textSize?: number;
    textStrokeColor?: Color3;
    textStrokeTransparency?: number;
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
        font = Enum.Font.FredokaOne,
        text = "",
        textWrapped = false,
        textColor = Color3.fromRGB(255, 255, 255),
        textSize = 20,
        textStrokeColor = Color3.fromRGB(0, 0, 0),
        textStrokeTransparency = 0,
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
            Font: font,
            Text: text,
            TextWrapped: textWrapped,
            TextColor3: textColor,
            TextSize: textSize,
            TextStrokeTransparency: textStrokeTransparency,
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



export function createTextBox(options?: {
    name?: string;
    position?: UDim2;
    size?: UDim2;
    anchorPoint?: Vector2;
    backgroundColor?: Color3;
    backgroundTransparency?: number;
    text?: string;
    textColor?: Color3;
    font?: Enum.Font;
    textSize?: number;
    textWrapped?: boolean;
    placeholderText?: string;
    textStrokeColor?: Color3;
    textStrokeTransparency?: number;
    clearTextOnFocus?: boolean;
    onFocusLost?: (textbox: TextBox, enterPressed: boolean) => void;
    onMount?: (textbox: TextBox) => void;
    children?: GuiChildren;
}): GuiElementDescriptor<"TextBox"> {
    const {
        name = "TextBox",
        position = UDim2.fromScale(0.5, 0.5),
        size = UDim2.fromScale(0.3, 0.1),
        anchorPoint = new Vector2(0, 0),
        backgroundColor = new Color3(0, 0, 0),
        backgroundTransparency = 0.4,
        text = "",
        textColor = new Color3(255, 255, 255),
        textWrapped = false,
        font = Enum.Font.FredokaOne,
        textSize = 20,
        placeholderText = "",
        textStrokeColor = Color3.fromRGB(0, 0, 0),
        textStrokeTransparency = 0,
        clearTextOnFocus = false,
        onFocusLost,
        onMount,
        children,
    } = options ?? {};

    return {
        type: "TextBox",
        name,
        properties: {
            AnchorPoint: anchorPoint,
            Position: position,
            Size: size,
            BackgroundColor3: backgroundColor,
            BackgroundTransparency: backgroundTransparency,
            Text: text,
            TextColor3: textColor,
            TextWrapped: textWrapped,
            Font: font,
            TextSize: textSize,
            PlaceholderText: placeholderText,
            TextStrokeColor3: textStrokeColor,
            TextStrokeTransparency: textStrokeTransparency,
            ClearTextOnFocus: clearTextOnFocus,
        },
        onMount: (instance: Instance) => {
            if (instance.IsA("TextBox")) {
                const textbox = instance as TextBox;
                if (onFocusLost) {
                    textbox.FocusLost.Connect((enterPressed) => onFocusLost(textbox, enterPressed));
                }
                if (onMount) onMount(textbox);
            }
        },
        children,
    };
}

export function createImageButton(options?: {
    name?: string;
    position?: UDim2;
    size?: UDim2;
    anchorPoint?: Vector2;
    backgroundColor?: Color3;
    backgroundTransparency?: number;
    image?: string;
    imageColor?: Color3;
    imageTransparency?: number;
    scaleType?: Enum.ScaleType;
    sliceCenter?: Rect;
    sliceScale?: number;
    onClick?: () => void;
    onHover?: (button: ImageButton) => void;
    onUnhover?: (button: ImageButton) => void;
    onActivated?: (button: ImageButton) => void;
    onMount?: (button: ImageButton) => void;
    children?: GuiChildren;
}): GuiElementDescriptor<"ImageButton"> {
    const {
        name = "ImageButton",
        position = UDim2.fromScale(0.5, 0.5),
        size = UDim2.fromScale(0.2, 1.785),
        anchorPoint = new Vector2(0.5, 0.5),
        backgroundColor = new Color3(0, 0, 0),
        backgroundTransparency = 1,
        image = "",
        imageColor = new Color3(1, 1, 1),
        imageTransparency = 0,
        scaleType = Enum.ScaleType.Stretch,
        sliceCenter,
        sliceScale,
        onClick,
        onHover,
        onUnhover,
        onActivated,
        onMount,
        children,
    } = options ?? {};

    return {
        type: "ImageButton",
        name,
        properties: {
            AnchorPoint: anchorPoint,
            Position: position,
            Size: size,
            BackgroundColor3: backgroundColor,
            BackgroundTransparency: backgroundTransparency,
            Image: image,
            ImageColor3: imageColor,
            ImageTransparency: imageTransparency,
            ScaleType: scaleType,
            SliceCenter: sliceCenter,
            SliceScale: sliceScale,
        },
        onClick,
        onMount: (instance: Instance) => {
            if (instance.IsA("ImageButton")) {
                const button = instance as ImageButton;
                registerOriginalState(button);
                if (onHover) button.MouseEnter.Connect(() => onHover(button));
                if (onUnhover) button.MouseLeave.Connect(() => onUnhover(button));
                if (onActivated) button.Activated.Connect(() => onActivated(button));
                if (onMount) onMount(button);
            }
        },
        children,
    };
}

export function createScrollingFrame(options?: {
    name?: string;
    position?: UDim2;
    size?: UDim2;
    anchorPoint?: Vector2;
    backgroundColor?: Color3;
    backgroundTransparency?: number;
    borderSizePixel?: number;
    canvasSize?: UDim2;
    automaticCanvasSize?: Enum.AutomaticSize;
    scrollingDirection?: Enum.ScrollingDirection;
    scrollBarThickness?: number;
    zIndex?: number;
    onMount?: (frame: ScrollingFrame) => void;
    children?: GuiChildren;
}): GuiElementDescriptor<"ScrollingFrame"> {
    const {
        name = "ScrollingFrame",
        position = UDim2.fromScale(0.5, 0.5),
        size = UDim2.fromScale(0.3, 0.3),
        anchorPoint = new Vector2(0, 0),
        backgroundColor = new Color3(0, 0, 0),
        backgroundTransparency = 0.55,
        borderSizePixel = 0,
        canvasSize = new UDim2(0, 0, 0, 0),
        automaticCanvasSize = Enum.AutomaticSize.Y,
        scrollingDirection = Enum.ScrollingDirection.Y,
        scrollBarThickness = 6,
        zIndex = 1,
        onMount,
        children,
    } = options ?? {};

    return {
        type: "ScrollingFrame",
        name,
        properties: {
            AnchorPoint: anchorPoint,
            Position: position,
            Size: size,
            BackgroundColor3: backgroundColor,
            BackgroundTransparency: backgroundTransparency,
            BorderSizePixel: borderSizePixel,
            CanvasSize: canvasSize,
            AutomaticCanvasSize: automaticCanvasSize,
            ScrollingDirection: scrollingDirection,
            ScrollBarThickness: scrollBarThickness,
            ZIndex: zIndex,
        },
        onMount: (instance: Instance) => {
            if (instance.IsA("ScrollingFrame")) {
                const frame = instance as ScrollingFrame;
                if (onMount) onMount(frame);
            }
        },
        children,
    };
}

export function createUIGridLayout(options?: {
    cellPadding?: UDim2;
    cellSize?: UDim2;
    sortOrder?: Enum.SortOrder;
    fillDirection?: Enum.FillDirection;
    fillDirectionMaxCells?: number;
    horizontalAlignment?: Enum.HorizontalAlignment;
    children?: GuiChildren;
}): GuiElementDescriptor<"UIGridLayout"> {
    const {
        cellPadding = new UDim2(0, 40, 0, 40),
        cellSize = new UDim2(0, 100, 0, 100),
        sortOrder = Enum.SortOrder.LayoutOrder,
        fillDirection = Enum.FillDirection.Horizontal,
        fillDirectionMaxCells = 2,
        horizontalAlignment = Enum.HorizontalAlignment.Center,
        children,
    } = options ?? {};

    return {
        type: "UIGridLayout",
        name: "Grid",
        properties: {
            CellPadding: cellPadding,
            CellSize: cellSize,
            SortOrder: sortOrder,
            FillDirection: fillDirection,
            HorizontalAlignment: horizontalAlignment,
            FillDirectionMaxCells: fillDirectionMaxCells,
        },
        children,
    };
}

export function createUIPadding(options?: {
    paddingTop?: UDim;
    paddingBottom?: UDim;
    paddingLeft?: UDim;
    paddingRight?: UDim;
    children?: GuiChildren;
}): GuiElementDescriptor<"UIPadding"> {
    const {
        paddingTop = new UDim(0, 6),
        paddingBottom = new UDim(0, 6),
        paddingLeft = new UDim(0, 6),
        paddingRight = new UDim(0, 6),
        children,
    } = options ?? {};

    return {
        type: "UIPadding",
        name: "Padding",
        properties: {
            PaddingTop: paddingTop,
            PaddingBottom: paddingBottom,
            PaddingLeft: paddingLeft,
            PaddingRight: paddingRight,
        },
        children,
    };
}