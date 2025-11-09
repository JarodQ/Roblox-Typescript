// ProfileStore.ts

import { Signal } from "./Signal";
import { DeepCopyTable, ReconcileTable } from "./Utils";
import { VersionQuery } from "./VersionQuery";
import { Profile } from "./Profile";
import {
    AUTO_SAVE_PERIOD,
    LOAD_REPEAT_PERIOD,
    FIRST_LOAD_REPEAT,
    SESSION_STEAL,
    ASSUME_DEAD,
    START_SESSION_TIMEOUT,
    CRITICAL_STATE_ERROR_COUNT,
    CRITICAL_STATE_ERROR_EXPIRE,
    CRITICAL_STATE_EXPIRE,
    MAX_MESSAGE_QUEUE,
} from "./Constants";

import { DataStoreService, MessagingService, HttpService, RunService } from "@rbxts/services";

export type ProfileData = {
    Data: Record<string, unknown>;
    MetaData: Record<string, unknown>;
    GlobalUpdates: unknown[];
};

export class ProfileStore {
    public static IsClosing = false;
    public static IsCriticalState = false;

    public static OnError = Signal.New<(message: string, storeName: string, profileKey: string) => void>();
    public static OnOverwrite = Signal.New<(storeName: string, profileKey: string) => void>();
    public static OnCriticalToggle = Signal.New<(isCritical: boolean) => void>();

    public static DataStoreState: "NotReady" | "NoInternet" | "NoAccess" | "Access" = "NotReady";

    public static Mock: ProfileStore;

    public readonly Name: string;
    private template?: object;

    constructor(storeName: string, template?: object) {
        this.Name = storeName;
        this.template = template;
    }

    public static New(storeName: string, template?: object): ProfileStore {
        return new ProfileStore(storeName, template);
    }

    public static SetConstant(name: string, value: number) {
        switch (name) {
            case "AUTO_SAVE_PERIOD":
                // You can implement dynamic constant overrides here if needed
                break;
            default:
                warn(`Unknown constant: ${name}`);
        }
    }

    public async StartSessionAsync(
        profileKey: string,
        params?: { Steal?: boolean; Cancel?: () => boolean }
    ): Promise<Profile | undefined> {
        const profile = new Profile(this, profileKey, {
            Data: this.template
                ? DeepCopyTable(this.template as Record<string, unknown>)
                : {} as Record<string, unknown>,
            MetaData: {},
            GlobalUpdates: [],
        });

        return profile;
    }


    // Placeholder for messaging
    public async MessageAsync(profileKey: string, message: object): Promise<boolean> {
        return true;
    }

    // Placeholder for read-only access
    public async GetAsync(profileKey: string, version?: string): Promise<Profile | undefined> {
        const profile = new Profile(this, profileKey, {
            Data: this.template
                ? DeepCopyTable(this.template as Record<string, unknown>)
                : {} as Record<string, unknown>,
            MetaData: {},
            GlobalUpdates: [],
        });
        return profile;
    }


    // Placeholder for version query
    public VersionQuery(
        profileKey: string,
        sortDirection?: Enum.SortDirection,
        minDate?: DateTime,
        maxDate?: DateTime
    ): VersionQuery {
        return new VersionQuery(this, profileKey, sortDirection, minDate, maxDate);
    }


    // Placeholder for removal
    public async RemoveAsync(profileKey: string): Promise<boolean> {
        return true;
    }
}
