import Bone from './items/bone';
import Target from './items/target';
import { Range } from './value/range';
import { Component, ReactNode, createRef } from 'react';
import SingleEndFABRIK from './fabrik/single-end-fabrik';
import { drawGridBackground } from './shape/grid-background';

import './SingleEnd.scss';

import MultiRangeSlider from '../component/multi-range-slider/MultiRangeSlider';

interface SingleEndState {
    fabrikIteration: number;
    isAngleLimitEnabled: boolean;
}

class SingleEnd extends Component<any, SingleEndState> {
    private _canvasRef = createRef<HTMLCanvasElement>();
    private _ticker: any;

    private _root?: Bone;
    private _bone1?: Bone;
    private _bone2?: Bone;
    private _bone3?: Bone;

    private _target?: Target;

    private _fabrik = new SingleEndFABRIK();

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
        this._bone3 = new Bone('bone3', { x: 100, y: 0 }, 0);
        this._bone2.addChild(this._bone3);
        this._bone1.addChild(this._bone2);
        this._root.addChild(this._bone1);
        this._target = new Target(this._bone3.world[0], 'bone3');
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
        if (this._target) {
            this._target.draw(canvas, context);
        }
    }

    private _onMouseDown = (event: MouseEvent): void => {
        const [canvas, _] = this._getCanvas();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (this._target!.checkHit({ x: x, y: y })) {
            this._target!.pressed = true;
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
        if (this._target!.pressed) {
            this._target!.pos = { x: x, y: y };
        }
        if (this._root && this._target) {
            const iteration = this._fabrik.resolve(this._root, this._target, this.state.isAngleLimitEnabled);
            this.setState({ fabrikIteration: iteration });
        }
    }

    private _onMouseUp = (): void => {
        const [canvas, _] = this._getCanvas();
        this._target!.pressed = false;
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
        }
        if (this._root && this._target) {
            const iteration = this._fabrik.resolve(this._root, this._target, this.state.isAngleLimitEnabled);
            this.setState({ fabrikIteration: iteration });
        }
    }

    render(): ReactNode {
        return (
            <div className="single-end">
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
                    </div>
                </div>
                <canvas id="canvas" ref={this._canvasRef} />
            </div>
        );
    }
}

export default SingleEnd;