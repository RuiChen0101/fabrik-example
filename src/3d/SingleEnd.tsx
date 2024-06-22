import Camera from './Camera';
import Bone from './character/bone';
import XYZValue from './value/xyz_value';
import { Canvas } from '@react-three/fiber';
import { Component, ReactNode } from 'react';
import SingleEndFABRIK from './fabrik/single-end-fabrik';
import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

import './SingleEnd.scss';

import Vis from './visualizer/Vis';
import BoneVisualizer from './visualizer/BoneVisualizer';
import TargetVisualizer from './visualizer/TargetVisualizer';

interface SingleEndState {
    isLoading: boolean;
    cameraEnabled: boolean;
    fabrikIteration: number;
    root: Bone;
}

class SingleEnd extends Component<any, SingleEndState> {

    private _fabrik: SingleEndFABRIK = new SingleEndFABRIK();

    private _forward: Map<string, Mesh> = new Map();

    private _pos: XYZValue = new XYZValue(0, 0, 0);

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            cameraEnabled: true,
            fabrikIteration: 0,
            root: new Bone('root', new XYZValue(0, 0, 0), new XYZValue(0, 0, 0))
        }
    }

    componentDidMount(): void {
        const bone1 = new Bone('bone1', new XYZValue(0, 100, 0), new XYZValue(0, 0, 0));
        const bone2 = new Bone('bone2', new XYZValue(0, 100, 0), new XYZValue(0, 0, 0));
        const bone3 = new Bone('bone3', new XYZValue(0, 100, 0), new XYZValue(0, 0, 0));
        bone2.addChild(bone3);
        bone1.addChild(bone2);
        const root = this.state.root;
        root.addChild(bone1);
        this._pos = bone3.world[0];
        this._createForward();
        this.setState({
            root: root,
            isLoading: false
        });
    }

    private _createForward = (): void => {
        for (const bone of this.state.root) {
            const mesh = new Mesh();
            mesh.geometry = new SphereGeometry(10)
            mesh.material = new MeshStandardMaterial({ color: 0x0000ff })
            const world = bone.world[0];
            mesh.position.set(world.x, world.y, world.z);
            this._forward.set(bone.name, mesh);
        }
    }

    private _onTargetMove = (pos: XYZValue): void => {
        this._pos = pos;
    }

    private _onDragEnd = (): void => {
        const root = this.state.root;
        const [iteration, forward] = this._fabrik.resolve(root, this._pos, 'bone3');
        this.setState({
            root: root,
            fabrikIteration: iteration,
            cameraEnabled: true
        });
        for (const [name, mesh] of this._forward) {
            const world = forward.get(name)!;
            mesh.position.set(world.x, world.y, world.z);
        }
    }

    render(): ReactNode {
        if (this.state.isLoading) {
            return <div>Loading...</div>;
        }
        return (
            <div className="single-end">
                <div className="overlay">
                    <div className="overlay-area">
                        <span className="iteration">iteration: {this.state.fabrikIteration}</span>
                    </div>
                </div>
                <div className="canvas">
                    <Canvas>
                        <Camera disabled={!this.state.cameraEnabled} />
                        <ambientLight color="#0f0f0f" intensity={1} />
                        <hemisphereLight color="#ffffff" groundColor="#0f0f0f" intensity={1} />
                        <gridHelper args={[10000, 1000]} />
                        <axesHelper args={[100]} />
                        <Vis mesh={this._forward} />
                        <BoneVisualizer root={this.state.root} />
                        <TargetVisualizer
                            initPos={this.state.root.find('bone3')?.world[0]}
                            onTargetMove={this._onTargetMove}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={this._onDragEnd}
                        />
                    </Canvas>
                </div>
            </div>
        )
    }
}

export default SingleEnd;