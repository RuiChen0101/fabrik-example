import { Component, ReactNode } from 'react';
import SingleEnd from './SingleEnd';

import './index.scss';

interface TwoDimensionState { }

class TwoDimension extends Component<any, TwoDimensionState> {
    render(): ReactNode {
        return (
            <div className="two-dimension">
                <SingleEnd />
            </div>
        )
    }
}

export default TwoDimension;