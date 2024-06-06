const drawGridBackground = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    const width = canvas.width;
    const height = canvas.height;
    for (var x = 0; x <= width; x += 40) {
        context.moveTo(0.5 + x, 0);
        context.lineTo(0.5 + x, height);
    }


    for (var x = 0; x <= height; x += 40) {
        context.moveTo(0, 0.5 + x);
        context.lineTo(width, 0.5 + x);
    }

    context.strokeStyle = "black";
    context.stroke();
}

export { drawGridBackground };