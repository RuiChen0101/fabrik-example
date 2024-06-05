import { Component, ReactNode } from 'react';
import SingleFactor from './SingleFactor';

import './index.scss';

interface TwoDimensionState { }

class TwoDimension extends Component<any, TwoDimensionState> {
    render(): ReactNode {
        return (
            <div className="two-dimension">
                <SingleFactor />
            </div>
        )
    }
}

export default TwoDimension;