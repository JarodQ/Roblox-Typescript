export type AllotmentState = 'empty' | 'growing' | 'grown';

export interface AllotmentData {
    ownerUserId: number;
    state: AllotmentState;
    plantName?: string;
}

export function getOptionsForAllotment(allotment: AllotmentData, localUserId: number): string[] {
    const isOwner = allotment.ownerUserId === localUserId;
    const { state } = allotment;

    if (isOwner) {
        switch (state) {
            case 'empty':
                return ['Plant'];
            case 'growing':
                return ['Grow Instantly', 'Discard'];
            case 'grown':
                return ['Harvest'];
        }
    } else {
        switch (state) {
            case 'growing':
                return ['Grow Instantly'];
            case 'grown':
                return ['Steal'];
        }
    }
    return [];
}

export function transitionState(
    allotment: AllotmentData,
    action: string,
    localUserId: number
): AllotmentData {
    const isOwner = allotment.ownerUserId === localUserId;

    switch (action) {
        case 'Plant':
            if (isOwner && allotment.state === 'empty') {
                return { ...allotment, state: 'growing', plantName: 'HeldItem' };
            }
            break;
        case 'Grow Instantly':
            if (allotment.state === 'growing') {
                return { ...allotment, state: 'grown' };
            }
            break;
        case 'Discard':
            if (isOwner && allotment.state === 'growing') {
                return { ...allotment, state: 'empty', plantName: undefined };
            }
            break;
        case 'Harvest':
        case 'Sell':
            if (isOwner && allotment.state === 'grown') {
                return { ...allotment, state: 'empty', plantName: undefined };
            }
            break;
        case 'Steal':
            if (!isOwner && allotment.state === 'grown') {
                return { ...allotment, state: 'empty', plantName: undefined };
            }
            break;
    }
    return allotment;
}
