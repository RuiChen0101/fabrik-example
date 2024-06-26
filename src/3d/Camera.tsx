import { CameraControls } from '@react-three/drei';
import { Component, createRef, ReactNode } from 'react';
import XYZValue from './value/xyz_value';

interface CameraProps {
    disabled?: boolean;
    pos?: XYZValue;
    lookAt?: XYZValue;
}

class Camera extends Component<CameraProps> {
    private _cameraRef = createRef<CameraControls>();

    componentDidMount() {
        if (!this._cameraRef.current) return;
        const pos = this.props.pos || new XYZValue(0, 250, 350);
        const lookAt = this.props.lookAt || new XYZValue(0, 100, 0);
        this._cameraRef.current.setLookAt(pos.x, pos.y, pos.z, lookAt.x, lookAt.y, lookAt.z, false);
    }

    render(): ReactNode {
        return (
            <CameraControls
                ref={this._cameraRef}
                enabled={!this.props.disabled}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 1.75}
            />
        );
    }
}

export default Camera;