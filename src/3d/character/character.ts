import Bone from './bone';
import XYZValue from '../value/xyz_value';

class Character {
    private _root: Bone;

    public get root(): Bone {
        return this._root;
    }

    public set root(b: Bone) {
        this._root = b;
    }

    constructor(root: Bone) {
        this._root = root;
    }

    // in-order traversal
    *[Symbol.iterator](): Generator<Bone> {
        yield* this._root;
    }

    public copy(): Character {
        return new Character(this._root.copy());
    }

    public find(name: string): Bone | undefined {
        return this._root.find(name);
    }
}

import templateJson from '../../assets/template.json';

const importTemplate = (): Character => {
    const bone = parseBoneFromJson(templateJson['root']);
    bone.rotation.x = -90;
    return new Character(bone);
}

const parseBoneFromJson = (json: any): Bone => {
    const pos = new XYZValue(json['base']['tx'], json['base']['ty'], json['base']['tz']);
    const rot = new XYZValue(json['base']['rx'], json['base']['ry'], json['base']['rz']);
    const bone = new Bone(json['name'], pos, rot);

    for (const child of json['children']) {
        bone.addChild(parseBoneFromJson(child));
    }

    return bone;
}

export default Character;
export {
    importTemplate
}