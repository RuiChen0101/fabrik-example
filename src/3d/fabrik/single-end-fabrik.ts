import Bone from '../character/bone';
import { applyQuatRotation, xyzRotation } from '../value/quat';
import XYZValue, { moveXYZAlone, subXYZ, xyzDistance } from '../value/xyz_value';

class SingleEndFABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(root: Bone, pos: XYZValue, endName: string): number {
        if (xyzDistance(root.world[0], pos) > root.getTotalLengthToward(endName)) {
            // Target is unreachable, stretch the chain
            for (const bone of root) {
                if (bone.children.length === 0) {
                    continue;
                }
                const [bw, br] = bone.world;
                const v1 = subXYZ(bone.children[0].world[0], bw);
                const v2 = subXYZ(pos, bw);
                const q = xyzRotation(v1, v2);
                bone.rotation = applyQuatRotation(br, bone.rotation, q);
            }
            return 1;
        }
        for (let i = 0; i < SingleEndFABRIK.MAX_ITERATIONS; i++) {
            const worlds: Map<string, XYZValue> = new Map();
            { // Initialize
                for (const bone of root) {
                    if (bone.name === 'bone4') {
                        continue;
                    }
                    if (bone.children.length > 1) {
                        throw new Error('resolveSingleEnd only supports a chain of bones with a single end effector');
                    }
                    worlds.set(bone.name, bone.world[0]);
                }
            }
            // Early termination when the target is reached
            if (xyzDistance(worlds.get(endName)!, pos) < SingleEndFABRIK.TOLERANCE) {
                return 1;
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
            { // Backward
                for (const bone of root) {
                    if (bone.name === 'bone3') {
                        continue;
                    }
                    if (bone.children.length === 0) {
                        continue;
                    }
                    const [bw, br] = bone.world;
                    const v1 = subXYZ(bone.children[0].world[0], bw);
                    const v2 = subXYZ(worlds.get(bone.children[0].name)!, bw);
                    const q = xyzRotation(v1, v2);
                    bone.rotation = applyQuatRotation(br, bone.rotation, q);
                }
            }
        }
        return SingleEndFABRIK.MAX_ITERATIONS;
    }
}

export default SingleEndFABRIK;
