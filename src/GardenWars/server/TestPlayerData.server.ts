throw "This module is disabled temporarily";

import { loadPlayerData, savePlayerData } from "GardenWars/shared/GardenWars/DataStoreWrapper"; // Or wherever your functions live
import { getPlayerKey } from "GardenWars/shared/GardenWars/DataStoreWrapper";
import { PlayerData, DEFAULT_PLAYER_DATA } from "GardenWars/shared/GardenWars/types/PlayerData";

// Resetting the mock store before test

const testUserId = 123456;

async function runTest() {
    print("🔁 Starting test...");

    // First Load (should get default)
    const data1 = await loadPlayerData(testUserId);
    print("✅ Initial load:", data1);
    //assert(data1.carrots === DEFAULT_PLAYER_DATA.carrots, "Expected default carrots");

    // Save new value
    print("Attempting to save new value!!!!!");
    data1.carrots = 42;
    print(`Data 1: ${data1}`);
    await savePlayerData(testUserId, data1);
    print("💾 Saved updated carrots:", data1.carrots);

    // Load again to confirm persistence
    const data2 = await loadPlayerData(testUserId);
    print("🔄 Reloaded data:", data2);
    assert(data2.carrots === 42, "Expected carrots to persist after save");

    print("🎉 All assertions passed!");
}

runTest();