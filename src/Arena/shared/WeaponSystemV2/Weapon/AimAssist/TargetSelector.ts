import { Workspace, CollectionService, Players } from "@rbxts/services";
import AimAssistEnum, { AimAssistSortingBehavior } from "./AimAssistEnum";

export interface SelectTargetResult {
    instance?: PVInstance;
    positions: Vector3[];
    weights: number[];
    bestPosition: Vector3;
    distance: number;
    normalizedDistance: number;
    angle: number;
    normalizedAngle: number;
}

export interface PointHitResult {
    hit: boolean;
    angle: number;
    distance: number;
}

export interface TargetEntry {
    instance: PVInstance;
    points: Vector3[];
}

const localPlayer = Players.LocalPlayer;

function onSameTeam(player1: Player, player2: Player): boolean {
    if (!player1.Team || !player2.Team) return false;
    if (player1.Team !== player2.Team) return false;
    if (player1.Neutral || player2.Neutral) return false;
    return true;
}

function getCenterPoint(instance: PVInstance): Vector3 {
    if (instance.IsA("Model")) {
        const [cf] = instance.GetBoundingBox();
        return cf.Position;
    } else if (instance.IsA("BasePart")) {
        return instance.ExtentsCFrame.Position;
    } else {
        warn(`Instance ${instance.Name} is not a Model or BasePart`);
        return instance.GetPivot().Position;
    }
}

class TargetSelector {
    public fieldOfView = 20;
    private range = 100;
    private sortingBehavior = AimAssistEnum.AimAssistSortingBehavior.Angle;
    private targetPlayers = true;
    private ignoreLineOfSight = false;
    private ignoreLocalPlayer = true;
    private ignoreTeammates = false;
    private playerBones: string[] = [];
    private tags: Record<string, boolean> = {};
    private tagBones: Record<string, string[]> = {};

    setRange(range: number) {
        this.range = range;
    }

    setFieldOfView(fov: number) {
        this.fieldOfView = fov;
    }

    setSortingBehavior(behavior: AimAssistSortingBehavior) {
        this.sortingBehavior = behavior;
    }

    setIgnoreLineOfSight(ignore: boolean) {
        this.ignoreLineOfSight = ignore;
    }

    addTargetTag(tag: string, bones?: string[]) {
        this.tags[tag] = true;
        if (bones) this.tagBones[tag] = bones;
    }

    removeTargetTag(tag: string) {
        delete this.tags[tag];
        delete this.tagBones[tag];
    }

    addPlayerTargets(ignoreLocalPlayer?: boolean, ignoreTeammates?: boolean, bones?: string[]) {
        this.targetPlayers = true;
        this.ignoreLocalPlayer = ignoreLocalPlayer ?? true;
        this.ignoreTeammates = ignoreTeammates ?? false;
        this.playerBones = bones ?? [];
    }

    removePlayerTargets() {
        this.targetPlayers = false;
    }

    private checkLineOfSight(subject: Camera, target: PVInstance, toTarget: Vector3): boolean {
        const raycastParams = new RaycastParams();
        raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
        raycastParams.FilterDescendantsInstances = [subject, target];
        if (localPlayer?.Character) raycastParams.AddToFilter([localPlayer.Character]);

        const result = Workspace.Raycast(subject.CFrame.Position, toTarget, raycastParams);
        return result === undefined;
    }

    private checkPointHit(subject: Camera, target: PVInstance, point: Vector3): PointHitResult {
        const subjectCFrame = subject.CFrame;
        const toTarget = point.sub(subjectCFrame.Position);
        const distance = toTarget.Magnitude;
        const angle = math.deg(math.acos(math.clamp(subjectCFrame.LookVector.Dot(toTarget.Unit), -1, 1)));

        let hit = distance <= this.range && angle <= this.fieldOfView / 2;
        if (hit && !this.ignoreLineOfSight) {
            hit = this.checkLineOfSight(subject, target, toTarget);
        }

        return { hit, angle, distance };
    }

    private getTargetPoints(instance: PVInstance, bones?: string[]): Vector3[] {
        if (!bones || bones.size() === 0) return [getCenterPoint(instance)];

        const points: Vector3[] = [];
        for (const bone of bones) {
            for (const descendant of instance.GetDescendants()) {
                if (descendant.IsA("PVInstance") && CollectionService.HasTag(descendant, bone)) {
                    points.push(getCenterPoint(descendant));
                }
            }
        }
        return points;
    }

    getAllTargetPoints(): TargetEntry[] {
        const entries: TargetEntry[] = [];

        for (const [tag] of pairs(this.tags)) {
            const instances = CollectionService.GetTagged(tag);
            const bones = this.tagBones[tag];

            for (const instance of instances) {
                if (!instance.IsA("PVInstance")) continue;
                const points = this.getTargetPoints(instance, bones);
                entries.push({ instance, points });
            }
        }


        if (this.targetPlayers && localPlayer) {
            for (const player of Players.GetPlayers()) {
                if (this.ignoreLocalPlayer && player === localPlayer) continue;
                if (this.ignoreTeammates && onSameTeam(player, localPlayer)) continue;
                if (!player.Character) continue;

                const points = this.getTargetPoints(player.Character, this.playerBones);
                entries.push({ instance: player.Character as PVInstance, points });
            }
        }

        return entries;
    }

    selectTarget(subject: Camera): SelectTargetResult | undefined {
        const result: SelectTargetResult = {
            instance: undefined,
            positions: [],
            weights: [],
            bestPosition: Vector3.zero,
            distance: 0,
            normalizedDistance: 0,
            angle: 0,
            normalizedAngle: 0,
        };

        let bestMetric = math.huge;
        const targets = this.getAllTargetPoints();

        for (const entry of targets) {
            for (const point of entry.points) {
                const hit = this.checkPointHit(subject, entry.instance, point);
                if (!hit.hit) continue;

                const metric =
                    this.sortingBehavior === AimAssistEnum.AimAssistSortingBehavior.Angle
                        ? hit.angle
                        : hit.distance;

                if (metric < bestMetric) {
                    bestMetric = metric;
                    result.instance = entry.instance;
                    result.bestPosition = point;
                    result.positions = entry.points;
                    result.distance = hit.distance;
                    result.angle = hit.angle;
                }
            }
        }

        if (!result.instance) return undefined;

        const weights: number[] = [];
        let totalWeight = 0;
        const EPSILON = 0.001;

        for (const point of result.positions) {
            const hit = this.checkPointHit(subject, result.instance, point);
            let weight = 0;

            if (hit.hit) {
                weight =
                    this.sortingBehavior === AimAssistEnum.AimAssistSortingBehavior.Angle
                        ? 1 / (hit.angle + EPSILON)
                        : 1 / (hit.distance + EPSILON);
            }

            totalWeight += weight;
            weights.push(weight);
        }

        if (totalWeight > 0) {
            for (let i = 0; i < weights.size(); i++) {
                weights[i] /= totalWeight;
            }
        }

        result.weights = weights;
        result.normalizedDistance = result.distance / this.range;
        result.normalizedAngle = result.angle / (this.fieldOfView * 0.5);

        return result;
    }
}

export default TargetSelector;
