import { expect, test, describe } from 'vitest';
import XYZValue from '../../../src/3d/value/xyz_value';
import Quat, { applyQuatRotation, quatFromDegree, transferQuat, xyzRotation } from '../../../src/3d/value/quat';

describe('quat', () => {
    test('test apply quaternion', () => {
        const r1 = applyQuatRotation(new Quat(0.7071067811865476, 0, 0.7071067811865475, 0), new XYZValue(0, 90, 0), new Quat(1, 0, 0, 0));
        expect(r1.x).toBeCloseTo(0, 5);
        expect(r1.y).toBeCloseTo(90, 5);
        expect(r1.z).toBeCloseTo(0, 5);
        const r2 = applyQuatRotation(new Quat(0.7071067811865476, 0, 0.7071067811865475, 0), new XYZValue(0, 90, 0), new Quat(0, 1, 0, 0));
        expect(r2.x).toBeCloseTo(180, 5);
        expect(r2.y).toBeCloseTo(-90, 5);
        expect(r2.z).toBeCloseTo(0, 5);
    });

    test('test transferQuat', () => {
        const pos = new XYZValue(1, 2, 3);
        const quat = new Quat(0.7071067811865476, 0, 0.7071067811865475, 0);
        const r = transferQuat(pos, quat);
        expect(r.x).toBeCloseTo(3, 5);
        expect(r.y).toBeCloseTo(2, 5);
        expect(r.z).toBeCloseTo(-1, 5);
        const r2 = transferQuat(r, quat.inverse());
        expect(r2.x).toBeCloseTo(1, 5);
        expect(r2.y).toBeCloseTo(2, 5);
        expect(r2.z).toBeCloseTo(3, 5);
    });

    test('test xyzRotation will return correct angle of rotation', () => {
        const v1 = new XYZValue(-41.55416026062527, -23.32211631159055, 87.91661194440394);
        const v2 = new XYZValue(-50.80669294345101, -80.36956934365189, 30.97438095694281);
        const q = xyzRotation(v1, v2);
        const rv1 = transferQuat(v1, q);
        expect(rv1.x).toBeCloseTo(v2.x, 5);
        expect(rv1.y).toBeCloseTo(v2.y, 5);
        expect(rv1.z).toBeCloseTo(v2.z, 5);
    });
});