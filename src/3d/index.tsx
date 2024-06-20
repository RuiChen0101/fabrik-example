import { Outlet } from 'react-router-dom';
import { Component, ReactNode } from 'react';

import './index.scss';

interface ThreeDimensionState { }

class ThreeDimension extends Component<any, ThreeDimensionState> {
    render(): ReactNode {
        return (
            <div className="three-dimension">
                <Outlet />
            </div>
        )
    }
}

export default ThreeDimension;