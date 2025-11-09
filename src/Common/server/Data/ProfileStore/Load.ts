// Load.ts

import { DeepCopyTable } from "./Utils";
import { MockStore, UserMockStore, MockUpdateAsync } from "./MockStore";
import { SessionToken } from "./Session";
import { WaitInUpdateQueue } from "./UpdateQueue";
import { ProfileStore } from "./ProfileStore";

export async function UpdateAsync(
    profileStore: ProfileStore,
    profileKey: string,
    transformParams: {
        ExistingProfileHandle?: (latestData: unknown) => void;
        MissingProfileHandle?: (latestData: unknown) => void;
        EditProfile?: (latestData: unknown) => void;
    },
    isUserMock: boolean,
    isGetCall?: boolean,
    version?: string,
): Promise<[unknown, unknown]> {

    const sessionToken = SessionToken(profileStore.Name, profileKey, isUserMock);
    const nextInQueue = WaitInUpdateQueue(sessionToken);

    let loadedData: unknown;
    let keyInfo: unknown;

    const transformFunction = (latestDataRaw: unknown): LuaTuple<[unknown, number[], Record<string, unknown>]> => {
        let latestData: {
            Data?: unknown;
            MetaData?: unknown;
            GlobalUpdates?: [number, unknown[]];
            UserIds?: unknown;
            RobloxMetaData?: unknown;
            WasOverwritten?: boolean;
        } = {};

        let missingProfile = false;
        let overwritten = false;
        let globalUpdates: [number, unknown[]] = [0, []];

        if (latestDataRaw === undefined) {
            missingProfile = true;
        } else if (typeOf(latestDataRaw) !== "table") {
            missingProfile = true;
            overwritten = true;
        } else {
            latestData = latestDataRaw as typeof latestData;

            if (
                typeOf(latestData.Data) === "table" &&
                typeOf(latestData.MetaData) === "table" &&
                typeOf(latestData.GlobalUpdates) === "table"
            ) {
                latestData.WasOverwritten = false;
                globalUpdates = latestData.GlobalUpdates!;
                transformParams.ExistingProfileHandle?.(latestData);
            } else if (
                latestData.Data === undefined &&
                latestData.MetaData === undefined &&
                typeOf(latestData.GlobalUpdates) === "table"
            ) {
                latestData.WasOverwritten = false;
                globalUpdates = latestData.GlobalUpdates!;
                missingProfile = true;
            } else {
                missingProfile = true;
                overwritten = true;
            }
        }

        if (missingProfile) {
            latestData = {
                GlobalUpdates: globalUpdates,
            };
            transformParams.MissingProfileHandle?.(latestData);
        }

        transformParams.EditProfile?.(latestData);

        if (overwritten) {
            latestData.WasOverwritten = true;
        }

        const userIds = (latestData.UserIds ?? []) as number[];
        const robloxMetaData = (latestData.RobloxMetaData ?? {}) as Record<string, unknown>;

        return $tuple(latestData, userIds, robloxMetaData);
    };



    if (isUserMock) {
        [loadedData, keyInfo] = MockUpdateAsync(UserMockStore, profileStore.Name, profileKey, transformFunction, isGetCall);
        await Promise.delay(0.03); // Simulate yield
    } else if (ProfileStore.DataStoreState !== "Access") {
        [loadedData, keyInfo] = MockUpdateAsync(MockStore, profileStore.Name, profileKey, transformFunction, isGetCall);
        await Promise.delay(0.03);
    } else {
        // Real DataStore logic would go here
        [loadedData, keyInfo] = MockUpdateAsync(MockStore, profileStore.Name, profileKey, transformFunction, isGetCall);
        await Promise.delay(0.03);
    }

    nextInQueue();

    if (loadedData !== undefined && typeOf(loadedData) === "table") {
        const data = loadedData as { WasOverwritten?: boolean };

        if (data.WasOverwritten && !isGetCall) {
            ProfileStore.OnOverwrite.Fire(profileStore.Name, profileKey);
        }

        return $tuple(loadedData, keyInfo);
    } else {
        ProfileStore.OnError.Fire("Undefined error", profileStore.Name, profileKey);
        return $tuple(undefined, undefined);
    }

}
