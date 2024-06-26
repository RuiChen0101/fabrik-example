import XYZValue, { addXYZ } from '../value/xyz_value';
import Quat, { mulQuat, quatFromDegree, transferQuat } from '../value/quat';

class Bone {
    private _name: string;
    private _parent: Bone | undefined;
    private _pos: XYZValue;
    private _rotation: XYZValue;
    private _childrenNames: Set<string> = new Set();
    private _children: Bone[] = [];

    public get name(): string {
        return this._name;
    }

    public get parent(): Bone | undefined {
        return this._parent;
    }

    public get children(): Bone[] {
        return this._children;
    }

    public get pos(): XYZValue {
        return this._pos;
    }

    public get rotation(): XYZValue {
        return this._rotation;
    }

    public set pos(pos: XYZValue) {
        this._pos = pos;
    }

    public set rotation(rotation: XYZValue) {
        rotation.x = (rotation.x + +180) % 360 - 180;
        rotation.y = (rotation.y + +180) % 360 - 180;
        rotation.z = (rotation.z + +180) % 360 - 180;
        this._rotation = rotation;
    }

    public get length(): number {
        return this._pos.length();
    }

    public get world(): [XYZValue, Quat] {
        if (!this._parent) {
            return [this._pos, quatFromDegree(this._rotation)];
        }
        const [pt, pr] = this.parent!.world;
        const worldTranslate = addXYZ(pt, transferQuat(this._pos, pr));
        const worldRotate = mulQuat(pr, quatFromDegree(this._rotation));
        return [worldTranslate, worldRotate];
    }

    constructor(name: string, pos: XYZValue, rotation: XYZValue) {
        this._name = name;
        this._pos = pos;
        this._rotation = rotation;
        this._childrenNames.add(name);
    }

    // in-order traversal
    *[Symbol.iterator](): Generator<Bone> {
        yield this;
        for (const child of this._children) {
            yield* child;
        }
    }

    public getTotalLengthToward(name: string): number {
        if (this._name == name) {
            return 0;
        }
        if (!this._childrenNames.has(name)) {
            throw new Error(`Bone with id ${name} is not a child of this bone`);
        }
        let length = 0;
        for (const child of this._children) {
            if (child._childrenNames.has(name)) {
                length += child.length;
                length += child.getTotalLengthToward(name);
                break;
            }
        }
        return length;
    }

    public eq(bone: Bone): boolean {
        if (this._name !== bone._name) {
            return false;
        }
        if (this._children.length !== bone._children.length) {
            return false;
        }
        for (let i = 0; i < this._children.length; i++) {
            if (!this._children[i].eq(bone._children[i])) {
                return false;
            }
        }
        return true;
    }

    public canLeadTo(name: string): boolean {
        return this._childrenNames.has(name);
    }

    public list(): Bone[] {
        const list: Bone[] = [];
        for (const bone of this) {
            list.push(bone);
        }
        return list;
    }

    public find(name: string): Bone | undefined {
        if (this._name === name) {
            return this;
        }
        for (const child of this._children) {
            if (child.name === name) {
                return child;
            } else if (child._childrenNames.has(name)) {
                return child.find(name);
            }
        }
        return undefined;
    }

    public copy(): Bone {
        const bone = new Bone(this._name, this._pos.copy(), this._rotation.copy());
        for (const child of this._children) {
            bone.addChild(child.copy());
        }
        return bone;
    }

    public addChild(child: Bone): void {
        this._children.push(child);
        this._childrenNames = new Set([...this._childrenNames, ...child._childrenNames]);
        child._parent = this;
    }
}

export default Bone;