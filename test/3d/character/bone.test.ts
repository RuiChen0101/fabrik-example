import { describe, expect, test } from 'vitest';

import Bone from '../../../src/3d/character/bone';
import XYZValue, { subXYZ } from '../../../src/3d/value/xyz_value';
import { mulQuat, quatFromDegree, xyzRotation } from '../../../src/3d/value/quat';

describe('bone', () => {
    test('test bone world position calculation', () => {
        const root = new Bone('root', new XYZValue(0, 0, 0), new XYZValue(0, 0, 0));
        const bone1 = new Bone('bone1', new XYZValue(0, 100, 0), new XYZValue(0, 0, 0));
        root.addChild(bone1);
        const bw = bone1.world[0];
        expect(bw.x).toBeCloseTo(0, 5);
        expect(bw.y).toBeCloseTo(100, 5);
        expect(bw.z).toBeCloseTo(0, 5);
    });

    test('test bone world position calculation with different local rotation', () => {
        const root = new Bone('root', new XYZValue(0, 0, 0), new XYZValue(90, 0, 0));
        const bone1 = new Bone('bone1', new XYZValue(0, 100, 0), new XYZValue(0, 0, 0));
        root.addChild(bone1);
        let bw = bone1.world[0];
        expect(bw.x).toBeCloseTo(0, 5);
        expect(bw.y).toBeCloseTo(0, 5);
        expect(bw.z).toBeCloseTo(100, 5);

        root.rotation = new XYZValue(0, 0, 90);
        bw = bone1.world[0];
        expect(bw.x).toBeCloseTo(-100, 5);
        expect(bw.y).toBeCloseTo(0, 5);
        expect(bw.z).toBeCloseTo(0, 5);
    });

    test('test bone world position calculation after apply new quat rotation', () => {
        const root = new Bone('root', new XYZValue(0, 0, 0), new XYZValue(4.909412733568189, -0.04645663367750785, 2.9342290124949955));
        const bone1 = new Bone('bone1', new XYZValue(0, 100, 0), new XYZValue(88.48693747014113, -26.528812412864426, 21.032390480003045));
        const bone2 = new Bone('bone2', new XYZValue(0, 100, 0), new XYZValue(88.17957621302781, 29.752347072435526, -136.09175620814048));
        const bone3 = new Bone('bone3', new XYZValue(0, 100, 0), new XYZValue(0, 0, 0));
        bone2.addChild(bone3);
        bone1.addChild(bone2);
        root.addChild(bone1);
        const target = new XYZValue(-97.46796047985973, -4.189539425644716, 127.44905056517388);
        const pr = bone1.world[1];
        const [bw, br] = bone2.world;
        const v1 = subXYZ(bone3.world[0], bw);
        const v2 = subXYZ(target, bw);
        const q = xyzRotation(v1, v2);
        bone2.rotation = mulQuat(pr.inverse(), mulQuat(q, br)).toEuler();
        expect(bone3.world[0].x).toBeCloseTo(target.x, 5);
        expect(bone3.world[0].y).toBeCloseTo(target.y, 5);
        expect(bone3.world[0].z).toBeCloseTo(target.z, 5);
    });
});