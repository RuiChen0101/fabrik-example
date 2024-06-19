import Bone from '../items/bone';
import Target from '../items/target';
import { clampRange } from '../value/range';
import { Point, diffPoints, movePointAlone, pointAngle, pointDistance, pointLength, rotatePoint } from '../value/point';

class SingleEndFABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(root: Bone, target: Target, useAngleLimit: boolean): number {
        if (pointDistance(root.world[0], target.pos) > root.getTotalLengthToward(target.targetId)) {
            // Target is unreachable, stretch the chain
            for (const bone of root) {
                if (bone.children.length === 0) {
                    continue;
                }
                const bw = bone.world[0];
                const v1 = diffPoints(bone.children[0].world[0], bw);
                const v2 = diffPoints(target.pos, bw);
                const angle = pointAngle(v1, v2);
                const newAngle = (bone.angle + angle + 180) % 360 - 180;
                if (useAngleLimit) {
                    bone.angle = clampRange(newAngle, bone.angleLimit);
                } else {
                    bone.angle = newAngle;
                }
            }
            return 1;
        }
        for (let i = 0; i < SingleEndFABRIK.MAX_ITERATIONS; i++) {
            const worlds: Map<string, Point> = new Map();
            { // Initialize
                for (const bone of root) {
                    if (bone.children.length > 1) {
                        throw new Error('resolveSingleEnd only supports a chain of bones with a single end effector');
                    }
                    worlds.set(bone.id, bone.world[0]);
                }
            }
            // Early termination when the target is reached
            if (pointDistance(worlds.get(target.targetId)!, target.pos) < SingleEndFABRIK.TOLERANCE) {
                return i;
            }
            { // Forward
                worlds.set(target.targetId, target.pos);
                let current: Bone | null = root.findChild(target.targetId);
                while (current?.parent) {
                    const child = worlds.get(current.id)!;
                    const parent = worlds.get(current.parent.id)!;
                    const length = pointLength(current.pos);
                    const newWorld = movePointAlone(child, parent, length);
                    if (useAngleLimit) {
                        if (current.children.length === 0) {
                            worlds.set(current.parent.id, newWorld);
                        } else {
                            const grandChild = current.children[0];
                            const naturalAngle = (pointAngle(grandChild.pos, current.pos) + 180) % 360 - 180;
                            const v1 = diffPoints(worlds.get(grandChild.id)!, child);
                            const v2 = diffPoints(child, newWorld);
                            const theta = (pointAngle(v1, v2) + 180) % 360 - 180;
                            const angle = theta - naturalAngle;
                            const clamp = clampRange(angle, current.angleLimit);
                            const delta = clamp - angle;
                            worlds.set(current.parent.id, rotatePoint(newWorld, child, delta));
                        }
                    } else {
                        worlds.set(current.parent.id, newWorld);
                    }
                    current = current.parent;
                }
            }
            { // Backward
                worlds.set(root.id, root.pos);
                for (const bone of root) {
                    if (bone.children.length === 0) {
                        continue;
                    }
                    const v1 = diffPoints(bone.children[0].world[0], bone.world[0]);
                    const v2 = diffPoints(worlds.get(bone.children[0].id)!, worlds.get(bone.id)!);
                    const angle = pointAngle(v1, v2);
                    const newAngle = (bone.angle + angle + 180) % 360 - 180;
                    if (useAngleLimit) {
                        bone.angle = clampRange(newAngle, bone.angleLimit);
                    } else {
                        bone.angle = newAngle;
                    }
                    worlds.set(bone.id, bone.world[0]);
                }
            }
        }
        return SingleEndFABRIK.MAX_ITERATIONS;
    }
}

export default SingleEndFABRIK;