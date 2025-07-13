import { Workspace, UserInputService, RunService, ReplicatedStorage, Players } from "@rbxts/services";
import FireWeapon = require("Arena/shared/WeaponSystemOLD/Remotes/FireWeapon");
import ReloadWeapon = require("Arena/shared/WeaponSystemOLD/Remotes/ReloadWeapon");
import { CameraTilt } from "Arena/client/Camera/CameraTilt";
import { PitchRecoil } from "./Camera/PitchRecoil";
import { AdaptiveRecoil } from "./Camera/AdaptiveRecoil";

let currentAmmo = "Standard";
let weaponType: "hitscan" | "projectile" = "hitscan";

let isFiring = false;
const maxTilt = 2;
const fireRate = 0.2;

function startFiring(): void {
    isFiring = true;

    task.spawn(() => {
        while (isFiring) {
            const player = Players.LocalPlayer;
            const character = player.Character;
            if (!character) break;

            const head = character.FindFirstChild("Head") as BasePart;
            if (!head) break;

            const mouse = player.GetMouse();
            const direction = mouse.Hit.Position.sub(head.Position).Unit;

            // 🔫 Fire the weapon
            FireWeapon.FireServer(head.Position, direction, weaponType, currentAmmo);

            // 💥 Trigger camera tilt via lockCamera system
            // 💥 Apply random tilt and lerp over fireRate
            let angle: number;
            do {
                angle = math.random(-maxTilt, maxTilt);
            } while (math.abs(angle) < 1);

            const randomTilt = math.rad(angle);
            print(angle);
            //const randomTilt = math.rad(math.random(-maxTilt, maxTilt));
            CameraTilt.setTarget(randomTilt, fireRate);
            //PitchRecoil.apply(math.rad(1.5)); // tweak for more or less kick
            AdaptiveRecoil.apply(math.rad(.7)); // Don't make > 2.0 math.random() -- too impredictable maybe? or maybe use withing a small interval

            task.wait(fireRate); // Adjust fire rate
        }
    });
}

function stopFiring(): void {
    isFiring = false;
    CameraTilt.reset();
}

UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;

    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        startFiring();
    }

    if (input.KeyCode === Enum.KeyCode.Q) {
        ReloadWeapon.FireServer();
    }
});

UserInputService.InputEnded.Connect((input) => {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        stopFiring();
    }
});
