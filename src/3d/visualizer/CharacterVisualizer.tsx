import { Component } from 'react';
import { useFBX } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import Character from '../character/character';
import { Group, Object3DEventMap, Scene, SkeletonHelper } from 'three';

interface CharacterVisualizerProps {
    fbx: Group<Object3DEventMap>;
    scene: Scene;
    char: Character;
}

class CharacterVisualizer extends Component<CharacterVisualizerProps> {
    private _fbx: Group<Object3DEventMap>;

    constructor(props: CharacterVisualizerProps) {
        super(props);
        this._fbx = props.fbx;
    }

    componentDidMount(): void {
        const helper = new SkeletonHelper(this._fbx);
        this.props.scene.add(helper);
        this._applyAnimation();
    }

    componentDidUpdate(prevProps: Readonly<CharacterVisualizerProps>, _prevState: Readonly<any>, _snapshot?: any): void {
        if (prevProps.char !== this.props.char) {
            this._applyAnimation();
        }
    }

    private _applyAnimation = () => {
        const root = this._fbx.getObjectByName('root');
        if (!root) return;
        root.traverse((obj) => {
            const bone = this.props.char.find(obj.name);
            if (!bone) throw new Error(`Bone with name ${obj.name} not found`);
            console.log(obj.rotation, bone.rotation);
            obj.rotation.set(bone.rotation.x, bone.rotation.y, bone.rotation.z, 'ZYX');
        });
    }

    render() {
        return (
            <primitive key="default" object={this._fbx} />
        )
    }
}

export default function CharacterVisualizerFunc(props: {
    char: Character;
}) {
    const fbx = useFBX('/body.fbx');
    const { scene } = useThree();

    return (
        <CharacterVisualizer fbx={fbx} scene={scene} {...props} />
    )
};