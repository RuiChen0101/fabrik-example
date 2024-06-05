import { drawCircle } from '../shape/circle';
import { Point } from '../value/point';

class Target {
    private _pos: Point;
    private _pressed: boolean = false;

    public set pressed(pressed: boolean) {
        this._pressed = pressed;
    }

    public set pos(pos: Point) {
        this._pos = pos;
    }

    public get pressed(): boolean {
        return this._pressed;
    }

    public get pos(): Point {
        return this._pos;
    }

    constructor(pos: Point) {
        this._pos = pos;
    }

    public checkHit(pos: Point): boolean {
        const dx = this.pos.x - pos.x;
        const dy = this.pos.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= 15;
    }

    public draw(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        drawCircle(canvas, context, {
            pos: this.pos,
            color: "#0f0",
            radius: 15,
            borderWidth: 0
        });
    }
}

export default Target;