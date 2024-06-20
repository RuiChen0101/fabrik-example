class XYZValue {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public norm(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
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

const xyzDistance = (a: XYZValue, b: XYZValue): number => {
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

// calculate the angle between two 3 dimensional vectors
const zyxAngle = (a: XYZValue, b: XYZValue): number => {
    if (a.x === b.x && a.y === b.y && a.z === b.z) {
        return 0;
    }
    let theta = ((a.x * b.x) + (a.y * b.y) + (a.z * b.z)) / (a.norm() * b.norm());
    const degree = (Math.acos(theta) * 180) / Math.PI;
    const angle = (a.x * b.y - a.y * b.x) >= 0 ? degree : -degree;
    return (angle + 360) % 360;
}

// calculate the angle between two 3 dimensional vectors for each component
const zyxAngleComponent = (a: XYZValue, b: XYZValue): XYZValue => {
    const angleXY = zyxAngle(new XYZValue(a.x, a.y, 0), new XYZValue(b.x, b.y, 0));
    const angleYZ = zyxAngle(new XYZValue(0, a.y, a.z), new XYZValue(0, b.y, b.z));
    const angleZX = zyxAngle(new XYZValue(a.x, 0, a.z), new XYZValue(b.x, 0, b.z));
    return new XYZValue(angleXY, angleYZ, angleZX);
}

export default XYZValue;
export {
    mulXYZ,
    addXYZ,
    subXYZ,
    xyzDistance,
    zyxAngle,
    zyxAngleComponent
}