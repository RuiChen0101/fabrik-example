import { Component, ReactNode, lazy } from 'react';
import { Routes, Route, BrowserRouter, HashRouter } from 'react-router-dom';

import { withSuspense } from '../wrapper/WithSuspense';

import TwoDimension from '../2d/index';

const SingleEnd2D = withSuspense(lazy(() => import('../2d/SingleEnd')));
const MultiEnd2D = withSuspense(lazy(() => import('../2d/MultiEnd')));

import ThreeDimension from '../3d/index';

const SingleEnd3D = withSuspense(lazy(() => import('../3d/SingleEnd')));
const MultiEnd3D = withSuspense(lazy(() => import('../3d/MultiEnd')));
const FullBody = withSuspense(lazy(() => import('../3d/FullBody')));

class Router extends Component {
    render(): ReactNode {
        return (
            <HashRouter>
                <Routes>
                    <Route path="2d" element={<TwoDimension />}>
                        <Route path="single-end" element={<SingleEnd2D />} />
                        <Route path="multi-end" element={<MultiEnd2D />} />
                    </Route>
                    <Route path="3d" element={<ThreeDimension />}>
                        <Route path="single-end" element={<SingleEnd3D />} />
                        <Route path="multi-end" element={<MultiEnd3D />} />
                        <Route path="full-body" element={<FullBody />} />
                    </Route>
                </Routes>
            </HashRouter>
        );
    }
}

export default Router;