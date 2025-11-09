// MockStore.ts

import { DeepCopyTable } from "./Utils";

export interface MockEntry {
    Data: unknown;
    CreatedTime: number;
    UpdatedTime: number;
    VersionId: number;
    UserIds: number[];
    MetaData: Record<string, unknown>;
}

export const MockStore: Record<string, Record<string, MockEntry>> = {};
export const UserMockStore: Record<string, Record<string, MockEntry>> = {};

export function NewMockDataStoreKeyInfo(params: Partial<MockEntry>) {
    const versionIdString = tostring(params.VersionId ?? 0);
    const metaData = params.MetaData ?? {};
    const userIds = params.UserIds ?? [];

    return {
        CreatedTime: params.CreatedTime,
        UpdatedTime: params.UpdatedTime,
        Version: string.rep("0", 16) + "." + string.rep("0", 10 - versionIdString.size()) + versionIdString + "." + string.rep("0", 16) + "." + "01",

        GetMetadata: () => DeepCopyTable(metaData),
        GetUserIds: () => DeepCopyTable(userIds),
    };
}

export function MockUpdateAsync(
    mockDataStore: typeof MockStore,
    profileStoreName: string,
    key: string,
    transformFunction: (latestData: unknown, keyInfo?: unknown) => LuaTuple<[unknown, number[], Record<string, unknown>]>,
    isGetCall?: boolean,
): LuaTuple<[unknown, unknown]> {
    let profileStore = mockDataStore[profileStoreName];
    if (!profileStore) {
        profileStore = {};
        mockDataStore[profileStoreName] = profileStore;
    }

    const epochTime = math.floor(os.time() * 1000);
    let mockEntry = profileStore[key];
    let mockEntryWasNil = false;

    if (!mockEntry) {
        mockEntryWasNil = true;
        if (!isGetCall) {
            mockEntry = {
                Data: undefined,
                CreatedTime: epochTime,
                UpdatedTime: epochTime,
                VersionId: 0,
                UserIds: [],
                MetaData: {},
            };
            profileStore[key] = mockEntry;
        }
    }

    const mockKeyInfo = !mockEntryWasNil ? NewMockDataStoreKeyInfo(mockEntry) : undefined;
    const [transform, userIds, robloxMetaData] = transformFunction(mockEntry?.Data, mockKeyInfo);

    if (transform === undefined) {
        return $tuple(undefined, undefined);
    }

    if (mockEntry && !isGetCall) {
        mockEntry.Data = DeepCopyTable((transform ?? {}) as object);
        mockEntry.UserIds = DeepCopyTable(userIds ?? []);
        mockEntry.MetaData = DeepCopyTable(robloxMetaData ?? {});
        mockEntry.VersionId++;
        mockEntry.UpdatedTime = epochTime;
    }

    return $tuple(DeepCopyTable((transform ?? {}) as object), mockEntry ? NewMockDataStoreKeyInfo(mockEntry) : undefined);

}
