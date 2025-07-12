import { ReplicatedStorage } from "@rbxts/services";
import { drawRayResults } from "Arena/shared/Weapon/Utility/drawRayResults";
import { castRays, RayResult } from "Arena/shared/Weapon/Utility/castRays";
import { playRandomSoundFromSource } from "Arena/shared/Weapon/Utility/playRandomSoundFromSource";

const remotes = ReplicatedStorage.WaitForChild("Blaster").WaitForChild("Remotes") as Folder;
const replicateShotRemote = remotes.WaitForChild("ReplicateShot") as RemoteEvent;

/**
 * Handles replicated shot effects from the server.
 * Plays VFX, SFX, and draws ray results from the given blaster.
 */
function onReplicateShotEvent(blaster: Tool, position: Vector3, rayResults: RayResult[]): void {
    if (blaster && blaster.IsDescendantOf(game)) {
        const handle = blaster.FindFirstChild("Handle") as BasePart | undefined;
        const sounds = blaster.FindFirstChild("Sounds") as Folder | undefined;
        const emitter = handle?.FindFirstChild("AudioEmitter") as Instance | undefined;
        const muzzle = blaster.FindFirstChildWhichIsA("Attachment", true) as Attachment | undefined;

        if (muzzle && muzzle.Name === "MuzzleAttachment") {
            position = muzzle.WorldPosition;

            const flash = muzzle.FindFirstChild("FlashEmitter") as ParticleEmitter | undefined;
            if (flash) {
                flash.Emit(1);
            }
        } else {
            position = blaster.GetPivot().Position;
        }

        if (sounds && emitter) {
            const shootFolder = sounds.FindFirstChild("Shoot") as Folder | undefined;
            if (shootFolder) {
                playRandomSoundFromSource(shootFolder, emitter);
            }
        }
    }

    drawRayResults(position, rayResults);
}

replicateShotRemote.OnClientEvent.Connect(onReplicateShotEvent);