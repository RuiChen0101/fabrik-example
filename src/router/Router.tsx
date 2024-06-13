import { Component, ReactNode, lazy } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { withSuspense } from '../wrapper/WithSuspense';

import TwoDimension from '../2d/index';

const SingleEnd2D = withSuspense(lazy(() => import('../2d/SingleEnd')));
const MultiEnd2D = withSuspense(lazy(() => import('../2d/MultiEnd')));


class Router extends Component {
    render(): ReactNode {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="2d" element={<TwoDimension />}>
                        <Route path="single-end" element={<SingleEnd2D />} />
                        <Route path="multi-end" element={<MultiEnd2D />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        );
    }
}

export default Router;