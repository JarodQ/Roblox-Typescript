export type AimAssistMethod = "friction" | "tracking" | "centering";
export type AimAssistType = "rotational" | "translational";
export type AimAssistSortingBehavior = "distance" | "angle";
export type AimAssistEasingAttribute =
    | "distance"
    | "angle"
    | "normalizedDistance"
    | "normalizedAngle";

const AimAssistEnum = {
    AimAssistMethod: {
        Friction: "friction" as AimAssistMethod,
        Tracking: "tracking" as AimAssistMethod,
        Centering: "centering" as AimAssistMethod,
    },

    AimAssistType: {
        Rotational: "rotational" as AimAssistType,
        Translational: "translational" as AimAssistType,
    },

    AimAssistSortingBehavior: {
        Distance: "distance" as AimAssistSortingBehavior,
        Angle: "angle" as AimAssistSortingBehavior,
    },

    AimAssistEasingAttribute: {
        Distance: "distance" as AimAssistEasingAttribute,
        Angle: "angle" as AimAssistEasingAttribute,
        NormalizedDistance: "normalizedDistance" as AimAssistEasingAttribute,
        NormalizedAngle: "normalizedAngle" as AimAssistEasingAttribute,
    },
};

export default AimAssistEnum;
