import { RunService } from "@rbxts/services";
import { TweenService, Workspace } from "@rbxts/services";

const teleportFolder: Folder = Workspace.WaitForChild("Teleports") as Folder;
const teleportBall: Model = teleportFolder.WaitForChild("TeleportBall") as Model;
const ballCenter: BasePart = teleportBall.FindFirstChild("Center") as BasePart
const pivot = teleportBall.GetPivot();
const rotationAmount = math.rad(360); // 45 degrees
const duration = 2; // seconds

/* function tweenPartRotation(part: BasePart, angle: number, duration: number) {
    const startCFrame = part.CFrame;
    const rotation = CFrame.Angles(math.rad(angle), math.rad(angle), 0);
    const goalCFrame = startCFrame.mul(rotation);

    const tweenInfo = new TweenInfo(duration, Enum.EasingStyle.Linear, Enum.EasingDirection.In);
    const tweenOne = TweenService.Create(part, tweenInfo, {
        CFrame: goalCFrame,
    });


    tweenOne.Play();
}
let direction = 1;

function loopRotation() {
    tweenPartRotation(ballCenter, 180 * direction, 1);
    //direction *= -1;
    task.delay(1, loopRotation);
}

loopRotation(); */
// 🔧 Rotation speed in radians per second
const rotationSpeed = math.rad(90); // 90 degrees/sec

// 🔧 Perlin noise frequency (lower = smoother)
const noiseFrequency = 0.5;

// 🔧 Unique offsets for each axis
const xOffset = math.random() * 1000;
const yOffset = math.random() * 1000;
const zOffset = math.random() * 1000;

let time = 0;

RunService.Heartbeat.Connect((dt) => {
    time += dt;

    // Sample Perlin noise for each axis
    const xNoise = math.noise(time * noiseFrequency + xOffset);
    const yNoise = math.noise(time * noiseFrequency + yOffset);
    const zNoise = math.noise(time * noiseFrequency + zOffset);

    // Convert noise (-0.5 to 0.5) to a unit direction vector
    const direction = new Vector3(xNoise, yNoise, zNoise).Unit;

    // Scale by rotation speed and delta time
    const rotationStep = direction.mul(rotationSpeed * dt);

    // Apply rotation around the part's center
    const rotation = CFrame.Angles(rotationStep.X, rotationStep.Y, rotationStep.Z);
    ballCenter.CFrame = new CFrame(ballCenter.Position).mul(rotation).mul(ballCenter.CFrame.Rotation);
});

