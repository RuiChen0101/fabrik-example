import Camera from './Camera';
import Bone from './character/bone';
import XYZValue from './value/xyz_value';
import { Canvas } from '@react-three/fiber';
import { Component, ReactNode } from 'react';
import MultiEndFABRIK from './fabrik/multi-end-fabrik';

import './MultiEnd.scss';

import BoneVisualizer from './visualizer/BoneVisualizer';
import TargetVisualizer from './visualizer/TargetVisualizer';

interface MultiEndState {
    isLoading: boolean;
    cameraEnabled: boolean;
    fabrikIteration: number;
    root: Bone;
}

class MultiEnd extends Component<any, MultiEndState> {

    private _fabrik: MultiEndFABRIK = new MultiEndFABRIK();

    private _target1: XYZValue = new XYZValue(0, 0, 0);
    private _target2: XYZValue = new XYZValue(0, 0, 0);

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
        const bone1 = new Bone('bone1', new XYZValue(0, 60, 0), new XYZValue(0, 0, 0));
        const bone2 = new Bone('bone2', new XYZValue(0, 60, 0), new XYZValue(0, 0, 0));
        const bone3 = new Bone('bone3', new XYZValue(40, 40, 0), new XYZValue(0, 0, 0));
        const bone4 = new Bone('bone4', new XYZValue(0, 60, 0), new XYZValue(0, 0, 0));
        const bone5 = new Bone('bone5', new XYZValue(0, 60, 0), new XYZValue(0, 0, 0));
        const bone6 = new Bone('bone6', new XYZValue(-40, 40, 0), new XYZValue(0, 0, 0));
        const bone7 = new Bone('bone7', new XYZValue(0, 60, 0), new XYZValue(0, 0, 0));
        const bone8 = new Bone('bone8', new XYZValue(0, 60, 0), new XYZValue(0, 0, 0));
        bone7.addChild(bone8);
        bone6.addChild(bone7);
        bone4.addChild(bone5);
        bone3.addChild(bone4);
        bone2.addChild(bone6);
        bone2.addChild(bone3);
        bone1.addChild(bone2);
        const root = this.state.root;
        root.addChild(bone1);
        this._target1 = bone5.world[0];
        this._target2 = bone8.world[0];
        this.setState({
            root: root,
            isLoading: false
        });
    }

    private _onTarget1Move = (pos: XYZValue): void => {
        this._target1 = pos;
        const root = this.state.root;
        const iteration = this._fabrik.resolve(root, [this._target1, this._target2], ['bone5', 'bone8']);
        this.setState({
            root: root,
            fabrikIteration: iteration
        });
    }

    private _onTarget2Move = (pos: XYZValue): void => {
        this._target2 = pos;
        const root = this.state.root;
        const iteration = this._fabrik.resolve(root, [this._target1, this._target2], ['bone5', 'bone8']);
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
            <div className="multi-end">
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
                            initPos={this._target1}
                            onTargetMove={this._onTarget1Move}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={() => this.setState({ cameraEnabled: true })}
                        />
                        <TargetVisualizer
                            initPos={this._target2}
                            onTargetMove={this._onTarget2Move}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={() => this.setState({ cameraEnabled: true })}
                        />
                    </Canvas>
                </div>
            </div>
        )
    }
}

export default MultiEnd;