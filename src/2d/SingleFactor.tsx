import Target from './items/target';
import { Component, ReactNode, createRef } from 'react';
import SingleFactorBone from './items/single-factor-bone';
import SingleFactorFABRIK from './fabrik/single-factor-fabrik';

import './SingleFactor.scss';

interface SingleFactorState {
    fabrikIteration: number;
}

class SingleFactor extends Component<any, SingleFactorState> {
    private _canvasRef = createRef<HTMLCanvasElement>();
    private _ticker: any;

    private _root?: SingleFactorBone;
    private _target?: Target;

    private _fabrik = new SingleFactorFABRIK();

    constructor(props: any) {
        super(props);
        this.state = {
            fabrikIteration: 0
        };
    }

    componentDidMount(): void {
        const [canvas, _] = this._getCanvas();
        this._setCanvasSize();
        this._root = new SingleFactorBone({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 0);
        const bone1 = new SingleFactorBone({ x: 100, y: 0 }, 70);
        const bone2 = new SingleFactorBone({ x: 70, y: 25 }, 0);
        const bone3 = new SingleFactorBone({ x: 75, y: 0 }, 0);
        const bone4 = new SingleFactorBone({ x: 50, y: 50 }, 0);
        const bone5 = new SingleFactorBone({ x: 50, y: 100 }, 0);
        this._root.setChild(bone1);
        bone1.setChild(bone2);
        bone2.setChild(bone3);
        bone3.setChild(bone4);
        bone4.setChild(bone5);
        this._target = new Target(bone5.world[0]);
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

        if (this._root) {
            this._root.draw(canvas, context);
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
            if (this._root && this._target) {
                const iteration = this._fabrik.resolve(this._root, this._target.pos);
                this.setState({ fabrikIteration: iteration });
            }
        }
    }

    private _onMouseUp = (): void => {
        const [canvas, _] = this._getCanvas();
        this._target!.pressed = false;
        canvas.removeEventListener('mousemove', this._onMouseMove);
        canvas.removeEventListener('mouseup', this._onMouseUp);
        canvas.removeEventListener('mouseout', this._onMouseUp);
    }

    render(): ReactNode {
        return (
            <div className="single-factor">
                <div className="overlay">
                    <div className="overlay-area">
                        <span className={"iteration"}>iteration: {this.state.fabrikIteration}</span>
                    </div>
                </div>
                <canvas id="canvas" ref={this._canvasRef} />
            </div>
        );
    }
}

export default SingleFactor;