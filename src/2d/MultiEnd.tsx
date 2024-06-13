import Target from './items/target';
import Bone from './items/bone';
import { Component, ReactNode, createRef } from 'react';
import { drawGridBackground } from './shape/grid-background';

import './MultiEnd.scss';
import FABRIK from './fabrik/fabrik';

interface MultiEndState {
    fabrikIteration: number;
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

    private _fabrik = new FABRIK();

    constructor(props: any) {
        super(props);
        this.state = {
            fabrikIteration: 0,
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
            this._root.draw(canvas, context, false);
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
            const iteration = this._fabrik.resolve(this._root, [this._target1, this._target2], false);
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

    render(): ReactNode {
        return (
            <div className="multi-end">
                <div className="overlay">
                    <div className="overlay-area">
                        <span className="iteration">iteration: {this.state.fabrikIteration}</span>
                    </div>
                </div>
                <canvas id="canvas" ref={this._canvasRef} />
            </div>
        )
    }
}

export default MultiEnd;