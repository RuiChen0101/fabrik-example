import Bone from '../character/bone';
import PointGroup from '../value/point_group';
import Character from '../character/character';
import XYZValue, { moveXYZAlone, subXYZ } from '../value/xyz_value';
import Quat, { applyQuatRotation, averageQuat, quatFromDegree, transferQuat, xyzRotation } from '../value/quat';

interface FullBodyIKTargets {
    leftHand: XYZValue;
    rightHand: XYZValue;
    leftFoot: XYZValue;
    rightFoot: XYZValue;
}

class FullBodyFABRIK {
    private static MAX_ITERATIONS = 20;
    private static TOLERANCE = 0.1;

    public resolve(char: Character, targets: FullBodyIKTargets): number {
        for (let i = 0; i < FullBodyFABRIK.MAX_ITERATIONS; i++) {
            const boneShouldVisit = this._extractBoneShouldVisit(char.root, 'pelvis', 'hand_l', 'hand_r', 'foot_l', 'foot_r');
            const worlds: Map<string, XYZValue> = new Map();
            { // Initialize
                for (const bone of char.root) {
                    if (boneShouldVisit.has(bone.name)) {
                        worlds.set(bone.name, bone.world[0]);
                    }
                }
            }
            let forward: Map<string, XYZValue> = new Map();
            {// Forward
                const upperBodyForward = this._solveUpperBodyForward(
                    char.root,
                    targets,
                    worlds,
                    boneShouldVisit
                );
                const lowerBodyForward = this._solveLowerBodyForward(
                    char.root,
                    upperBodyForward.get('pelvis')!,
                    targets,
                    worlds,
                    boneShouldVisit
                );
                forward = new Map([...upperBodyForward, ...lowerBodyForward]);
                // use lower body forward as the pelvis, because ue want to keep
                // lower body(especially foot) in place
                forward.set('pelvis', lowerBodyForward.get('pelvis')!);
            }
            { // Update root and hip first
                const root = char.root;
                const hip = root.find('pelvis')!;
                hip.pos = transferQuat(forward.get('pelvis')!, quatFromDegree(root.rotation).inverse());
            }
            { // Backward, use hip as fix root
                for (const bone of char.find('pelvis')!) {
                    if (!boneShouldVisit.has(bone.name)) {
                        continue;
                    }
                    if (bone.name === 'foot_l' || bone.name === 'foot_r' || bone.name === 'hand_l' || bone.name === 'hand_r') {
                        continue;
                    }
                    const quats: Quat[] = [];
                    const [bw, br] = bone.world;
                    for (const child of bone.children) {
                        if (!boneShouldVisit.has(child.name)) {
                            continue;
                        }
                        const v1 = subXYZ(child.world[0], bw);
                        const v2 = subXYZ(forward.get(child.name)!, bw);
                        const quat = xyzRotation(v1, v2)
                        quats.push(quat);
                    }
                    const avg = averageQuat(quats);
                    bone.rotation = applyQuatRotation(br, bone.rotation, avg);
                }
            }
            // Early termination when the target is reached
            if (
                subXYZ(targets.leftHand, char.find('hand_l')!.world[0]).length() < FullBodyFABRIK.TOLERANCE &&
                subXYZ(targets.rightHand, char.find('hand_r')!.world[0]).length() < FullBodyFABRIK.TOLERANCE &&
                subXYZ(targets.leftFoot, char.find('foot_l')!.world[0]).length() < FullBodyFABRIK.TOLERANCE &&
                subXYZ(targets.rightFoot, char.find('foot_r')!.world[0]).length() < FullBodyFABRIK.TOLERANCE
            ) {
                return i + 1;
            }
        }
        return FullBodyFABRIK.MAX_ITERATIONS;
    }

    private _extractBoneShouldVisit(
        root: Bone,
        hip: string,
        leftHand: string,
        rightHand: string,
        leftFoot: string,
        rightFoot: string
    ): Set<string> {
        const path: Set<string> = new Set(['root']);
        const h = root.find(hip);
        if (!h) {
            throw new Error('Hip bone not found');
        }
        for (const b of h) {
            if (b.canLeadTo(leftHand) || b.canLeadTo(rightHand) || b.canLeadTo(leftFoot) || b.canLeadTo(rightFoot)) {
                path.add(b.name);
            }
        }
        return path;
    }

