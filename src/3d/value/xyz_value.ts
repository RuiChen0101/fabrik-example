class XYZValue {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public length(): number {
        return Math.hypot(this.x, this.y, this.z);
    }

    public normalize(): XYZValue {
        const len = this.length();
        if (len > 0) {
            return new XYZValue(this.x / len, this.y / len, this.z / len);
        }
        return this.copy();
    }

    public copy(): XYZValue {
        return new XYZValue(this.x, this.y, this.z);
    }
}

const mulXYZ = (a: XYZValue, b: XYZValue | number): XYZValue => {
    if (b instanceof XYZValue) {
        return new XYZValue(a.x * b.x, a.y * b.y, a.z * b.z);
    } else {
        return new XYZValue(a.x * b, a.y * b, a.z * b);
    }
}

const addXYZ = (a: XYZValue, b: XYZValue | number): XYZValue => {
    if (b instanceof XYZValue) {
        return new XYZValue(a.x + b.x, a.y + b.y, a.z + b.z);
    } else {
        return new XYZValue(a.x + b, a.y + b, a.z + b);
    }
}

const subXYZ = (a: XYZValue, b: XYZValue | number): XYZValue => {
    if (b instanceof XYZValue) {
        return new XYZValue(a.x - b.x, a.y - b.y, a.z - b.z);
    } else {
        return new XYZValue(a.x - b, a.y - b, a.z - b);
    }
}

const dotXYZ = (a: XYZValue, b: XYZValue): number => {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

const crossXYZ = (a: XYZValue, b: XYZValue): XYZValue => {
    return new XYZValue(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}

const xyzDistance = (a: XYZValue, b: XYZValue): number => {
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

const moveXYZAlone = (p1: XYZValue, p2: XYZValue, l: number): XYZValue => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const d = Math.hypot(dx, dy, dz);
    return new XYZValue(p1.x + (dx / d) * l, p1.y + (dy / d) * l, p1.z + (dz / d) * l);
}

// calculate the angle between two 3 dimensional vectors
const xyzAngle = (a: XYZValue, b: XYZValue): number => {
    if (a.x === b.x && a.y === b.y && a.z === b.z) {
        return 0;
    }
    const aLength = a.length();
    const bLength = b.length();
    if (aLength === 0 || bLength === 0) {
        return 0;
    }
    let theta = ((a.x * b.x) + (a.y * b.y) + (a.z * b.z)) / (a.length() * b.length());
    theta = Math.min(Math.max(theta, -1), 1);
    const degree = (Math.acos(theta) * 180) / Math.PI;
    const angle = (a.x * b.y - a.y * b.x + a.z * b.z) <= 0 ? degree : -degree;
    return (angle + 360) % 360;
}

// calculate the angle between two 3 dimensional vectors for each component
const xyzAngleComponent = (a: XYZValue, b: XYZValue): XYZValue => {
    const angleXY = xyzAngle(new XYZValue(a.x, a.y, 0), new XYZValue(b.x, b.y, 0));
    const angleYZ = xyzAngle(new XYZValue(0, a.y, a.z), new XYZValue(0, b.y, b.z));
    const angleZX = xyzAngle(new XYZValue(a.x, 0, a.z), new XYZValue(b.x, 0, b.z));
    return new XYZValue(angleYZ, angleZX, angleXY);
}

export default XYZValue;
export {
    mulXYZ,
    addXYZ,
    subXYZ,
    dotXYZ,
    crossXYZ,
    xyzDistance,
    moveXYZAlone,
    xyzAngle,
    xyzAngleComponent
}