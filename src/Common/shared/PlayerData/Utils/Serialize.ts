export function serializeVector3(v: Vector3): { x: number; y: number; z: number } {
    return { x: v.X, y: v.Y, z: v.Z };
}

export function serializeCFrame(cf: CFrame): number[] {
    return [
        cf.XVector.X, cf.XVector.Y, cf.XVector.Z,
        cf.YVector.X, cf.YVector.Y, cf.YVector.Z,
        cf.ZVector.X, cf.ZVector.Y, cf.ZVector.Z,
    ];
}

export function deserializeVector3(pos: { x: number; y: number; z: number }): Vector3 {
    return new Vector3(pos.x, pos.y, pos.z);
}

export function deserializeCFrame(pos: { x: number; y: number; z: number }, rot: number[]): CFrame {
    return CFrame.fromMatrix(
        new Vector3(pos.x, pos.y, pos.z),
        new Vector3(rot[0], rot[1], rot[2]),
        new Vector3(rot[3], rot[4], rot[5]),
        new Vector3(rot[6], rot[7], rot[8])
    );
}