import Camera from './Camera';
import XYZValue from './value/xyz_value';
import { Canvas } from '@react-three/fiber';
import { Component, ReactNode } from 'react';
import FullBodyFABRIK from './fabrik/full-body-fabrik';

import './FullBody.scss';

import TargetVisualizer from './visualizer/TargetVisualizer';
import BoneVisualizerFunc from './visualizer/BoneVisualizer';
import Character, { importTemplate } from './character/character';

interface FullBodyState {
    isLoading: boolean;
    cameraEnabled: boolean;
    fabrikIteration: number;
    char: Character;
}

class FullBody extends Component<any, FullBodyState> {

    private _fabrik: FullBodyFABRIK = new FullBodyFABRIK();

    private _targetLH: XYZValue = new XYZValue(0, 0, 0);
    private _targetRH: XYZValue = new XYZValue(0, 0, 0);
    private _targetLF: XYZValue = new XYZValue(0, 0, 0);
    private _targetRF: XYZValue = new XYZValue(0, 0, 0);

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            cameraEnabled: true,
            fabrikIteration: 0,
            char: importTemplate(),
        }
    }

    componentDidMount(): void {
        this._targetLH = this.state.char.find('hand_l')!.world[0];
        this._targetRH = this.state.char.find('hand_r')!.world[0];
        this._targetLF = this.state.char.find('foot_l')!.world[0];
        this._targetRF = this.state.char.find('foot_r')!.world[0];
        this.setState({
            isLoading: false
        });
    }

    private _onTargetLHMove = (pos: XYZValue): void => {
        this._targetLH = pos;
        this._resolve();
    }

    private _onTargetRHMove = (pos: XYZValue): void => {
        this._targetRH = pos;
        this._resolve();
    }

    private _onTargetLFMove = (pos: XYZValue): void => {
        this._targetLF = pos;
        this._resolve();
    }

    private _onTargetRFMove = (pos: XYZValue): void => {
        this._targetRF = pos;
        this._resolve();
    }

    private _resolve = (): void => {
        const targets = {
            leftHand: this._targetLH,
            rightHand: this._targetRH,
            leftFoot: this._targetLF,
            rightFoot: this._targetRF,
        };
        const char = this.state.char;
        const iteration = this._fabrik.resolve(char, targets);
        this.setState({
            fabrikIteration: iteration,
            char: char,
        });
    }

    render(): ReactNode {
        if (this.state.isLoading) {
            return <div>Loading...</div>;
        }
        return (
            <div className="full-body">
                <div className="overlay">
                    <div className="overlay-area">
                        <span className="iteration">iteration: {this.state.fabrikIteration}</span>
                    </div>
                </div>
                <div className="canvas">
                    <Canvas>
                        <Camera disabled={!this.state.cameraEnabled} pos={new XYZValue(0, 150, 150)} />
                        <ambientLight color="#0f0f0f" intensity={1} />
                        <hemisphereLight color="#ffffff" groundColor="#0f0f0f" intensity={1} />
                        <gridHelper args={[10000, 1000]} />
                        <axesHelper args={[100]} />
                        {/* <CharacterVisualizer char={this.state.char} /> */}
                        <BoneVisualizerFunc root={this.state.char.root} nodeSize={0.5} stickSize={0.3} />
                        <TargetVisualizer
                            initPos={this._targetLH}
                            size={2}
                            onTargetMove={this._onTargetLHMove}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={() => this.setState({ cameraEnabled: true })}
                        />
                        <TargetVisualizer
                            initPos={this._targetRH}
                            size={2}
                            onTargetMove={this._onTargetRHMove}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={() => this.setState({ cameraEnabled: true })}
                        />
                        <TargetVisualizer
                            initPos={this._targetLF}
                            size={2}
                            onTargetMove={this._onTargetLFMove}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={() => this.setState({ cameraEnabled: true })}
                        />
                        <TargetVisualizer
                            initPos={this._targetRF}
                            size={2}
                            onTargetMove={this._onTargetRFMove}
                            onDragStart={() => this.setState({ cameraEnabled: false })}
                            onDragEnd={() => this.setState({ cameraEnabled: true })}
                        />
                    </Canvas>
                </div>
            </div>
        )
    }
}

export default FullBody;