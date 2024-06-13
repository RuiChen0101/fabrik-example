import { drawArc } from '../shape/arc';
import { Point } from '../value/point';
import { Range } from '../value/range';
import { drawText } from '../shape/text';
import { drawLine } from '../shape/line';
import { drawCircle } from '../shape/circle';

class Bone {
    private _id: string;
    private _pos: Point;
    private _angle: number;
    private _parent: Bone | null = null;
    private _children: Bone[] = [];
    private _childrenNames: Map<string, boolean> = new Map();
    private _angleLimit: Range = { min: -180, max: 180 };

    public get id(): string {
        return this._id;
    }

    public set pos(pos: Point) {
        this._pos = pos;
    }

    public set angle(angle: number) {
        this._angle = (angle + 180) % 360 - 180;
    }

    public set angleLimit(range: Range) {
        this._angleLimit = range;
    }

    public get pos(): Point {
        return this._pos;
    }

    public get angle(): number {
        return this._angle;
    }

    public get parent(): Bone | null {
        return this._parent;
    }

    public get children(): Bone[] {
        return this._children;
    }

    public get angleLimit(): Range {
        return this._angleLimit;
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
        const angle = ((this._angle + parentAngle + 180) % 360) - 180;

        return [{ x, y }, angle];
    }

    // in-order traversal
    *[Symbol.iterator](): Generator<Bone> {
        yield this;
        for (const child of this._children) {
            yield* child;
        }
    }

    constructor(id: string, pos: Point, angle: number) {
        this._id = id;
        this._pos = pos;
        this._angle = angle;
    }

    public addChild(child: Bone): void {
        this._children.push(child);
        this._childrenNames.set(child._id, true);
        for (const grandChild of child) {
            this._childrenNames.set(grandChild._id, true);
        }
        child._parent = this;
    }

    public findChild(id: string): Bone | null {
        if (this._id == id) {
            return this;
        }
        for (const child of this._children) {
            if (child._id == id) {
                return child;
            }
            if (child._childrenNames.has(id)) {
                return child.findChild(id);
            }
        }
        return null;
    }

    public draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, drawLimit: boolean): void {
        const [pos, _angle] = this.world;

        for (const child of this._children) {
            const [childPos, _childAngle] = child.world;

            drawLine(canvas, context, {
                start: pos,
                end: childPos,
                color: "#000",
                width: 5
            });
            child.draw(canvas, context, drawLimit);
        }

        if (drawLimit) {
            drawArc(canvas, context, {
                pos,
                radius: 15,
                startAngle: (this._angleLimit.min + _angle - this.angle) % 360,
                endAngle: (this._angleLimit.max + _angle - this.angle) % 360,
                borderColor: "#00f",
                borderWidth: 5
            });
        }

        drawCircle(canvas, context, {
            pos,
            radius: 8,
            color: "#f00",
            borderWidth: 0
        });

        drawText(canvas, context, {
            pos: { x: pos.x, y: pos.y - 20 },
            text: `${this.angle.toFixed(2)}°`,
            fontSize: 16,
            vAlign: 'bottom',
            hAlign: 'center',
            color: "#000"
        });
    }
}

export default Bone;