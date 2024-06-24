import XYZValue, { crossXYZ, dotXYZ } from './xyz_value';

class Quat {
    private _w: number;
    private _x: number;
    private _y: number;
    private _z: number;

    public get w(): number {
        return this._w;
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    public get z(): number {
        return this._z;
    }

    constructor(w: number, x: number, y: number, z: number) {
        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;
    }

    public copy(): Quat {
        return new Quat(this._w, this._x, this._y, this._z);
    }

    public normalize(): Quat {
        const len = Math.hypot(this._w, this._x, this._y, this._z);

        if (len === 1) {
            return this;
        }

        if (len > 0) {
            const invLen = 1 / len;
            return new Quat(this._w * invLen, this._x * invLen, this._y * invLen, this._z * invLen);
        }

        return this;
    }

    public dot(v: Quat): number {
        return this._w * v._w + this._x * v._x + this._y * v._y + this._z * v._z;
    }

    public negate(): Quat {
        return new Quat(-this._w, -this._x, -this._y, -this._z);
    }

    public inverse(): Quat {
        const normSquared = this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z;
        if (normSquared === 0) {
            return this;
        }
        return new Quat(this._w / normSquared, -this._x / normSquared, -this._y / normSquared, -this._z / normSquared);
    }

    public toEuler(useRadian: boolean = false): XYZValue {
        const n = this.normalize();

        const roll = Math.atan2(2 * (n._w * n._x + n._y * n._z), 1 - 2 * (n._x * n._x + n._y * n._y));

        const sinp = 2 * (n._w * n._y - n._z * n._x);
        let pitch = 0;
        if (Math.abs(sinp) >= 1) {
            pitch = Math.PI / 2 * Math.sign(sinp);
        } else {
            pitch = Math.asin(sinp);
        }

        const yaw = Math.atan2(2 * (n._w * n._z + n._x * n._y), 1 - 2 * (n._y * n._y + n._z * n._z));

        if (useRadian) {
            return new XYZValue(roll, pitch, yaw);
        } else {
            return new XYZValue(
                roll * (180 / Math.PI),
                pitch * (180 / Math.PI),
                yaw * (180 / Math.PI)
            );
        }
    }
}

const mulQuat = (a: Quat, b: Quat): Quat => {
    return new Quat(
        a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
        a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w
    );
}

const xyzRotation = (a: XYZValue, b: XYZValue): Quat => {
    const na = a.normalize();
    const nb = b.normalize();

    const dot = dotXYZ(na, nb);
    const cross = crossXYZ(na, nb);

    if (cross.length() === 0) {
        return dot > 0 ? new Quat(1, 0, 0, 0) : new Quat(0, 1, 0, 0);
    }

    return new Quat(1 + dot, cross.x, cross.y, cross.z).normalize();
}

// gr: global rotation, r: local rotation, q: quat
const applyQuatRotation = (gr: Quat, r: XYZValue, q: Quat): XYZValue => {
    // local rotation to quaternion
    const qr = quatFromDegree(r);
    // extract parent's global rotation from global rotation
    const pr = mulQuat(gr, qr.inverse());
    // apply new rotation to global rotation and convert back to local rotation
    const nr = mulQuat(pr.inverse(), mulQuat(q, gr));
    return nr.toEuler();
}

const averageQuat = (quats: Quat[]): Quat => {
    let [aw, ax, ay, az] = [0, 0, 0, 0];
    for (let i = 0; i < quats.length; i++) {
        aw += quats[i].w;
        ax += quats[i].x;
        ay += quats[i].y;
        az += quats[i].z;
    }
    const avg = new Quat(aw / quats.length, ax / quats.length, ay / quats.length, az / quats.length);
    return avg.normalize();
}

const quatFromDegree = (value: XYZValue): Quat => {
    // degree to radian
    const roll = value.x * (Math.PI / 180);
    const pitch = value.y * (Math.PI / 180);
    const yaw = value.z * (Math.PI / 180);

    const qx = new Quat(Math.cos(roll / 2), Math.sin(roll / 2), 0, 0);
    const qy = new Quat(Math.cos(pitch / 2), 0, Math.sin(pitch / 2), 0);
    const qz = new Quat(Math.cos(yaw / 2), 0, 0, Math.sin(yaw / 2));

    return mulQuat(qz, mulQuat(qy, qx));
}

const transferQuat = (xyz: XYZValue, quat: Quat): XYZValue => {
    const uvx = quat.y * xyz.z - quat.z * xyz.y
    const uvy = quat.z * xyz.x - quat.x * xyz.z
    const uvz = quat.x * xyz.y - quat.y * xyz.x
    const uuvx = quat.y * uvz - quat.z * uvy
    const uuvy = quat.z * uvx - quat.x * uvz
    const uuvz = quat.x * uvy - quat.y * uvx
    const w2 = quat.w * 2
    return new XYZValue(
        xyz.x + uvx * w2 + uuvx * 2,
        xyz.y + uvy * w2 + uuvy * 2,
        xyz.z + uvz * w2 + uuvz * 2,
    )
}

export default Quat;
export {
    mulQuat,
    xyzRotation,
    applyQuatRotation,
    quatFromDegree,
    transferQuat,
    averageQuat
}