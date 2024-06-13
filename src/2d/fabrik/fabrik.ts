import Target from '../items/target';
import MultiEndBone from '../items/bone';
import { Point, diffPoints, movePointAlone, pointAngle, pointDistance, pointLength } from '../value/point';
import { clampRange } from '../value/range';

class FABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(root: MultiEndBone, targets: Target[], useAngleLimit: boolean): number {
        for (let i = 0; i < FABRIK.MAX_ITERATIONS; i++) {
            const worlds: Map<string, Point> = new Map();
            const chainWorlds: Map<string, Point>[] = [];
            { // Initialize
                for (const bone of root) {
                    worlds.set(bone.id, bone.world[0]);
                }
            }
            // Early termination when the target is reached
            let allReached = true;
            for (const target of targets) {
                if (pointDistance(worlds.get(target.targetId)!, target.pos) > FABRIK.TOLERANCE) {
                    allReached = false;
                    break;
                }
            }
            if (allReached) {
                return i;
            }
            { // Forward
                for (const t of targets) {
                    const chain = new Map<string, Point>();
                    chain.set(t.targetId, t.pos);
                    let current: MultiEndBone | null = root.findChild(t.targetId);
                    while (current?.parent) {
                        const child = chain.get(current.id)!;
                        const parent = worlds.get(current.parent.id)!;
                        const length = pointLength(current.pos);
                        chain.set(current.parent.id, movePointAlone(child, parent, length));
                        current = current.parent;
                    }
                    chainWorlds.push(chain);
                }
            }
            { // Avg world position from different chains
                for (const bone of root) {
                    const avgWorld = { x: 0, y: 0 };
                    let count = 0;
                    for (const c of chainWorlds) {
                        const w = c.get(bone.id);
                        if (!w) {
                            continue;
                        }
                        avgWorld.x += w.x;
                        avgWorld.y += w.y;
                        count++;
                    }
                    avgWorld.x /= count;
                    avgWorld.y /= count;
                    worlds.set(bone.id, avgWorld);
                }
            }
            { // Backward
                worlds.set(root.id, root.pos);
                for (const bone of root) {
                    if (bone.children.length === 0) {
                        continue;
                    }
                    const angleDeltas: number[] = [];
                    for (const child of bone.children) {
                        const v1 = diffPoints(child.world[0], bone.world[0]);
                        const v2 = diffPoints(worlds.get(child.id)!, worlds.get(bone.id)!);
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
        }
        return FABRIK.MAX_ITERATIONS;
    }
}

export default FABRIK;