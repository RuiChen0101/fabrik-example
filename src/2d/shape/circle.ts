import { Point } from '../value/point';

type CircleProp = {
    pos: Point;
    color?: string;
    radius: number;
    borderWidth?: number;
    borderColor?: string;
}

const drawCircle = (_canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, prop: CircleProp): void => {
    context.beginPath();
    context.fillStyle = prop.color ?? "transparent";
    context.strokeStyle = prop.borderColor ?? "#000";
    context.lineWidth = prop.borderWidth ?? 0;
    context.arc(prop.pos.x, prop.pos.y, prop.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.closePath();
}

export { drawCircle };