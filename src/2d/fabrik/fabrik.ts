import Bone from '../items/bone';
import Target from '../items/target';
import { clampRange } from '../value/range';
import PointGroup from '../value/point-group';
import { Point, diffPoints, movePointAlone, pointAngle, pointDistance, pointLength, rotatePoint } from '../value/point';

class FABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(root: Bone, targets: Target[], useAngleLimit: boolean): number {
        for (let i = 0; i < FABRIK.MAX_ITERATIONS; i++) {
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
                    pg.addPoint(movePointAlone(child.centroid, parent, length));
                    forwardWorlds.set(current.parent.id, pg);
                    // next
                    queue.push(current.parent);
                    current = queue.shift();
                }
            }
            { // Backward
                worlds.set(root.id, root.pos);
                for (const bone of root) {
                    if (bone.children.length === 0) {
                        continue;
                    }
                    const originPg = new PointGroup();
                    const forwardPg = new PointGroup();
                    for (const child of bone.children) {
                        originPg.addPoint(child.world[0]);
                        forwardPg.addPoint(forwardWorlds.get(child.id)!.centroid);
                    }
                    const v1 = diffPoints(originPg.centroid, bone.world[0]);
                    const v2 = diffPoints(forwardPg.centroid, worlds.get(bone.id)!);
                    const angle = pointAngle(v1, v2);
                    const newAngle = (bone.angle + angle + 180) % 360 - 180;
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
                if (pointDistance(root.findChild(t.targetId)!.world[0], t.pos) > FABRIK.TOLERANCE) {
                    allReached = false;
                    break;
                }
            }
            if (allReached) {
                return i;
            }
        }
        return FABRIK.MAX_ITERATIONS;
    }

    public resolveSingleEnd(root: Bone, target: Target, useAngleLimit: boolean): number {
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
        for (let i = 0; i < FABRIK.MAX_ITERATIONS; i++) {
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
            if (pointDistance(worlds.get(target.targetId)!, target.pos) < FABRIK.TOLERANCE) {
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
                            const v1 = diffPoints(worlds.get(grandChild.id)!, child);
                            const v2 = diffPoints(child, newWorld);
                            const angle = (pointAngle(v1, v2) + 180) % 360 - 180;
                            const clamp = clampRange(angle, current.angleLimit);
                            const delta = clamp - angle;
                            const newNewWorld = rotatePoint(newWorld, child, delta);
                            worlds.set(current.parent.id, newNewWorld);
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
        return FABRIK.MAX_ITERATIONS;
    }
}

export default FABRIK;