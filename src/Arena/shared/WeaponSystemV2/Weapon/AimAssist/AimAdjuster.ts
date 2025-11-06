import { TweenService } from "@rbxts/services";
import AimAssistEnum, { AimAssistMethod, AimAssistType } from "./AimAssistEnum";
import TargetSelector, { SelectTargetResult } from "./TargetSelector";

export interface AimContext {
    startingCFrame?: CFrame;
    subjectCFrame: CFrame;
    adjustmentStrength: number;
    targetResult?: SelectTargetResult;
    deltaTime?: number;
}

class AimAdjuster {
    private assistType = AimAssistEnum.AimAssistType.Rotational;
    private lastTargetInstance?: PVInstance;
    private lastTargetPositions: Vector3[] = [];
    private subjectVelocity: Vector3 = Vector3.zero;

    private strengthTable = new Map<AimAssistMethod, number>([
        [AimAssistEnum.AimAssistMethod.Friction, 0],
        [AimAssistEnum.AimAssistMethod.Tracking, 0],
        [AimAssistEnum.AimAssistMethod.Centering, 0],
    ]);

    setType(assistType: AimAssistType) {
        this.assistType = assistType;
    }

    setMethodStrength(method: AimAssistMethod, strength: number) {
        this.strengthTable.set(method, math.clamp(strength, 0, 1));
    }

    private adjustAimFriction(context: AimContext): CFrame {
        const strength = math.clamp(
            (this.strengthTable.get(AimAssistEnum.AimAssistMethod.Friction) ?? 0) * context.adjustmentStrength,
            0,
            1,
        );
        if (!context.targetResult || strength <= 0) return context.subjectCFrame;

        if (!context.startingCFrame) return context.subjectCFrame;

        const baseCFrame =
            this.assistType === AimAssistEnum.AimAssistType.Rotational
                ? context.startingCFrame.Rotation.add(context.subjectCFrame.Position)
                : context.subjectCFrame.Rotation.add(context.startingCFrame.Position);

        return context.subjectCFrame.Lerp(baseCFrame, strength);
    }

    private adjustAimTracking(context: AimContext): CFrame {
        const strength = math.clamp(
            (this.strengthTable.get(AimAssistEnum.AimAssistMethod.Tracking) ?? 0) * context.adjustmentStrength,
            0,
            1,
        );
        if (!context.targetResult || strength <= 0) return context.subjectCFrame;

        const { positions, weights } = context.targetResult;
        let newCFrame = context.subjectCFrame;

        for (let i = 0; i < positions.size(); i++) {
            const targetPosition = positions[i];
            const weight = weights[i];
            const lastTargetPosition = this.lastTargetPositions[i];

            if (weight <= 0 || !lastTargetPosition) continue;

            if (this.assistType === AimAssistEnum.AimAssistType.Rotational) {
                const baseCFrame = context.startingCFrame!.Rotation.add(context.subjectCFrame.Position);
                const oldDir = context.startingCFrame!.PointToObjectSpace(lastTargetPosition).Unit;
                const newDir = baseCFrame.PointToObjectSpace(targetPosition).Unit;
                // const idealRotation = CFrame.fromRotationBetweenVectors(oldDir, newDir); ------------------------------------------Potential Issue-----------------------------------------------------------
                const idealRotation = CFrame.lookAt(Vector3.zero, newDir).ToObjectSpace(CFrame.lookAt(Vector3.zero, oldDir));
                const rotation = CFrame.identity.Lerp(idealRotation, strength * weight);
                newCFrame = newCFrame.mul(rotation);
            } else {
                const baseCFrame = context.subjectCFrame.Rotation.add(context.startingCFrame!.Position);
                const oldPos = lastTargetPosition.sub(context.startingCFrame!.Position);
                const newPos = targetPosition.sub(baseCFrame.Position);
                const idealTranslation = newPos.sub(oldPos);
                const translation = Vector3.zero.Lerp(idealTranslation, strength * weight);
                newCFrame = newCFrame.add(translation);
            }
        }

        this.lastTargetPositions = positions;
        return newCFrame;
    }

    private adjustAimCentering(context: AimContext): CFrame {
        const strength = math.clamp(
            (this.strengthTable.get(AimAssistEnum.AimAssistMethod.Centering) ?? 0) * context.adjustmentStrength,
            0,
            1,
        );
        if (!context.targetResult || strength <= 0) return context.subjectCFrame;

        const targetPosition = context.targetResult.bestPosition;
        let idealCFrame =
            this.assistType === AimAssistEnum.AimAssistType.Rotational
                ? CFrame.lookAt(context.subjectCFrame.Position, targetPosition)
                : context.subjectCFrame.Rotation.add(targetPosition);

        if (!context.deltaTime) {
            return context.subjectCFrame.Lerp(idealCFrame, strength);
        }

        const smoothTime = 1 - strength;
        const maxSpeed = math.huge;

        const [newCFrame, newVelocity] = TweenService.SmoothDamp(
            context.subjectCFrame,
            idealCFrame,
            this.subjectVelocity,
            smoothTime,
            maxSpeed,
            context.deltaTime,
        ) as LuaTuple<[CFrame, Vector3]>;


        this.subjectVelocity = newVelocity;
        return newCFrame;
    }

    adjustAim(context: AimContext): CFrame {
        const targetInstance = context.targetResult?.instance;
        if (targetInstance !== this.lastTargetInstance) {
            this.lastTargetInstance = targetInstance;
            this.lastTargetPositions = context.targetResult?.positions ?? [];
            this.subjectVelocity = Vector3.zero;
        }

        context.subjectCFrame = this.adjustAimFriction(context);
        context.subjectCFrame = this.adjustAimTracking(context);
        context.subjectCFrame = this.adjustAimCentering(context);

        return context.subjectCFrame;
    }
}

export default AimAdjuster;
