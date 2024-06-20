import Bone from '../character/bone';
import { Component, ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { ConeGeometry, Mesh, MeshStandardMaterial, Scene, SphereGeometry, Vector3 } from 'three';

interface BoneVisualizerProps {
    scene: Scene;
    root: Bone;
}

class BoneVisualizer extends Component<BoneVisualizerProps> {
    private _joins: Map<string, Mesh> = new Map();
    private _segment: Map<string, Mesh> = new Map();

    public componentDidMount() {
        this._createMeshes();
    }

    public componentDidUpdate() {
        this._updateMeshes();
    }

    private _createMeshes() {
        for (const bone of this.props.root) {
            const join = new Mesh()
            join.geometry = new SphereGeometry(5)
            join.material = new MeshStandardMaterial({ color: 0xffff00 })

            const [world, _] = bone.world

            join.position.set(world.x, world.y, world.z)

            this.props.scene.add(join)
            this._joins.set(bone.name, join)

            if (bone.parent) {
                const segment = new Mesh()
                segment.geometry = new ConeGeometry(3, bone.length, 20)
                segment.material = new MeshStandardMaterial({ color: 0xffff00 })

                const [parentWorld, _] = bone.parent.world

                const start = new Vector3(parentWorld.x, parentWorld.y, parentWorld.z);
                const end = new Vector3(world.x, world.y, world.z);

                segment.geometry.rotateX(Math.PI / 2);
                segment.position.set(start.x, start.y, start.z);

                const direction = new Vector3().subVectors(end, start);
                segment.position.add(direction.multiplyScalar(0.5));
                segment.lookAt(end);

                this.props.scene.add(segment)
                this._segment.set(bone.name, segment)
            }
        }
    }

    private _updateMeshes() {
        for (const bone of this.props.root) {
            const mesh = this._joins.get(bone.name)
            if (!mesh) {
                throw new Error('Mesh not found')
            }

            const [world, _] = bone.world

            mesh.position.set(world.x, world.y, world.z)

            if (bone.parent) {
                const segment = this._segment.get(bone.name)
                if (!segment) {
                    throw new Error('Segment not found')
                }

                const [parentWorld, _] = bone.parent.world

                const start = new Vector3(parentWorld.x, parentWorld.y, parentWorld.z);
                const end = new Vector3(world.x, world.y, world.z);

                segment.position.set(start.x, start.y, start.z);

                const direction = new Vector3().subVectors(end, start);
                segment.position.add(direction.multiplyScalar(0.5));
                segment.lookAt(end);
            }
        }
    }

    render(): ReactNode {
        return null;
    }
}

export default function BoneVisualizerFunc(props: {
    root: Bone;
}) {
    const { scene } = useThree();

    return (
        <BoneVisualizer scene={scene} root={props.root} />
    )
};