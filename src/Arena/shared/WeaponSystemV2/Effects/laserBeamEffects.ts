import { ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import Constants from "../Weapon/Constants";

const laserBeamTemplate = ReplicatedStorage.WaitForChild("Blaster")
    .WaitForChild("Objects")
    .WaitForChild("LaserBeam") as BasePart;

export default function laserBeamEffect(startPosition: Vector3, endPosition: Vector3): void {
    const distance = startPosition.sub(endPosition).Magnitude;
    const tweenTime = distance / Constants.LASER_BEAM_VISUAL_SPEED;
    const tweenInfo = new TweenInfo(tweenTime, Enum.EasingStyle.Linear, Enum.EasingDirection.Out);

    const laser = laserBeamTemplate.Clone();
    laser.CFrame = CFrame.lookAt(startPosition, endPosition);

    const startAttachment = laser.FindFirstChild("StartAttachment") as Attachment;
    const endAttachment = laser.FindFirstChild("EndAttachment") as Attachment;

    if (!startAttachment || !endAttachment) {
        warn("Laser beam missing attachments");
        return;
    }

    startAttachment.Position = Vector3.zero;
    endAttachment.Position = new Vector3(0, 0, -distance);
    laser.Parent = Workspace;

    const tween = TweenService.Create(startAttachment, tweenInfo, {
        Position: endAttachment.Position,
    });
    tween.Play();
    tween.Completed.Once(() => {
        laser.Destroy();
    });
}
