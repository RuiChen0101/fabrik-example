import { Point, pointLength } from '../value/point';
import { drawLine } from '../shape/line';
import { drawCircle } from '../shape/circle';

class SingleFactorBone {
    private _pos: Point;
    private _angle: number;
    private _parent: SingleFactorBone | null = null;
    private _child: SingleFactorBone | null = null;
    private _length: number = 0;

    public set pos(pos: Point) {
        this._pos = pos;
    }

    public set angle(angle: number) {
        this._angle = angle;
    }

    public get pos(): Point {
        return this._pos;
    }

    public get angle(): number {
        return this._angle;
    }

    public get parent(): SingleFactorBone | null {
        return this._parent;
    }

    public get child(): SingleFactorBone | null {
        return this._child;
    }

    public get length(): number {
        return this._length
    }

    public get totalLength(): number {
        if (!this._child) {
            return this._length;
        }
        return this._length + this._child.totalLength;
    }

    public get world(): [Point, number] {
        if (!this._parent) {
            return [this._pos, this._angle];
        }
        const [parentPos, parentAngle] = this._parent?.world;

        const cos = Math.cos(parentAngle * (Math.PI / 180));
        const sin = Math.sin(parentAngle * (Math.PI / 180));

        const x = this._pos.x * cos - this._pos.y * sin + parentPos.x;
        const y = this._pos.x * sin + this._pos.y * cos + parentPos.y;
        const angle = (this._angle + parentAngle) % 360;

        return [{ x, y }, angle];
    }

    constructor(pos: Point, angle: number) {
        this._pos = pos;
        this._angle = angle;
    }

    public setChild(bone: SingleFactorBone): void {
        this._child = bone;
        this._length = pointLength(bone.pos);
        bone._parent = this;
    }

    public draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        const [pos, _angle] = this.world;

        if (this._child) {
            const [childPos, _childAngle] = this._child.world;

            drawLine(canvas, context, {
                start: pos,
                end: childPos,
                color: "#000",
                width: 5
            });
            this._child.draw(canvas, context);
        }

        drawCircle(canvas, context, {
            pos,
            radius: 8,
            color: "#f00",
            borderWidth: 0
        });
    }
}

export default SingleFactorBone;