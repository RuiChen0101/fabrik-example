import SingleFactorBone from '../items/single-end-bone';
import { Point, diffPoints, movePointAlone, pointAngle, pointDistance } from '../value/point';

class SingleEndFABRIK {
    private static MAX_ITERATIONS = 30;
    private static TOLERANCE = 0.1;
    public resolve(root: SingleFactorBone, target: Point, useAngleLimit: boolean): number {

        if (pointDistance(root.world[0], target) > root.totalLength) {
            // Target is unreachable, stretch the chain
            let current: SingleFactorBone | null = root;
            while (current?.child) {
                const v1 = diffPoints(current.child.world[0], current.world[0]);
                const v2 = diffPoints(target, current.world[0]);
                const angle = pointAngle(v1, v2);
                current.angle = current.angle + angle;
                current = current.child;
            }
            return 1;
        }

        for (let i = 0; i < SingleEndFABRIK.MAX_ITERATIONS; i++) {
            const worlds: Point[] = [];
            const lengths: number[] = [];
            { // Initialize
                let current: SingleFactorBone | null = root;
                while (current) {
                    worlds.push(current.world[0]);
                    lengths.push(current.length);
                    current = current.child;
                }
            }
            // Early termination when the target is reached
            if (pointDistance(worlds[worlds.length - 1], target) < SingleEndFABRIK.TOLERANCE) {
                return i;
            }
            { // Forward
                worlds[worlds.length - 1] = target;
                for (let i = worlds.length - 2; i >= 0; i--) {
                    const child = worlds[i + 1];
                    const parent = worlds[i];
                    const length = lengths[i];
                    worlds[i] = movePointAlone(child, parent, length);
                }
            }
            { // Backward
                let current: SingleFactorBone | null = root;
                let i = 0;
                while (current?.child) {
                    const v1 = diffPoints(current.child.world[0], current.world[0]);
                    const v2 = diffPoints(worlds[i + 1], worlds[i]);
                    const angle = pointAngle(v1, v2);
                    const newAngle = current.angle + angle;
                    if (useAngleLimit && (newAngle < current.angleLimit.min || newAngle > current.angleLimit.max)) {
                        current.angle = Math.min(Math.max(current.angleLimit.min, newAngle), current.angleLimit.max);
                    } else {
                        current.angle = newAngle;
                    }
                    current = current.child;
                    i++;
                }
            }
        }
        return SingleEndFABRIK.MAX_ITERATIONS;
    }
}

export default SingleEndFABRIK;