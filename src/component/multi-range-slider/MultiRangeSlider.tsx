// Source: https://codesandbox.io/p/sandbox/multi-range-slider-react-js-6rzv0f?file=%2Fsrc%2Fcomponent%2FmultiRangeSlider%2FMultiRangeSlider.js%3A1%2C1-89%2C1

import { useCallback, useEffect, useState, useRef } from "react";
import "./MultiRangeSlider.css";

interface MultiRangeSliderProps {
    className?: string;
    min: number;
    max: number;
    onChange: (value: { min: number; max: number }) => void;
}

const MultiRangeSlider = (prop: MultiRangeSliderProps) => {
    const [minVal, setMinVal] = useState(prop.min);
    const [maxVal, setMaxVal] = useState(prop.max);
    const minValRef = useRef(prop.min);
    const maxValRef = useRef(prop.max);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = useCallback(
        (value: number) => Math.round(((value - prop.min) / (prop.max - prop.min)) * 100),
        [prop.min, prop.max]
    );

    // Set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    // Get min and max values when their state changes
    useEffect(() => {
        prop.onChange({ min: minVal, max: maxVal });
    }, [minVal, maxVal]);

    return (
        <div className={`container ${prop.className ?? ""}`}>
            <input
                type="range"
                min={prop.min}
                max={prop.max}
                value={minVal}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - 1);
                    setMinVal(value);
                    minValRef.current = value;
                }}
                className="thumb thumb--left"
                style={{ zIndex: minVal > prop.max - 100 ? "5" : undefined }}
            />
            <input
                type="range"
                min={prop.min}
                max={prop.max}
                value={maxVal}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + 1);
                    setMaxVal(value);
                    maxValRef.current = value;
                }}
                className="thumb thumb--right"
            />

            <div className="slider">
                <div className="slider__track" />
                <div ref={range} className="slider__range" />
                <div className="slider__left-value">{minVal}</div>
                <div className="slider__right-value">{maxVal}</div>
            </div>
        </div>
    );
};

export default MultiRangeSlider;
