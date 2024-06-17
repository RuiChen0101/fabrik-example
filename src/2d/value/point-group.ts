import { Point } from './point';

class PointGroup {
    private _points: Point[] = [];
    private _centroid: Point = { x: 0, y: 0 };

    public get centroid(): Point {
        return this._centroid;
    }

    constructor() { }

    public addPoint(p: Point): void {
        this._points.push(p);
        this._updateCentroid();
    }

    private _updateCentroid(): void {
        let x = 0;
        let y = 0;
        for (const p of this._points) {
            x += p.x;
            y += p.y;
        }
        this._centroid = { x: x / this._points.length, y: y / this._points.length };
    }
}

export default PointGroup;