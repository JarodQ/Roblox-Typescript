// Save.ts

import { Profile } from "./Profile";
import { SessionToken, IsThisSession } from "./Session";
import { WaitInUpdateQueue } from "./UpdateQueue";
import { DeepCopyTable } from "./Utils";
import { Signal } from "./Signal";

export async function SaveProfileAsync(
    profile: Profile,
    isEndingSession: boolean,
    isOverwriting: boolean,
    lastSaveReason: "Manual" | "Shutdown" | "External" = "Manual",
) {
    if (typeOf(profile.Data) !== "table") {
        throw `SaveProfileAsync: Profile.Data must be a table`;
    }

    profile.OnSave.Fire();
    if (isEndingSession) {
        profile.OnLastSave.Fire(lastSaveReason);
    }

    if (isEndingSession && !isOverwriting) {
        profile.OnSessionEnd.Fire();
    }

    const nextInQueue = WaitInUpdateQueue(SessionToken(profile.ProfileStore.Name, profile.Key, false));

    // Simulate save logic
    const sessionOwnsProfile = true;
    const isActive = profile.IsActive();

    if (sessionOwnsProfile) {
        profile.LastSavedData = DeepCopyTable(profile.Data);
        profile.OnAfterSave.Fire(profile.LastSavedData);
    }

    nextInQueue();
}
