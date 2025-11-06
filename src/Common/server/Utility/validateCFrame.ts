import validateVector3 from "./validateVector3";

export default function validateCFrame(cframe: unknown): boolean {
    // Ensure the input is a CFrame
    if (typeOf(cframe) !== "CFrame") {
        return false;
    }

    const cf = cframe as CFrame;

    if (!validateVector3(cf.Position)) {
        return false;
    }

    if (!validateVector3(cf.LookVector)) {
        return false;
    }

    return true;
}
