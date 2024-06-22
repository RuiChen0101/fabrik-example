import Bone from '../character/bone';
import { applyQuatRotation, xyzRotation } from '../value/quat';
import XYZValue, { moveXYZAlone, subXYZ, xyzDistance } from '../value/xyz_value';

class SingleEndFABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(root: Bone, pos: XYZValue, endName: string): [number, Map<string, XYZValue>] {
        if (xyzDistance(root.world[0], pos) > root.getTotalLengthToward(endName)) {
            // Target is unreachable, stretch the chain
            for (const bone of root) {
                if (bone.children.length === 0) {
                    continue;
                }
                const bw = bone.world[0];
                const v1 = subXYZ(bone.children[0].world[0], bw);
                const v2 = subXYZ(pos, bw);
                const q = xyzRotation(v1, v2);
                bone.rotation = applyQuatRotation(bone.rotation, q);
            }
            return [1, new Map<string, XYZValue>()];
        }
        // for (let i = 0; i < SingleEndFABRIK.MAX_ITERATIONS; i++) {
        const worlds: Map<string, XYZValue> = new Map();
        { // Initialize
            for (const bone of root) {
                if (bone.children.length > 1) {
                    throw new Error('resolveSingleEnd only supports a chain of bones with a single end effector');
                }
                worlds.set(bone.name, bone.world[0]);
            }
        }
        // Early termination when the target is reached
        if (xyzDistance(worlds.get(endName)!, pos) < SingleEndFABRIK.TOLERANCE) {
            return [1, worlds];
        }
        { // Forward
            worlds.set(endName, pos);
            let current: Bone | undefined = root.find(endName);
            while (current?.parent) {
                const child = worlds.get(current.name)!;
                const parent = worlds.get(current.parent.name)!;
                const length = current.pos.length();
                const newWorld = moveXYZAlone(child, parent, length);
                worlds.set(current.parent.name, newWorld);
                current = current.parent;
            }
        }
        const init = new Map(worlds);
        { // Backward
            worlds.set(root.name, root.pos);
            for (const bone of root) {
                if (bone.children.length === 0) {
                    continue;
                }
                const v1 = subXYZ(bone.children[0].world[0], bone.world[0]);
                const v2 = subXYZ(worlds.get(bone.children[0].name)!, worlds.get(bone.name)!);
                const q = xyzRotation(v1, v2);
                if (bone.name === 'bone2') {
                    console.log(bone.children[0].world[0], bone.world[0]);
                    console.log(worlds.get(bone.children[0].name), worlds.get(bone.name));
                    console.log(v1, v2);
                    console.log(q, q.toEuler(true));
                    console.log('........');
                }
                bone.rotation = applyQuatRotation(bone.rotation, q);
                worlds.set(bone.name, bone.world[0]);
            }
        }
        // }
        return [SingleEndFABRIK.MAX_ITERATIONS, init];
    }
}

export default SingleEndFABRIK;