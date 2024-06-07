import { ORIGIN, Point } from '../value/point';

type TextProp = {
    width?: number;
    pos?: Point;
    text?: string;
    fontSize?: number;
    lineHeight?: number;
    vAlign?: 'top' | 'middle' | 'bottom';
    hAlign?: 'center' | 'start' | 'end';
    fontFamily?: string;
    color?: string;
}

const drawText = (_canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, prop: TextProp): void => {
    const width = prop?.width;
    const pos = prop?.pos ?? ORIGIN;
    const text = prop?.text ?? "";
    const fontFamily = prop?.fontFamily ?? "serif";
    const fontSize = prop?.fontSize ?? 16;
    const lineHeight = prop?.lineHeight ?? 1.2;
    const vAlign = prop?.vAlign ?? 'top';
    const hAlign = prop?.hAlign ?? 'start';
    const color = prop?.color ?? "#000";

    const lineCount = (text.match(/\n/g) ?? []).length + 1;
    const textHeight = fontSize + (fontSize * lineHeight * (lineCount - 1));

    context.beginPath();
    context.fillStyle = color;
    context.font = `${fontSize}px ${fontFamily}`;
    context.textAlign = hAlign;
    context.textBaseline = vAlign;
    let topStart = pos.y;
    if (vAlign === 'middle') {
        topStart = topStart - (textHeight / 2) + (fontSize * lineHeight / 2);
    }
    const lines = text.split(/\n/g);
    const height = lineHeight * fontSize
    context.fillText(lines[0], pos.x, topStart, width);
    for (let i = 1; i < lines.length; i++) {
        context.fillText(lines[i], pos.x, topStart + (height * i), width);
    }
    context.closePath();
}

export { drawText };