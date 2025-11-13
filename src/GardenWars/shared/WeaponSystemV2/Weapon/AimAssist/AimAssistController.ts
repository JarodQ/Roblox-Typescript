import { RunService, UserInputService } from "@rbxts/services";
import Constants from "../Constants";
import AimAssistEnum, { AimAssistEasingAttribute, AimAssistType, AimAssistSortingBehavior, AimAssistMethod } from "./AimAssistEnum";
import TargetSelector, { SelectTargetResult } from "./TargetSelector";
import AimAdjuster, { AimContext } from "./AimAdjuster";
import AimAssistDebugVisualizer from "./DebugVisualizer";

export type EasingFunction = (value: number) => number;

class AimAssist {
    private enabled = false;
    private subject?: Camera;
    private debug = true;
    private thumbstickStates: Map<Enum.KeyCode, number> = new Map();
    private lastActiveTouch?: number;
    private startingSubjectCFrame?: CFrame;
    private easingFuncs: Map<AimAssistEasingAttribute, EasingFunction> = new Map();

    private targetSelector = new TargetSelector();
    private aimAdjuster = new AimAdjuster();
    private debugVisualizer = new AimAssistDebugVisualizer();

    enable() {
        this.enabled = true;

        RunService.BindToRenderStep(Constants.AIM_ASSIST_BIND_NAME_START, Enum.RenderPriority.Camera.Value - 1, () => {
            this.startAimAssist();
        });

        RunService.BindToRenderStep(Constants.AIM_ASSIST_BIND_NAME_APPLY, Enum.RenderPriority.Camera.Value + 1, (deltaTime) => {
            this.applyAimAssist(deltaTime);
        });
    }

    disable() {
        this.enabled = false;
        RunService.UnbindFromRenderStep(Constants.AIM_ASSIST_BIND_NAME_START);
        RunService.UnbindFromRenderStep(Constants.AIM_ASSIST_BIND_NAME_APPLY);
    }

    private getGamepadEligibility(): boolean {
        if (UserInputService.PreferredInput !== Enum.PreferredInput.Gamepad) return false;

        for (const [, magnitude] of this.thumbstickStates) {
            if (magnitude > Constants.AIM_ASSIST_DEADZONE) return true;
        }
        return false;
    }

    updateGamepadEligibility(keyCode: Enum.KeyCode, position: Vector3) {
        this.thumbstickStates.set(keyCode, new Vector2(position.X, position.Y).Magnitude);
    }

    private getTouchEligibility(): boolean {
        if (UserInputService.PreferredInput !== Enum.PreferredInput.Touch || this.lastActiveTouch === undefined) return false;
        return os.clock() - this.lastActiveTouch < Constants.AIM_ASSIST_INACTIVITY;
    }

    updateTouchEligibility() {
        this.lastActiveTouch = os.clock();
    }

    setDebug(debugVisuals: boolean) {
        if (this.debug === debugVisuals) return;
        this.debug = debugVisuals;

        if (this.debug) {
            this.debugVisualizer.createVisualElements();
        } else {
            this.debugVisualizer.destroy();
        }
    }

    setSubject(subject: Camera) {
        this.subject = subject;
        this.startAimAssist();
    }

    setType(assistType: AimAssistType) {
        this.aimAdjuster.setType(assistType);
    }

    setRange(range: number) {
        this.targetSelector.setRange(range);
    }

    setFieldOfView(fov: number) {
        this.targetSelector.setFieldOfView(fov);
    }

    setSortingBehavior(behavior: AimAssistSortingBehavior) {
        this.targetSelector.setSortingBehavior(behavior);
    }

    setIgnoreLineOfSight(ignore: boolean) {
        this.targetSelector.setIgnoreLineOfSight(ignore);
    }

    addTargetTag(tag: string, bones?: string[]) {
        this.targetSelector.addTargetTag(tag, bones);
    }

    removeTargetTag(tag: string) {
        this.targetSelector.removeTargetTag(tag);
    }

    addPlayerTargets(ignoreLocalPlayer?: boolean, ignoreTeammates?: boolean, bones?: string[]) {
        this.targetSelector.addPlayerTargets(ignoreLocalPlayer, ignoreTeammates, bones);
    }

    removePlayerTargets() {
        this.targetSelector.removePlayerTargets();
    }

    setMethodStrength(method: AimAssistMethod, strength: number) {
        this.aimAdjuster.setMethodStrength(method, strength);
    }

    setEasingFunc(attribute: AimAssistEasingAttribute, func: EasingFunction) {
        this.easingFuncs.set(attribute, func);
    }

    private startAimAssist() {
        if (!this.subject) return;
        this.startingSubjectCFrame = this.subject.CFrame;
    }

    private applyAimAssist(deltaTime?: number) {
        if (!this.subject) return;

        const currCFrame = this.subject.CFrame;
        let targetResult: SelectTargetResult | undefined;

        if (this.getGamepadEligibility() || this.getTouchEligibility()) {
            targetResult = this.targetSelector.selectTarget(this.subject);
            print("Gamepad detected")
        }

        if (this.debug) {
            const allTargetPoints = this.targetSelector.getAllTargetPoints();
            this.debugVisualizer.update(targetResult, this.targetSelector.fieldOfView, allTargetPoints);
        }

        let adjustmentStrength = 1;
        if (targetResult) {
            for (const [attribute, ease] of this.easingFuncs) {
                const value = targetResult[attribute];
                if (value !== undefined) {
                    adjustmentStrength *= ease(value);
                }
            }
        }

        const aimContext: AimContext = {
            subjectCFrame: currCFrame,
            startingCFrame: this.startingSubjectCFrame,
            adjustmentStrength,
            targetResult,
            deltaTime,
        };

        const newCFrame = this.aimAdjuster.adjustAim(aimContext);
        this.startingSubjectCFrame = newCFrame;
        // this.subject!.CameraType = Enum.CameraType.Scriptable;
        // this.subject.CFrame = newCFrame;
        // this.subject!.CameraType = Enum.CameraType.Cust  `om;

    }

    destroy() {
        this.debugVisualizer.destroy();
    }
}

export default AimAssist;
