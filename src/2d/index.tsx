import { Outlet } from 'react-router-dom';
import { Component, ReactNode } from 'react';

import './index.scss';

interface TwoDimensionState { }

class TwoDimension extends Component<any, TwoDimensionState> {
    render(): ReactNode {
        return (
            <div className="two-dimension">
                <Outlet />
            </div>
        )
    }
}

export default TwoDimension;