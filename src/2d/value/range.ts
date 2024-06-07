interface Range {
    min: number;
    max: number;
}

const clampRange = (value: number, range: Range): number => {
    return Math.min(Math.max(range.min, value), range.max);
}

export type { Range };
export {
    clampRange
}