import { Bee, BeeType } from "./Bees";

// 🐝 How many bees to spawn
const BEE_COUNT = 30;

for (let i = 0; i < BEE_COUNT; i++) {
    const bee = new Bee(BeeType.WorkerBee);
    // No need to call roam or aggro manually — handled inside the class
}

