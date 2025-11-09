// Profile.ts

import { ProfileStore } from "./ProfileStore";
import { Signal } from "./Signal";

export class Profile {
    public readonly ProfileStore: ProfileStore;
    public readonly Key: string;
    public Data: Record<string, unknown>;
    public MetaData: Record<string, unknown> = {};
    public GlobalUpdates: [number, unknown][] = [];
    public LastSavedData: Record<string, unknown> = {};
    public FirstSessionTime = os.time();
    public SessionLoadCount = 1;
    public Session: { PlaceId: number; JobId: string } | undefined;
    public RobloxMetaData: Record<string, unknown> = {};
    public UserIds: number[] = [];
    public KeyInfo: DataStoreKeyInfo | undefined;

    public OnSave = Signal.New<() => void>();
    public OnLastSave = Signal.New<(reason: "Manual" | "External" | "Shutdown") => void>();
    public OnSessionEnd = Signal.New<() => void>();
    public OnAfterSave = Signal.New<(lastSavedData: Record<string, unknown>) => void>();

    // ✅ Add these internal fields
    public locked_global_updates: Record<number, boolean> = {};
    public received_global_updates: Record<number, boolean> = {};
    public messageHandlers: ((data: unknown, processed: () => void) => void)[] = [];

    constructor(
        store: ProfileStore,
        key: string,
        data: {
            Data: Record<string, unknown>;
            MetaData: Record<string, unknown>;
            GlobalUpdates: [number, unknown][];
        }
    ) {
        this.ProfileStore = store;
        this.Key = key;
        this.Data = data.Data;
        this.MetaData = data.MetaData;
        this.GlobalUpdates = data.GlobalUpdates;
    }


    public IsActive(): boolean {
        return true;
    }

    public Reconcile() {
        // Implement reconciliation logic here
    }

    public EndSession() {
        // Implement session cleanup logic here
    }

    public AddUserId(userId: number) {
        if (!this.UserIds.includes(userId)) {
            this.UserIds.push(userId);
        }
    }

    public RemoveUserId(userId: number) {
        const index = this.UserIds.indexOf(userId);
        if (index !== -1) {
            this.UserIds.remove(index);
        }
    }
}
