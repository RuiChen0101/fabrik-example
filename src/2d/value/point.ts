type Point = {
    x: number;
    y: number;
};

const ORIGIN = Object.freeze({ x: 0, y: 0 });

const diffPoints = (p1: Point, p2: Point): Point => {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

const addPoints = (p1: Point, p2: Point): Point => {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

const downScalePoint = (p1: Point, scale: number): Point => {
    return { x: p1.x / scale, y: p1.y / scale };
}

const upScalePoint = (p1: Point, scale: number): Point => {
    return { x: p1.x * scale, y: p1.y * scale };
}

const middlePoint = (p1: Point, p2: Point): Point => {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

const isParallel = (p1: Point, p2: Point): boolean => {
    return (p1.x * p2.y - p1.y * p2.x) === 0;
}

const isSameDirection = (p1: Point, p2: Point): boolean => {
    return (p1.x * p2.x + p1.y * p2.y) >= 0;
}

const rotatePoint = (p: Point, anchor: Point, degree: number): Point => {
    const angleRad = degree * (Math.PI / 180);

    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    const op = diffPoints(p, anchor);

    return {
        x: op.x * cosA - op.y * sinA + anchor.x,
        y: op.x * sinA + op.y * cosA + anchor.y
    }
}

const movePointAlone = (p1: Point, p2: Point, l: number): Point => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const d = Math.hypot(dx, dy);
    return { x: p1.x + (dx / d) * l, y: p1.y + (dy / d) * l };
}

const pointDistance = (p1: Point, p2: Point): number => {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

const pointAngle = (p1: Point, p2: Point): number => {
    if (p1.x === p2.x && p1.y === p2.y) {
        return 0;
    }
    let theta = ((p1.x * p2.x) + (p1.y * p2.y)) / (Math.hypot(p1.x, p1.y) * Math.hypot(p2.x, p2.y));
    theta = Math.min(Math.max(theta, -1), 1);
    const degree = (Math.acos(theta) * 180) / Math.PI;
    const angle = (p1.x * p2.y - p1.y * p2.x) >= 0 ? degree : -degree;
    return (angle + 360) % 360;
}

const pointLength = (p: Point): number => {
    return Math.sqrt(p.x * p.x + p.y * p.y);
}

export type {
    Point
}

export {
    ORIGIN,
    diffPoints,
    addPoints,
    downScalePoint,
    upScalePoint,
    middlePoint,
    isParallel,
    isSameDirection,
    rotatePoint,
    movePointAlone,
    pointDistance,
    pointAngle,
    pointLength
}