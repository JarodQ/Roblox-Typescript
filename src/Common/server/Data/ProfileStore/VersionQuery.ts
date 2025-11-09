import { Profile } from "./Profile";
import { ProfileStore } from "./ProfileStore";
import { DeepCopyTable } from "./Utils";

export class VersionQuery {
    private index = 0;

    private versions: { version: string; data: Record<string, unknown> }[] = [];

    constructor(
        private readonly store: ProfileStore,
        private readonly profileKey: string,
        private readonly sortDirection?: Enum.SortDirection,
        private readonly minDate?: DateTime,
        private readonly maxDate?: DateTime
    ) { }

    public async NextAsync(): Promise<Profile | undefined> {
        if (this.index >= this.versions.size()) {
            return undefined;
        }

        const snapshot = this.versions[this.index];
        this.index++;

        return new Profile(this.store, this.profileKey, {
            Data: DeepCopyTable(snapshot.data),
            MetaData: {},
            GlobalUpdates: [],
        });
    }
}


