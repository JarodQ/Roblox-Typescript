// Session.ts
import { ProfileStore } from "./ProfileStore";

export function SessionToken(storeName: string, profileKey: string, isMock: boolean): string {
    let sessionPrefix = "L_"; // Live
    if (isMock) {
        sessionPrefix = "U_"; // User mock
    } else if (ProfileStore.DataStoreState !== "Access") {
        sessionPrefix = "M_"; // Mock due to no access
    }
    return `${sessionPrefix}${storeName}\0${profileKey}`;
}

export function IsThisSession(sessionTag: [number, string]): boolean {
    return sessionTag[0] === game.PlaceId && sessionTag[1] === game.JobId;
}
