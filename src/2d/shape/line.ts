import { Point } from '../value/point';

type LineProp = {
    start: Point;
    end: Point;
    color?: string;
    width?: number;
}

const drawLine = (_canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, prop: LineProp): void => {
    context.beginPath();
    context.strokeStyle = prop.color ?? "#000";
    context.lineWidth = prop.width ?? 0;
    context.moveTo(prop.start.x, prop.start.y);
    context.lineTo(prop.end.x, prop.end.y);
    context.stroke();
    context.closePath();
}

export { drawLine };