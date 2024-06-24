import Bone from '../items/bone';
import Target from '../items/target';
import { clampRange } from '../value/range';
import PointGroup from '../value/point-group';
import { Point, diffPoints, movePointAlone, pointAngle, pointDistance, pointLength, rotatePoint } from '../value/point';

class MultiEndFABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(root: Bone, targets: Target[], useAngleLimit: boolean): number {
        for (let i = 0; i < MultiEndFABRIK.MAX_ITERATIONS; i++) {
            const worlds: Map<string, Point> = new Map();
            const forwardWorlds: Map<string, PointGroup> = new Map();
            { // Initialize
                for (const bone of root) {
                    worlds.set(bone.id, bone.world[0]);
                    forwardWorlds.set(bone.id, new PointGroup());
                }
            }
            { // Forward
                const queue: Bone[] = [];
                const visited: Set<string> = new Set();
                for (const t of targets) {
                    queue.push(root.findChild(t.targetId)!);
                    forwardWorlds.get(t.targetId)!.addPoint(t.pos);
                }
                let current: Bone | undefined = queue.shift();
                while (current) {
                    if (!current.parent) { // skip root
                        visited.add(current.id);
                        current = queue.shift();
                        continue;
                    }
                    if (visited.has(current.id)) { // skip visited
                        current = queue.shift();
                        continue;
                    }
                    let allChildrenVisited = true;
                    for (const child of current.children) {
                        if (!visited.has(child.id)) {
                            allChildrenVisited = false;
                            break;
                        }
                    }
                    // if one of the children is not visited, push current back
                    // to the queue and continue
                    if (!allChildrenVisited) {
                        queue.push(current);
                        current = queue.shift();
                        continue;
                    }
                    visited.add(current!.id);
                    // forward process
                    const child = forwardWorlds.get(current.id)!;
                    const parent = worlds.get(current.parent.id)!;
                    const length = pointLength(current.pos);
                    const pg = forwardWorlds.get(current.parent.id)!;
                    let newWorld = movePointAlone(child.centroid, parent, length);
                    if (useAngleLimit) {
                        if (current.children.length === 0) {
                            pg.addPoint(newWorld);
                        } else {
                            const grandChild = current.children[0];
                            const naturalAngle = (pointAngle(grandChild.pos, current.pos) + 180) % 360 - 180;
                            const v1 = diffPoints(forwardWorlds.get(grandChild.id)!.centroid, child.centroid);
                            const v2 = diffPoints(child.centroid, newWorld);
                            const theta = (pointAngle(v1, v2) + 180) % 360 - 180;
                            const angle = theta - naturalAngle;
                            const clamp = clampRange(angle, current.angleLimit);
                            const delta = clamp - angle;
                            pg.addPoint(rotatePoint(newWorld, child.centroid, delta));
                        }
                    } else {
                        pg.addPoint(newWorld);
                    }
                    forwardWorlds.set(current.parent.id, pg);
                    // next
                    queue.push(current.parent);
                    current = queue.shift();
                }
            }
            { // Backward
                for (const bone of root) {
                    if (bone.children.length === 0) {
                        continue;
                    }
                    const angleDeltas: number[] = [];
                    const bw = bone.world[0];
                    for (const child of bone.children) {
                        const v1 = diffPoints(child.world[0], bw);
                        const v2 = diffPoints(forwardWorlds.get(child.id)!.centroid, bw);
                        const angle = pointAngle(v1, v2);
                        angleDeltas.push((angle + 180) % 360 - 180);
                    }
                    const avg = angleDeltas.reduce((a, b) => a + b, 0) / angleDeltas.length;
                    const newAngle = (bone.angle + avg + 180) % 360 - 180;
                    if (useAngleLimit) {
                        bone.angle = clampRange(newAngle, bone.angleLimit);
                    } else {
                        bone.angle = newAngle;
                    }
                }
            }
            // Early termination when the target is reached
            let allReached = true;
            for (const t of targets) {
                if (pointDistance(root.findChild(t.targetId)!.world[0], t.pos) > MultiEndFABRIK.TOLERANCE) {
                    allReached = false;
                    break;
                }
            }
            if (allReached) {
                return i;
            }
        }
        return MultiEndFABRIK.MAX_ITERATIONS;
    }
}

export default MultiEndFABRIK;