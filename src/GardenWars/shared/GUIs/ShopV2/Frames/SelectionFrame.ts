import { buildGuiComponent, GuiElementDescriptor } from "./buildGuiComponent";
import {
    createUICorner,
    createUIGradient,
    createImageLabel,
    createTextLabel,
    createTextButton
} from "../GuiPresets";
import { hoverEffect, unhoverEffect, clickEffect } from "../GuiEffects";

export class SelectionFrame {
    private frame: Frame;

    constructor(parent: ScreenGui, onModeChange: (mode: "buy" | "sell") => void) {
        const layout = getSelectionFrameLayout(onModeChange, () => parent.Destroy());
        this.frame = buildGuiComponent(layout, parent) as Frame;
    }
}

function getSelectionFrameLayout(
    onModeChange: (mode: "buy" | "sell") => void,
    onClose: () => void,
): GuiElementDescriptor<"Frame"> {
    // Track button instances for shared click effect
    const buttonInstances: TextButton[] = [];

    // Helper to attach effects
    const attachEffects = (button: TextButton) => {
        buttonInstances.push(button);
        button.MouseEnter.Connect(() => hoverEffect(button));
        button.MouseLeave.Connect(() => unhoverEffect(button));
        button.Activated.Connect(() => clickEffect(button, buttonInstances));
    };

    return {
        type: "Frame",
        name: "SelectionFrame",
        properties: {
            BackgroundColor3: new Color3(0, 0, 0),
            BackgroundTransparency: 0.55,
            Position: UDim2.fromScale(0.322, 0.85),
            Size: UDim2.fromScale(0.355, 0.086),
        },
        children: [
            createUICorner({ radius: 8 }),

            createTextButton({
                name: "OpenBuy",
                position: UDim2.fromScale(0.171, 0.945),
                size: UDim2.fromScale(0.2, 1.785),
                anchorPoint: new Vector2(0.5, 1),
                backgroundColor: new Color3(0, 0, 0),
                backgroundTransparency: 0.55,
                text: "",
                onClick: () => onModeChange("buy"),
                onMount: attachEffects,
                children: [
                    createUICorner({ radius: 8000 }),
                    createUIGradient(),
                    createImageLabel({ imageId: "125258365294427", position: UDim2.fromScale(0.35, -0.343) }),
                    createTextLabel({ text: "Buy", anchorPoint: new Vector2(0, 1), position: UDim2.fromScale(0, 1) }),
                ],
            }),

            createTextButton({
                name: "OpenSell",
                position: UDim2.fromScale(0.5, 0.966),
                size: UDim2.fromScale(0.2, 1.785),
                anchorPoint: new Vector2(0.5, 1),
                backgroundColor: new Color3(0, 0, 0),
                backgroundTransparency: 0.55,
                text: "",
                onClick: () => onModeChange("sell"),
                onMount: attachEffects,
                children: [
                    createUICorner({ radius: 8000 }),
                    createUIGradient(),
                    createImageLabel({ imageId: "106798179079568", position: UDim2.fromScale(0.35, -0.343) }),
                    createTextLabel({ text: "Sell", anchorPoint: new Vector2(0, 1), position: UDim2.fromScale(0, 1) }),

                ],
            }),

            createTextButton({
                name: "Close",
                position: UDim2.fromScale(0.82, 0.944),
                size: UDim2.fromScale(0.2, 1.785),
                anchorPoint: new Vector2(0.5, 1),
                backgroundColor: new Color3(0, 0, 0),
                backgroundTransparency: 0.55,
                text: "",
                onClick: () => onClose(),
                onMount: attachEffects,
                children: [
                    createUICorner({ radius: 8000 }),
                    createUIGradient(),
                    createImageLabel({ imageId: "120182446283422", position: UDim2.fromScale(0.5, -0.343) }),
                    createTextLabel({ text: "Close", anchorPoint: new Vector2(0, 1), position: UDim2.fromScale(0, 1) }),

                ],
            }),
        ],
    };
}
// function getSelectionFrameLayout(
//     onModeChange: (mode: "buy" | "sell") => void,
//     onClose: () => void,
// ): GuiElementDescriptor<"Frame"> {
//     return {
//         type: "Frame",
//         name: "SelectionFrame",
//         properties: {
//             BackgroundColor3: new Color3(0, 0, 0),
//             BackgroundTransparency: 0.55,
//             Position: UDim2.fromScale(0.322, 0.85),
//             Size: UDim2.fromScale(0.355, 0.086),
//         },
//         children: [
//             createUICorner({ radius: 8 }),
//             createTextButton({
//                 name: "OpenBuy",
//                 position: UDim2.fromScale(0.171, 0.945),
//                 size: UDim2.fromScale(0.2, 1.785),
//                 anchorPoint: new Vector2(0.5, 1),
//                 backgroundColor: new Color3(0, 0, 0),
//                 backgroundTransparency: 0.55,
//                 text: "",
//                 onClick: () => onModeChange("buy"),
//                 children: [
//                     createUICorner({ radius: 8000 }),
//                     createUIGradient({
//                         rotation: 90,
//                         color1: Color3.fromRGB(0, 0, 0),
//                         color2: Color3.fromRGB(0, 0, 0),
//                         transparency1: 0.5,
//                         transparency2: 1,
//                     }),
//                     createImageLabel({
//                         imageId: "125258365294427",
//                         anchorPoint: new Vector2(0.5, 0),
//                         backgroundTransparency: 1,
//                         position: UDim2.fromScale(0.353, -0.353),
//                         size: UDim2.fromScale(1.294, 1.294),
//                     }),
//                     createTextLabel({ text: "Buy" }),
//                 ],
//             }),
//             createTextButton({
//                 name: "OpenSell",
//                 position: UDim2.fromScale(0.5, 0.966),
//                 size: UDim2.fromScale(0.2, 1.785),
//                 anchorPoint: new Vector2(0.5, 1),
//                 backgroundColor: new Color3(0, 0, 0),
//                 backgroundTransparency: 0.55,
//                 text: "",
//                 onClick: () => onModeChange("sell"),
//                 children: [
//                     createUICorner({ radius: 8000 }),
//                     createUIGradient({
//                         rotation: 90,
//                         color1: Color3.fromRGB(0, 0, 0),
//                         color2: Color3.fromRGB(0, 0, 0),
//                         transparency1: 0.5,
//                         transparency2: 1,
//                     }),
//                     createImageLabel({
//                         imageId: "106798179079568",
//                         anchorPoint: new Vector2(0.5, 0),
//                         backgroundTransparency: 1,
//                         position: UDim2.fromScale(0.353, -0.353),
//                         size: UDim2.fromScale(1.294, 1.294),
//                     }),
//                     createTextLabel({ text: "Sell" }),
//                 ],
//             }),
//             createTextButton({
//                 name: "Close",
//                 position: UDim2.fromScale(0.82, 0.944),
//                 size: UDim2.fromScale(0.2, 1.785),
//                 anchorPoint: new Vector2(0.5, 1),
//                 backgroundColor: new Color3(0, 0, 0),
//                 backgroundTransparency: 0.55,
//                 text: "",
//                 onClick: () => onClose(),
//                 children: [
//                     createUICorner({ radius: 8000 }),
//                     createUIGradient({
//                         rotation: 90,
//                         color1: Color3.fromRGB(0, 0, 0),
//                         color2: Color3.fromRGB(0, 0, 0),
//                         transparency1: 0.5,
//                         transparency2: 1,
//                     }),
//                     createImageLabel({
//                         imageId: "120182446283422",
//                         anchorPoint: new Vector2(0.5, 0),
//                         backgroundTransparency: 1,
//                         position: UDim2.fromScale(0.491, -0.365),
//                         size: UDim2.fromScale(1.294, 1.294),
//                     }),
//                     createTextLabel({ text: "Close" }),
//                 ],
//             }),
//         ],
//     };
// }
