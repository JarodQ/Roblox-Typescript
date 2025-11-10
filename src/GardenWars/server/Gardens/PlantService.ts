import { ReplicatedStorage } from "@rbxts/services";
import { Plants } from "Common/shared/PlayerData/PlayerData";
import * as PREFABS from "../../shared/PREFABS";


// const playerCache = new Map<number, { plants: Plants[] }>(); // or your actual structure

// export function addPlant(player: Player, plant: Plants) {
//     const data = playerCache.get(player.UserId);
//     // print("CheckingData: ", player, data);
//     if (!data) return;
//     data.plants.push(plant);
//     // print(`Added plant for ${player.Name}:`, plant);
// }

// export function removePlant(player: Player, position: Vector3) {
//     const data = playerCache.get(player.UserId);
//     if (!data) return;

//     const index = data.plants.findIndex(p =>
//         math.abs(p.position.x - position.X) < 0.1 &&
//         math.abs(p.position.y - position.Y) < 0.1 &&
//         math.abs(p.position.z - position.Z) < 0.1
//     );

//     if (index !== -1) {
//         data.plants.remove(index);
//         print(`Removed plant for ${player.Name} at:`, position);
//     }
// }


