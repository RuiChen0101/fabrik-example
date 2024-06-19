import Bone from './items/bone';
import Target from './items/target';
import { Range } from './value/range';
import MultiEndFABRIK from './fabrik/multi-end-fabrik';
import { Component, ReactNode, createRef } from 'react';
import { drawGridBackground } from './shape/grid-background';

import './MultiEnd.scss';

import MultiRangeSlider from '../component/multi-range-slider/MultiRangeSlider';

interface MultiEndState {
    fabrikIteration: number;
    isAngleLimitEnabled: boolean;
}

class MultiEnd extends Component<any, MultiEndState> {
    private _canvasRef = createRef<HTMLCanvasElement>();
    private _ticker: any;

    private _root?: Bone;
    private _bone1?: Bone;
    private _bone2?: Bone;
    private _bone3?: Bone;
    private _bone4?: Bone;
    private _bone5?: Bone;
    private _bone6?: Bone;
    private _bone7?: Bone;
    private _bone8?: Bone;

    private _target1?: Target;
    private _target2?: Target;

    private _fabrik = new MultiEndFABRIK();

    constructor(props: any) {
        super(props);
        this.state = {
            fabrikIteration: 0,
            isAngleLimitEnabled: false
        };
    }

    componentDidMount(): void {
        const [canvas, _] = this._getCanvas();
        this._setCanvasSize();
        this._root = new Bone('root', { x: window.innerWidth / 2, y: window.innerHeight / 2 }, 0);
        this._bone1 = new Bone('bone1', { x: 100, y: 0 }, 0);
        this._bone2 = new Bone('bone2', { x: 100, y: 0 }, 0);
        this._bone3 = new Bone('bone3', { x: 75, y: 75 }, 0);
        this._bone4 = new Bone('bone4', { x: 100, y: 0 }, 0);
        this._bone5 = new Bone('bone5', { x: 100, y: 0 }, 0);
        this._bone6 = new Bone('bone6', { x: 75, y: -75 }, 0);
        this._bone7 = new Bone('bone7', { x: 100, y: 0 }, 0);
        this._bone8 = new Bone('bone8', { x: 100, y: 0 }, 0);
        this._bone7.addChild(this._bone8);
        this._bone6.addChild(this._bone7);
        this._bone2.addChild(this._bone6);
        this._bone4.addChild(this._bone5);
        this._bone3.addChild(this._bone4);
        this._bone2.addChild(this._bone3);
        this._bone1.addChild(this._bone2);
        this._root.addChild(this._bone1);
        this._target1 = new Target(this._bone5.world[0], 'bone5');
        this._target2 = new Target(this._bone8.world[0], 'bone8');
        this._ticker = setInterval(this._draw, 1000 / 60);
        canvas.addEventListener('mousedown', this._onMouseDown);
    }

    componentWillUnmount(): void {
        const [canvas, _] = this._getCanvas();
        clearInterval(this._ticker);
        canvas.removeEventListener('mousedown', this._onMouseDown);
    }