    private _solveUpperBodyForward(
        root: Bone,
        targets: FullBodyIKTargets,
        worlds: Map<string, XYZValue>,
        boneShouldVisit: Set<string>,
    ): Map<string, XYZValue> {
        const forward: Map<string, PointGroup> = new Map();
        this._saveAddPoint(forward, 'hand_l', targets.leftHand);
        this._saveAddPoint(forward, 'hand_r', targets.rightHand);
        const queue: Bone[] = [];
        const visited: Set<string> = new Set();
        queue.push(root.find('hand_l')!);
        queue.push(root.find('hand_r')!);
        let current: Bone | undefined = queue.shift();
        while (current) {
            if (!current.parent || current.name === 'pelvis') { // skip root or pelvis
                visited.add(current.name);
                current = queue.shift();
                continue;
            }
            if (visited.has(current.name)) { // skip visited
                current = queue.shift();
                continue;
            }
            // if one of the children should visit but not visited, push
            // current back to the queue and continue
            let allChildrenVisited = true;
            for (const child of current.children) {
                if (boneShouldVisit.has(child.name) && !visited.has(child.name)) {
                    allChildrenVisited = false;
                    break;
                }
            }
            if (!allChildrenVisited) {
                queue.push(current);
                current = queue.shift();
                continue;
            }

            visited.add(current!.name);
            // forward process
            const child = forward.get(current.name)!;
            const parent = worlds.get(current.parent.name)!;
            const length = current.pos.length();
            const newWorld = moveXYZAlone(child.centroid, parent, length);
            this._saveAddPoint(forward, current.parent.name, newWorld);
            queue.push(current.parent);
            current = queue.shift();
        }
        return this._mapPointGroupToMapXYZValue(forward);
    }

    private _solveLowerBodyForward(
        root: Bone,
        hipUpperResolved: XYZValue,
        targets: FullBodyIKTargets,
        worlds: Map<string, XYZValue>,
        boneShouldVisit: Set<string>,
    ): Map<string, XYZValue> {
        const forward: Map<string, PointGroup> = new Map();
        this._saveAddPoint(forward, 'foot_l', targets.leftFoot);
        this._saveAddPoint(forward, 'foot_r', targets.rightFoot);
        const queue: Bone[] = [];
        const visited: Set<string> = new Set();
        queue.push(root.find('foot_l')!);
        queue.push(root.find('foot_r')!);
        let current: Bone | undefined = queue.shift();
        while (current) {
            if (!current.parent || current.name === 'pelvis') { // skip root or pelvis
                visited.add(current.name);
                current = queue.shift();
                continue;
            }
            if (visited.has(current.name)) { // skip visited
                current = queue.shift();
                continue;
            }
            // if one of the children should visit but not visited, push
            // current back to the queue and continue
            let allChildrenVisited = true;
            for (const child of current.children) {
                if (boneShouldVisit.has(child.name) && !visited.has(child.name)) {
                    allChildrenVisited = false;
                    break;
                }
            }
            if (!allChildrenVisited) {
                queue.push(current);
                current = queue.shift();
                continue;
            }

            visited.add(current!.name);
            // forward process
            const child = forward.get(current.name)!;
            let parent = worlds.get(current.parent.name)!;
            if (current.parent.name === 'pelvis') {
                parent = hipUpperResolved;
            }
            const length = current.pos.length();
            const newWorld = moveXYZAlone(child.centroid, parent, length);
            this._saveAddPoint(forward, current.parent.name, newWorld);
            queue.push(current.parent);
            current = queue.shift();
        }
        return this._mapPointGroupToMapXYZValue(forward);
    }

    private _saveAddPoint(m: Map<string, PointGroup>, name: string, point: XYZValue): void {
        if (!m.has(name)) {
            m.set(name, new PointGroup());
        }
        m.get(name)!.addPoint(point);
    }

    private _mapPointGroupToMapXYZValue(m: Map<string, PointGroup>): Map<string, XYZValue> {
        const result: Map<string, XYZValue> = new Map();
        for (const [k, v] of m) {
            result.set(k, v.centroid);
        }
        return result;
    }
}

export default FullBodyFABRIK;
export type {
    FullBodyIKTargets,
}