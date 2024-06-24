import Bone from '../character/bone';
import PointGroup from '../value/point_group';
import Quat, { applyQuatRotation, averageQuat, xyzRotation } from '../value/quat';
import XYZValue, { moveXYZAlone, subXYZ } from '../value/xyz_value';

class MultiEndFABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(root: Bone, poss: XYZValue[], endNames: string[]): number {
        for (let i = 0; i < MultiEndFABRIK.MAX_ITERATIONS; i++) {
            const worlds: Map<string, XYZValue> = new Map();
            const forwardWorlds: Map<string, PointGroup> = new Map();
            { // Initialize
                for (const bone of root) {
                    worlds.set(bone.name, bone.world[0]);
                    forwardWorlds.set(bone.name, new PointGroup());
                }
            }
            { // Forward
                const queue: Bone[] = [];
                const visited: Set<string> = new Set();
                for (let i = 0; i < endNames.length; i++) {
                    queue.push(root.find(endNames[i])!);
                    forwardWorlds.get(endNames[i])!.addPoint(poss[i]);
                }
                let current: Bone | undefined = queue.shift();
                while (current) {
                    if (!current.parent) { // skip root
                        visited.add(current.name);
                        current = queue.shift();
                        continue;
                    }
                    if (visited.has(current.name)) { // skip visited
                        current = queue.shift();
                        continue;
                    }
                    let allChildrenVisited = true;
                    for (const child of current.children) {
                        if (!visited.has(child.name)) {
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
                    visited.add(current!.name);
                    // forward process
                    const child = forwardWorlds.get(current.name)!;
                    const parent = worlds.get(current.parent.name)!;
                    const length = current.pos.length();
                    const pg = forwardWorlds.get(current.parent.name)!;
                    let newWorld = moveXYZAlone(child.centroid, parent, length);
                    pg.addPoint(newWorld);
                    forwardWorlds.set(current.parent.name, pg);
                    queue.push(current.parent);
                    current = queue.shift();
                }
            }
            { // Backward
                for (const bone of root) {
                    if (bone.children.length === 0) {
                        continue;
                    }
                    const quats: Quat[] = [];
                    const [bw, br] = bone.world;
                    for (const child of bone.children) {
                        const v1 = subXYZ(child.world[0], bw);
                        const v2 = subXYZ(forwardWorlds.get(child.name)!.centroid, bw);
                        const quat = xyzRotation(v1, v2)
                        quats.push(quat);
                    }
                    const avg = averageQuat(quats);
                    bone.rotation = applyQuatRotation(br, bone.rotation, avg);
                }
            }
            // Early termination when the target is reached
            let allReached = true;
            for (let i = 0; i < endNames.length; i++) {
                if (subXYZ(root.find(endNames[i])!.world[0], poss[i]).length() > MultiEndFABRIK.TOLERANCE) {
                    allReached = false;
                    break;
                }
            }
            if (allReached) {
                return i + 1;
            }
        }
        return MultiEndFABRIK.MAX_ITERATIONS;
    }
}

export default MultiEndFABRIK;