import XYZValue from '../value/xyz_value';
import { Component, ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { Camera, Mesh, MeshStandardMaterial, Scene, SphereGeometry, WebGLRenderer } from 'three';

interface TargetVisualizerProps {
    scene: Scene;
    camera: Camera;
    render: WebGLRenderer;
    initPos?: XYZValue;
    size: number;
    onTargetMove: (pos: XYZValue) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

class TargetVisualizer extends Component<TargetVisualizerProps> {
    private _mesh: Mesh;
    private _control: TransformControls;

    constructor(props: TargetVisualizerProps) {
        super(props);
        this._mesh = new Mesh();
        this._mesh.geometry = new SphereGeometry(this.props.size)
        this._mesh.material = new MeshStandardMaterial({ color: 0xff0000 })
        this._mesh.position.set(this.props.initPos?.x ?? 0, this.props.initPos?.y ?? 0, this.props.initPos?.z ?? 0);
        this.props.scene.add(this._mesh);
        this._control = new TransformControls(this.props.camera, this.props.render.domElement);
        this._control.attach(this._mesh);
        this._control.addEventListener('mouseDown', () => {
            if (this.props.onDragStart) {
                this.props.onDragStart();
            }
        });
        this._control.addEventListener('mouseUp', () => {
            if (this.props.onDragEnd) {
                this.props.onDragEnd();
            }
        });
        this._control.addEventListener('objectChange', () => {
            this.props.onTargetMove(new XYZValue(
                this._mesh.position.x,
                this._mesh.position.y,
                this._mesh.position.z
            ));
        });
        this.props.scene.add(this._control);
    }

    render(): ReactNode {
        return null;
    }
}

export default function TargetVisualizerFunc(props: {
    initPos?: XYZValue;
    size?: number;
    onTargetMove: (pos: XYZValue) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}) {
    const { scene, gl, camera } = useThree();

    return (
        <TargetVisualizer scene={scene} render={gl} camera={camera} size={props.size ?? 6} {...props} />
    )
}