    private _getCanvas = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
        const canvas = this._canvasRef.current!;
        const context = canvas.getContext('2d')!;
        return [canvas, context];
    }

    private _setCanvasSize = (): void => {
        const [canvas, context] = this._getCanvas();
        const storedTransform = context.getTransform();
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        context.setTransform(storedTransform);
    }

    private _draw = (): void => {
        const [canvas, context] = this._getCanvas();
        const storedTransform = context.getTransform();
        canvas.width = canvas.width;
        context.setTransform(storedTransform);
        drawGridBackground(canvas, context);

        if (this._root) {
            this._root.draw(canvas, context, this.state.isAngleLimitEnabled);
        }
        if (this._target1) {
            this._target1.draw(canvas, context);
        }
        if (this._target2) {
            this._target2.draw(canvas, context);
        }
    }

    private _onMouseDown = (event: MouseEvent): void => {
        const [canvas, _] = this._getCanvas();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (this._target1!.checkHit({ x: x, y: y })) {
            this._target1!.pressed = true;
            canvas.addEventListener('mousemove', this._onMouseMove);
            canvas.addEventListener('mouseup', this._onMouseUp);
            canvas.addEventListener('mouseout', this._onMouseUp);
        } else if (this._target2!.checkHit({ x: x, y: y })) {
            this._target2!.pressed = true;
            canvas.addEventListener('mousemove', this._onMouseMove);
            canvas.addEventListener('mouseup', this._onMouseUp);
            canvas.addEventListener('mouseout', this._onMouseUp);
        }
    }

    private _onMouseMove = (event: MouseEvent): void => {
        const [canvas, _] = this._getCanvas();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (this._target1!.pressed) {
            this._target1!.pos = { x: x, y: y };
        } else if (this._target2!.pressed) {
            this._target2!.pos = { x: x, y: y };
        }
        if (this._root && this._target1 && this._target2) {
            const iteration = this._fabrik.resolve(this._root, [this._target1, this._target2], this.state.isAngleLimitEnabled);
            this.setState({ fabrikIteration: iteration });
        }
    }

    private _onMouseUp = (): void => {
        const [canvas, _] = this._getCanvas();
        this._target1!.pressed = false;
        this._target2!.pressed = false;
        canvas.removeEventListener('mousemove', this._onMouseMove);
        canvas.removeEventListener('mouseup', this._onMouseUp);
        canvas.removeEventListener('mouseout', this._onMouseUp);
    }

    private _setAngleLimit = (value: Range, bone: string): void => {
        switch (bone) {
            case "root":
                this._root!.angleLimit = value;
                break;
            case "bone1":
                this._bone1!.angleLimit = value;
                break;
            case "bone2":
                this._bone2!.angleLimit = value;
                break;
            case "bone3":
                this._bone3!.angleLimit = value;
                break;
            case "bone4":
                this._bone4!.angleLimit = value;
                break;
            case "bone6":
                this._bone6!.angleLimit = value;
                break;
            case "bone7":
                this._bone7!.angleLimit = value;
                break;
        }
        if (this._root && this._target1 && this._target2) {
            const iteration = this._fabrik.resolve(this._root, [this._target1, this._target2], this.state.isAngleLimitEnabled);
            this.setState({ fabrikIteration: iteration });
        }
    }

    render(): ReactNode {
        return (
            <div className="multi-end">
                <div className="overlay">
                    <div className="overlay-area">
                        <span className="iteration">iteration: {this.state.fabrikIteration}</span>
                        <div className="angle-limit-enable">
                            <input id="limit-enable" type="checkbox" checked={this.state.isAngleLimitEnabled} onChange={(e) => {
                                this.setState({ isAngleLimitEnabled: e.target.checked });
                            }} />
                            <label htmlFor="limit-enable">Set Angle Limit</label>
                        </div>
                        <div className="angle-limit">
                            <span>root</span>
                            <MultiRangeSlider
                                className="slider"
                                min={-180}
                                max={180}
                                onChange={(value) => this._setAngleLimit(value, "root")}
                            />
                        </div>
                        <div className="angle-limit" style={{
                            marginTop: "32px"
                        }}>
                            <span>bone1</span>
                            <MultiRangeSlider
                                className="slider"
                                min={-180}
                                max={180}
                                onChange={(value) => this._setAngleLimit(value, "bone1")}
                            />
                        </div>
                        <div className="angle-limit" style={{
                            marginTop: "32px"
                        }}>
                            <span>bone2</span>
                            <MultiRangeSlider
                                className="slider"
                                min={-180}
                                max={180}
                                onChange={(value) => this._setAngleLimit(value, "bone2")}
                            />
                        </div>
                        <div className="angle-limit" style={{
                            marginTop: "32px"
                        }}>
                            <span>bone3</span>
                            <MultiRangeSlider
                                className="slider"
                                min={-180}
                                max={180}
                                onChange={(value) => this._setAngleLimit(value, "bone3")}
                            />
                        </div>
                        <div className="angle-limit" style={{
                            marginTop: "32px"
                        }}>
                            <span>bone4</span>
                            <MultiRangeSlider
                                className="slider"
                                min={-180}
                                max={180}
                                onChange={(value) => this._setAngleLimit(value, "bone4")}
                            />
                        </div>
                        <div className="angle-limit" style={{
                            marginTop: "32px"
                        }}>
                            <span>bone6</span>
                            <MultiRangeSlider
                                className="slider"
                                min={-180}
                                max={180}
                                onChange={(value) => this._setAngleLimit(value, "bone6")}
                            />
                        </div>
                        <div className="angle-limit" style={{
                            marginTop: "32px"
                        }}>
                            <span>bone7</span>
                            <MultiRangeSlider
                                className="slider"
                                min={-180}
                                max={180}
                                onChange={(value) => this._setAngleLimit(value, "bone7")}
                            />
                        </div>
                    </div>
                </div>
                <canvas id="canvas" ref={this._canvasRef} />
            </div>
        )
    }
}

export default MultiEnd;