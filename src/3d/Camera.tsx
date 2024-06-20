import { CameraControls } from '@react-three/drei';
import { Component, createRef, ReactNode } from 'react';

interface CameraProps {
    disabled?: boolean;
}

class Camera extends Component<CameraProps> {
    private _cameraRef = createRef<CameraControls>();

    componentDidMount() {
        if (!this._cameraRef.current) return;
        this._cameraRef.current.setLookAt(0, 250, 350, 0, 100, 0, false);
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