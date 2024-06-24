import XYZValue from './xyz_value';

class PointGroup {
    private _points: XYZValue[] = [];
    private _centroid = { x: 0, y: 0, z: 0 };

    public get centroid(): XYZValue {
        return new XYZValue(this._centroid.x, this._centroid.y, this._centroid.z);
    }

    constructor() { }

    public addPoint(p: XYZValue): void {
        this._points.push(p);
        this._updateCentroid();
    }

    private _updateCentroid(): void {
        let x = 0;
        let y = 0;
        let z = 0;
        for (const p of this._points) {
            x += p.x;
            y += p.y;
            z += p.z;
        }
        this._centroid = { x: x / this._points.length, y: y / this._points.length, z: z / this._points.length };
    }
}

export default PointGroup;