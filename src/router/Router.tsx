import { Component, ReactNode } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { withSuspense } from '../wrapper/WithSuspense';

import TwoDimension from '../2d/index';


class Router extends Component {
    render(): ReactNode {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<TwoDimension />} />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default Router;