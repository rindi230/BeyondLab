import { Box } from '@react-three/drei';

export const ChemistryLab = () => {
    console.log("ChemistryLab: Minimal Render Test");
    return (
        <group>
            <Box position={[0, 0, 0]} args={[2, 2, 2]}>
                <meshStandardMaterial color="red" />
            </Box>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
        </group>
    );
};

export default ChemistryLab;