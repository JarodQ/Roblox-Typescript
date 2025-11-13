import { Players, Workspace } from "@rbxts/services";
import TargetSelector, { TargetEntry, SelectTargetResult } from "./TargetSelector";

const DEFAULT_COLOR = Color3.fromRGB(0, 0, 255);
const HIGHLIGHTED_COLOR = Color3.fromRGB(255, 0, 0);

function angleToCircleSize(angle: number): number {
    const camera = Workspace.CurrentCamera;
    if (!camera) return 0;

    const fovY = math.rad(camera.FieldOfView);
    const viewportSize = camera.ViewportSize;
    const viewHeight = 2 * math.tan(fovY / 2);

    const angleRad = math.rad(angle / 2);
    const angleTangent = math.tan(angleRad);

    const proportion = angleTangent / viewHeight;
    const pixelDiameter = viewportSize.Y * proportion * 2;

    return pixelDiameter;
}

function createCircleGui(screenGui: ScreenGui): Frame {
    const circle = new Instance("Frame");
    circle.Name = "AimAssistRangeCircle";
    circle.BackgroundTransparency = 1;
    circle.AnchorPoint = new Vector2(0.5, 0.5);
    circle.Position = UDim2.fromScale(0.5, 0.5);
    circle.Size = UDim2.fromOffset(0, 0);
    circle.Parent = screenGui;

    const stroke = new Instance("UIStroke");
    stroke.Color = new Color3(1, 0, 0);
    stroke.Thickness = 1;
    stroke.Transparency = 0.3;
    stroke.Parent = circle;

    const corner = new Instance("UICorner");
    corner.CornerRadius = new UDim(1, 0);
    corner.Parent = circle;

    return circle;
}

interface DotInfo {
    dot: Part;
}

class AimAssistDebugVisualizer {
    private screenGui?: ScreenGui;
    private circle?: Frame;
    private rangeLabel?: TextLabel;
    private dotsFolder?: Folder;
    private activeDots: DotInfo[] = [];

    private createTargetDot(index: number) {
        const dot = new Instance("Part");
        dot.Material = Enum.Material.Plastic;
        dot.Shape = Enum.PartType.Ball;
        dot.Transparency = 1;
        dot.Anchored = true;
        dot.CanCollide = false;
        dot.CanQuery = false;
        dot.CanTouch = false;
        dot.Parent = this.dotsFolder;

        const highlight = new Instance("Highlight");
        highlight.Adornee = dot;
        highlight.Parent = dot;
        highlight.OutlineTransparency = 1;
        highlight.FillTransparency = 0.5;

        this.activeDots[index] = { dot };
    }

    private ensureTargetDotsCreated(count: number) {
        while (this.activeDots.size() < count) {
            this.createTargetDot(this.activeDots.size());
        }
    }

    clearTargetDots() {
        this.dotsFolder?.ClearAllChildren();
        this.activeDots = [];
    }

    updateTargetDots(
        allTargetPoints: TargetEntry[],
        targetResult?: SelectTargetResult,
    ) {
        const camera = Workspace.CurrentCamera;
        if (!camera) return;

        let pointCount = 0;

        for (const targetEntry of allTargetPoints) {
            if (!targetEntry.instance) continue;

            for (let i = 0; i < targetEntry.points.size(); i++) {
                const worldPoint = targetEntry.points[i];
                pointCount += 1;
                this.ensureTargetDotsCreated(pointCount);

                const dotInfo = this.activeDots[pointCount - 1];
                dotInfo.dot.Position = worldPoint;
                dotInfo.dot.Transparency = 0;

                let weight = 0;
                if (targetResult && targetEntry.instance === targetResult.instance) {
                    weight = targetResult.weights[i] ?? 0;
                }

                if (weight > 0) {
                    const color = DEFAULT_COLOR.Lerp(HIGHLIGHTED_COLOR, weight);
                    dotInfo.dot.Size = new Vector3(2, 2, 2);
                    const highlight = dotInfo.dot.FindFirstChild("Highlight") as Highlight;
                    highlight.FillColor = color;
                    dotInfo.dot.Color = color;
                } else {
                    dotInfo.dot.Size = new Vector3(1.5, 1.5, 1.5);
                    dotInfo.dot.Color = DEFAULT_COLOR;
                    const highlight = dotInfo.dot.FindFirstChild("Highlight") as Highlight;
                    highlight.FillColor = DEFAULT_COLOR;
                }
            }
        }

        for (let i = pointCount; i < this.activeDots.size(); i++) {
            this.activeDots[i].dot.Transparency = 1;
        }
    }

    createVisualElements() {
        const player = Players.LocalPlayer;
        if (!player) return;

        const screenGui = new Instance("ScreenGui");
        screenGui.Name = "AimAssistDebugGui";
        screenGui.ResetOnSpawn = false;
        screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
        screenGui.IgnoreGuiInset = true;
        screenGui.Parent = player.FindFirstChildOfClass("PlayerGui");

        const circle = createCircleGui(screenGui);

        const rangeLabel = new Instance("TextLabel");
        rangeLabel.Name = "RangeLabel";
        rangeLabel.BackgroundTransparency = 1;
        rangeLabel.Position = new UDim2(0.5, 0, 1, 10);
        rangeLabel.Size = UDim2.fromOffset(200, 20);
        rangeLabel.AnchorPoint = new Vector2(0.5, 0);
        rangeLabel.Font = Enum.Font.SourceSansBold;
        rangeLabel.TextColor3 = new Color3(1, 1, 1);
        rangeLabel.TextSize = 16;
        rangeLabel.TextStrokeTransparency = 0.5;
        rangeLabel.TextStrokeColor3 = new Color3(0, 0, 0);
        rangeLabel.Text = "Aim Assist Disabled";
        rangeLabel.Parent = circle;

        const dotsFolder = new Instance("Folder");
        dotsFolder.Name = "TargetDotsFolder";
        dotsFolder.Parent = Workspace;

        this.screenGui = screenGui;
        this.circle = circle;
        this.rangeLabel = rangeLabel;
        this.dotsFolder = dotsFolder;
        this.activeDots = [];
    }

    update(
        targetResult: SelectTargetResult | undefined,
        fov: number,
        allTargetPoints: TargetEntry[],
    ) {
        if (!this.screenGui || !this.circle || !this.rangeLabel || !this.dotsFolder) return;

        if (!targetResult) {
            const uiStroke = this.circle.FindFirstChild("UIStroke") as UIStroke;
            uiStroke.Color = new Color3(1, 1, 1);
            this.rangeLabel.Text = "Aim Assist Disabled";
        } else {
            const RED = new Color3(1, 0, 0);
            const BLUE = new Color3(0, 0, 1);
            const uiStroke = this.circle.FindFirstChild("UIStroke") as UIStroke;
            uiStroke.Color = RED.Lerp(BLUE, targetResult.normalizedAngle);
            this.rangeLabel.Text = `Aim Assist Angle: ${math.round(targetResult.angle)}°\nAim Assist Depth: ${math.round(targetResult.distance)}`;
        }

        const pixelDiameter = angleToCircleSize(fov);
        this.circle.Size = UDim2.fromOffset(pixelDiameter, pixelDiameter);

        this.updateTargetDots(allTargetPoints, targetResult);
    }

    destroy() {
        this.screenGui?.Destroy();
        this.screenGui = undefined;

        this.dotsFolder?.Destroy();
        this.dotsFolder = undefined;
    }
}

export default AimAssistDebugVisualizer;
