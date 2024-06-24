import Camera from './Camera';
import Bone from './character/bone';
import XYZValue from './value/xyz_value';
import { Canvas } from '@react-three/fiber';
import { Component, ReactNode } from 'react';
import SingleEndFABRIK from './fabrik/single-end-fabrik';

import './SingleEnd.scss';

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
        this.setState({
            root: root,
            isLoading: false
        });
    }

    private _onTargetMove = (pos: XYZValue): void => {
        this._pos = pos;
        const root = this.state.root;
        const iteration = this._fabrik.resolve(root, this._pos, 'bone3');
        this.setState({
            root: root,
            fabrikIteration: iteration
        });
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
                        <BoneVisualizer root={this.state.root} />
                        <TargetVisualizer
                            initPos={this._pos}
                            onTargetMove={this._onTargetMove}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={() => this.setState({ cameraEnabled: true })}
                        />
                    </Canvas>
                </div>
            </div>
        )
    }
}

export default SingleEnd;