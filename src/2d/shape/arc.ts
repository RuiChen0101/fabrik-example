import { Point } from '../value/point';

type ArcProp = {
    pos: Point;
    color?: string;
    radius: number;
    startAngle: number;
    endAngle: number;
    borderWidth?: number;
    borderColor?: string;
}

const drawArc = (_canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, prop: ArcProp): void => {
    context.beginPath();
    context.fillStyle = prop.color ?? "transparent";
    context.strokeStyle = prop.borderColor ?? "#000";
    context.lineWidth = prop.borderWidth ?? 0;
    context.arc(prop.pos.x, prop.pos.y, prop.radius, prop.startAngle * (Math.PI / 180), prop.endAngle * (Math.PI / 180));
    context.fill();
    context.stroke();
    context.closePath();
}

export { drawArc };