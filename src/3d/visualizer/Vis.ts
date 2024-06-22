import { useThree } from '@react-three/fiber';
import { Mesh } from 'three';

export default function Vis(props: {
    mesh: Map<string, Mesh>,
}) {
    const { scene } = useThree();
    for (const [_, mesh] of props.mesh) {
        scene.add(mesh);
    }
    return null;
}