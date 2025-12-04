import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Cloud, Html } from '@react-three/drei';
import { Suspense, useState, useCallback, useRef } from 'react';
import type { GameState, Landmark } from '../utils/gameState';
import { createInitialGameState, getCurrentLandmark, advanceToNextLandmark, startGame, LANDMARKS, LANDMARK_NAMES } from '../utils/gameState';
import type { TriviaQuestion } from '../utils/triviaQuestions';
import { getRandomQuestion } from '../utils/triviaQuestions';
import QuestionPanel from './QuestionPanel';
import { VoxelCharacter } from './VoxelCharacter';
import { Yacht } from './landmarks/Yacht';
import { StatueOfLiberty } from './landmarks/StatueOfLiberty';
import { EiffelTower } from './landmarks/EiffelTower';
import { BurjKhalifa } from './landmarks/BurjKhalifa';
import { ISS } from './landmarks/ISS';
import { Moon } from './landmarks/Moon';
import { ContinuousTerrain } from './ContinuousTerrain';

// Fixed positions for landmarks along the X axis
const LANDMARK_POSITIONS: Record<Landmark, [number, number, number]> = {
    'yacht': [0, 0, 0],
    'statue-of-liberty': [100, 0, 0],
    'eiffel-tower': [300, 0, 0],
    'burj-khalifa': [550, 0, 0],
    'iss': [0, 200, 0],  // In space
    'moon': [150, 250, 0],  // In space
};

// Character offset from landmark position
const getCharacterOffset = (landmark: Landmark): [number, number, number] => {
    switch (landmark) {
        case 'yacht': return [-15, 8, 15];
        case 'statue-of-liberty': return [-20, 45, 15];
        case 'eiffel-tower': return [-25, 55, 15];
        case 'burj-khalifa': return [-20, 70, 15];
        case 'iss': return [-25, 10, 15];
        case 'moon': return [-15, 15, 15];
        default: return [-10, 10, 10];
    }
};

// Get label height for each landmark (relative to landmark position)
const getLandmarkLabelHeight = (landmark: Landmark): number => {
    switch (landmark) {
        case 'yacht': return 15;
        case 'statue-of-liberty': return 55;
        case 'eiffel-tower': return 80;
        case 'burj-khalifa': return 90;
        case 'iss': return 20;
        case 'moon': return 25;
        default: return 30;
    }
};

// Check if landmark is in space
const isSpaceLandmark = (landmark: Landmark): boolean => {
    return landmark === 'iss' || landmark === 'moon';
};

// Color palette for character customization
const COLOR_PALETTE = [
    { name: 'White', value: '#FFFFFF' },
    { name: 'Purple', value: '#7D00FF' },
    { name: 'Cyan', value: '#00FFFF' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Pink', value: '#FF69B4' },
    { name: 'Orange', value: '#FF6600' },
];

// Character configuration
interface CharacterConfig {
    headIndex: number;
    torsoIndex: number;
    legsIndex: number;
    headPrimaryColor: string;
    headSecondaryColor: string;
    torsoPrimaryColor: string;
    torsoSecondaryColor: string;
    legsPrimaryColor: string;
    legsSecondaryColor: string;
}

// MoonPay facts for each landmark
const MOONPAY_FACTS: Record<Landmark, string[]> = {
    'yacht': [
        'MoonPay was founded in 2019 in Miami by Ivan Soto-Wright',
        'Valued at $3.4 billion after Series A funding in 2021',
        'Processes billions of dollars in transactions annually'
    ],
    'statue-of-liberty': [
        'Available in 160+ countries worldwide',
        'Supports 80+ cryptocurrencies for purchase',
        'Processes over $2 billion in annual transactions'
    ],
    'eiffel-tower': [
        'Celebrity investors include Justin Bieber and Snoop Dogg',
        'Partners with OpenSea, Coinbase, and Bitcoin.com',
        'Powers crypto purchases for millions of users globally'
    ],
    'burj-khalifa': [
        'Offers instant crypto purchases with credit/debit cards',
        'Trusted by top NFT marketplaces and crypto platforms',
        'Supports Apple Pay and Google Pay for seamless purchases'
    ],
    'iss': [
        'Remote-first company with employees across continents',
        'Offers unlimited PTO and flexible working hours',
        'Engineering team spans multiple time zones'
    ],
    'moon': [
        'Mission: Make crypto accessible to everyone',
        'Vision: Leading crypto payments infrastructure',
        'Building the bridge between traditional finance and crypto'
    ]
};

// MoonPay Fact Bubble component
const MoonPayFactBubble = ({ 
    landmark, 
    factIndex, 
    offsetY 
}: { 
    landmark: Landmark; 
    factIndex: number; 
    offsetY: number;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const pos = LANDMARK_POSITIONS[landmark];
    const facts = MOONPAY_FACTS[landmark];
    const fact = facts[factIndex];
    
    // Offset positions slightly to spread facts around landmark
    const xOffset = (factIndex - 1) * 20;
    
    return (
        <Html
            position={[pos[0] + xOffset, pos[1] + offsetY + factIndex * 8, pos[2] + 20]}
            center
        >
            <div 
                role="button"
                tabIndex={0}
                style={{
                    position: 'relative',
                    cursor: 'pointer',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
            >
                {/* Info icon bubble */}
                <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7D00FF 0%, #5000A0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(125, 0, 255, 0.5)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}>
                    <span style={{
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>i</span>
                </div>
                
                {/* Tooltip card */}
                {isHovered && (
                    <div style={{
                        position: 'absolute',
                        left: 35,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(20, 10, 40, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(125, 0, 255, 0.4)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        minWidth: 220,
                        maxWidth: 280,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(125, 0, 255, 0.2)',
                        zIndex: 100,
                    }}>
                        <div style={{
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 400,
                            lineHeight: 1.5,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                            {fact}
                        </div>
                        {/* Arrow pointing to icon */}
                        <div style={{
                            position: 'absolute',
                            left: -6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 0,
                            height: 0,
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            borderRight: '6px solid rgba(125, 0, 255, 0.4)',
                        }} />
                    </div>
                )}
            </div>
        </Html>
    );
};

// Landmark name label component
const LandmarkLabel = ({ landmark }: { landmark: Landmark }) => {
    const pos = LANDMARK_POSITIONS[landmark];
    const labelY = getLandmarkLabelHeight(landmark);
    
    return (
        <Html
            position={[pos[0], pos[1] + labelY, pos[2]]}
            center
            style={{
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            <div style={{
                background: 'rgba(20, 10, 40, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                whiteSpace: 'nowrap',
                border: '1px solid rgba(125, 0, 255, 0.4)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(125, 0, 255, 0.2)',
            }}>
                📍 {LANDMARK_NAMES[landmark]}
            </div>
        </Html>
    );
};

// Easing function for smooth transitions
const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Super simple camera - ONLY follows player position, nothing else
const CameraController = ({ 
    characterPosRef,
    isCharacterCreation
}: { 
    characterPosRef: React.MutableRefObject<[number, number, number]>;
    isCharacterCreation: boolean;
}) => {
    const { camera } = useThree();
    
    useFrame(() => {
        // Get player position
        const [px, py, pz] = characterPosRef.current;
        
        if (isCharacterCreation) {
            // Fixed camera for character creation
            camera.position.set(-5, 12, 35);
            camera.lookAt(0, 8, 0);
        } else {
            // Camera position = player position + offset
            // Offset: slightly to the right (+15), above (+35), behind (+80)
            camera.position.set(px + 15, py + 35, pz + 80);
            
            // Look at a point slightly below and to the left of player
            // This puts the player in the upper-left area of the screen
            camera.lookAt(px + 10, py - 5, pz);
        }
    });
    
    return null;
};

// Scene content - uses refs for smooth animation
const SceneContent = ({ 
    gameState, 
    characterConfig, 
    isFlying,
    transitionProgressRef,
    previousLandmarkIndex,
    onCycleOption,
    onTransitionComplete
}: { 
    gameState: GameState;
    characterConfig: CharacterConfig;
    isFlying: boolean;
    transitionProgressRef: React.MutableRefObject<number>;
    previousLandmarkIndex: number;
    onCycleOption: (type: 'head' | 'torso' | 'legs', direction: 'left' | 'right') => void;
    onTransitionComplete: () => void;
}) => {
    const currentLandmark = getCurrentLandmark(gameState);
    const previousLandmark = LANDMARKS[previousLandmarkIndex];
    const inSpace = isSpaceLandmark(currentLandmark);
    
    // Refs for smooth animation without re-renders
    const characterPosRef = useRef<[number, number, number]>([0, 0, 0]);
    const flyDirectionRef = useRef<number>(0); // Angle in radians
    const startTimeRef = useRef<number>(0);
    const isAnimatingRef = useRef(false);
    const lastPrevIndexRef = useRef(previousLandmarkIndex);
    
    // State for sky/terrain visibility (updated infrequently)
    const [showSpace, setShowSpace] = useState(inSpace);
    const [showTerrain, setShowTerrain] = useState(!inSpace);
    const lastShowSpaceRef = useRef(inSpace);
    const lastShowTerrainRef = useRef(!inSpace);
    
    // Use R3F's useFrame for smooth animation
    useFrame((state) => {
        // Detect when a NEW transition starts (previousLandmarkIndex changes)
        // This fixes the bug where subsequent transitions don't animate
        if (previousLandmarkIndex !== lastPrevIndexRef.current) {
            lastPrevIndexRef.current = previousLandmarkIndex;
            // Force reset animation state for the new transition
            isAnimatingRef.current = false;
            startTimeRef.current = 0;
        }
        
        // Also reset if isFlying goes false (transition was cancelled or completed)
        if (!isFlying && isAnimatingRef.current) {
            isAnimatingRef.current = false;
            startTimeRef.current = 0;
        }
        
        // Start new animation when isFlying becomes true and we're not already animating
        if (isFlying && !isAnimatingRef.current) {
            isAnimatingRef.current = true;
            startTimeRef.current = state.clock.elapsedTime;
        }
        
        // Run animation
        if (isFlying && isAnimatingRef.current) {
            const elapsed = state.clock.elapsedTime - startTimeRef.current;
            const duration = 3.5; // 3.5 seconds
            const rawProgress = Math.min(elapsed / duration, 1);
            transitionProgressRef.current = rawProgress;
            
            if (rawProgress >= 1) {
                isAnimatingRef.current = false;
                onTransitionComplete();
            }
        }
        
        // Update sky/terrain visibility only when it changes
        const transitionProgress = transitionProgressRef.current;
        const shouldShowSpace = inSpace || (isFlying && transitionProgress > 0.5 && isSpaceLandmark(LANDMARKS[gameState.currentLandmarkIndex]));
        const shouldShowTerrain = !shouldShowSpace || (isFlying && transitionProgress < 0.7);
        
        // Update space visibility when it changes
        if (shouldShowSpace !== lastShowSpaceRef.current) {
            lastShowSpaceRef.current = shouldShowSpace;
            setShowSpace(shouldShowSpace);
        }
        
        // Update terrain visibility when it changes (tracked separately)
        if (shouldShowTerrain !== lastShowTerrainRef.current) {
            lastShowTerrainRef.current = shouldShowTerrain;
            setShowTerrain(shouldShowTerrain);
        }
        
        // Update character position smoothly
        const progress = easeInOutCubic(transitionProgressRef.current);
        
        if (gameState.phase === 'character-creation') {
            characterPosRef.current = [0, 0, 0];
            flyDirectionRef.current = 0;
        } else {
            // When flying, we interpolate from previous to current landmark
            // When not flying, we stay at the current landmark
            if (isFlying) {
                // Calculate start position (previous landmark)
                const prevPos = LANDMARK_POSITIONS[previousLandmark];
                const prevOffset = getCharacterOffset(previousLandmark);
                const startPos: [number, number, number] = [
                    prevPos[0] + prevOffset[0],
                    prevPos[1] + prevOffset[1],
                    prevPos[2] + prevOffset[2]
                ];
                
                // Calculate target position (current/destination landmark)
                const currentPos = LANDMARK_POSITIONS[currentLandmark];
                const currentOffset = getCharacterOffset(currentLandmark);
                const targetPos: [number, number, number] = [
                    currentPos[0] + currentOffset[0],
                    currentPos[1] + currentOffset[1],
                    currentPos[2] + currentOffset[2]
                ];
                
                // Calculate fly direction angle based on horizontal movement
                const dx = targetPos[0] - startPos[0];
                flyDirectionRef.current = Math.atan2(dx, 1) * 0.5; // Gentle turn toward direction
                
                // Character flies from previous to current position
                const isGoingToSpace = isSpaceLandmark(currentLandmark) && !isSpaceLandmark(previousLandmark);
                const flyHeight = isGoingToSpace ? 100 : 30;
                
                // Arc motion - up in the middle
                const arcY = Math.sin(progress * Math.PI) * flyHeight;
                
                // Interpolate position - at progress=0, stay at start; at progress=1, arrive at target
                characterPosRef.current = [
                    startPos[0] + (targetPos[0] - startPos[0]) * progress,
                    startPos[1] + (targetPos[1] - startPos[1]) * progress + arcY,
                    startPos[2] + (targetPos[2] - startPos[2]) * progress
                ];
            } else {
                // Not flying - stay at current landmark
                const currentPos = LANDMARK_POSITIONS[currentLandmark];
                const currentOffset = getCharacterOffset(currentLandmark);
                characterPosRef.current = [
                    currentPos[0] + currentOffset[0],
                    currentPos[1] + currentOffset[1],
                    currentPos[2] + currentOffset[2]
                ];
                flyDirectionRef.current = 0;
            }
        }
    });

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={showSpace ? 0.3 : 0.6} />
            <directionalLight 
                position={[50, 100, 50]} 
                intensity={showSpace ? 0.5 : 1} 
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            {!showSpace && <hemisphereLight intensity={0.4} />}
            
            {/* Sky / Space background */}
            {!showSpace ? (
                <>
                    <Sky 
                        sunPosition={[100, 50, 100]}
                        turbidity={8}
                        rayleigh={2}
                    />
                    <Cloud position={[-100, 80, -100]} speed={0.2} opacity={0.5} />
                    <Cloud position={[200, 90, -50]} speed={0.1} opacity={0.4} />
                    <Cloud position={[400, 70, 100]} speed={0.15} opacity={0.3} />
                </>
            ) : (
                <>
                    <color attach="background" args={['#0a0a1a']} />
                    <Stars 
                        radius={300} 
                        depth={100} 
                        count={2000} 
                        factor={4} 
                        saturation={0} 
                        fade 
                        speed={0.5}
                    />
                </>
            )}
            
            {/* Camera Controller */}
            <CameraController 
                characterPosRef={characterPosRef}
                isCharacterCreation={gameState.phase === 'character-creation'}
            />
            
            {/* Continuous Terrain (only for ground landmarks) */}
            {showTerrain && gameState.phase !== 'character-creation' && (
                <ContinuousTerrain />
            )}
            
            {/* All Earth Landmarks - always rendered on terrain */}
            {gameState.phase !== 'character-creation' && !showSpace && (
                <>
                    <Yacht position={LANDMARK_POSITIONS['yacht']} />
                    <LandmarkLabel landmark="yacht" />
                    {!isFlying && currentLandmark === 'yacht' && (
                        <>
                            <MoonPayFactBubble landmark="yacht" factIndex={0} offsetY={10} />
                            <MoonPayFactBubble landmark="yacht" factIndex={1} offsetY={10} />
                            <MoonPayFactBubble landmark="yacht" factIndex={2} offsetY={10} />
                        </>
                    )}
                    
                    <StatueOfLiberty position={LANDMARK_POSITIONS['statue-of-liberty']} />
                    <LandmarkLabel landmark="statue-of-liberty" />
                    {!isFlying && currentLandmark === 'statue-of-liberty' && (
                        <>
                            <MoonPayFactBubble landmark="statue-of-liberty" factIndex={0} offsetY={35} />
                            <MoonPayFactBubble landmark="statue-of-liberty" factIndex={1} offsetY={35} />
                            <MoonPayFactBubble landmark="statue-of-liberty" factIndex={2} offsetY={35} />
                        </>
                    )}
                    
                    <EiffelTower position={LANDMARK_POSITIONS['eiffel-tower']} />
                    <LandmarkLabel landmark="eiffel-tower" />
                    {!isFlying && currentLandmark === 'eiffel-tower' && (
                        <>
                            <MoonPayFactBubble landmark="eiffel-tower" factIndex={0} offsetY={50} />
                            <MoonPayFactBubble landmark="eiffel-tower" factIndex={1} offsetY={50} />
                            <MoonPayFactBubble landmark="eiffel-tower" factIndex={2} offsetY={50} />
                        </>
                    )}
                    
                    <BurjKhalifa position={LANDMARK_POSITIONS['burj-khalifa']} />
                    <LandmarkLabel landmark="burj-khalifa" />
                    {!isFlying && currentLandmark === 'burj-khalifa' && (
                        <>
                            <MoonPayFactBubble landmark="burj-khalifa" factIndex={0} offsetY={60} />
                            <MoonPayFactBubble landmark="burj-khalifa" factIndex={1} offsetY={60} />
                            <MoonPayFactBubble landmark="burj-khalifa" factIndex={2} offsetY={60} />
                        </>
                    )}
                </>
            )}
            
            {/* Space Landmarks - only when in space */}
            {gameState.phase !== 'character-creation' && showSpace && (
                <>
                    {(currentLandmark === 'iss' || (isFlying && LANDMARKS[gameState.currentLandmarkIndex] === 'iss')) && (
                        <>
                            <ISS position={LANDMARK_POSITIONS['iss']} />
                            <LandmarkLabel landmark="iss" />
                            {!isFlying && currentLandmark === 'iss' && (
                                <>
                                    <MoonPayFactBubble landmark="iss" factIndex={0} offsetY={15} />
                                    <MoonPayFactBubble landmark="iss" factIndex={1} offsetY={15} />
                                    <MoonPayFactBubble landmark="iss" factIndex={2} offsetY={15} />
                                </>
                            )}
                        </>
                    )}
                    
                    {(currentLandmark === 'moon' || (isFlying && LANDMARKS[gameState.currentLandmarkIndex] === 'moon')) && (
                        <>
                            <Moon position={LANDMARK_POSITIONS['moon']} />
                            <LandmarkLabel landmark="moon" />
                            {!isFlying && currentLandmark === 'moon' && (
                                <>
                                    <MoonPayFactBubble landmark="moon" factIndex={0} offsetY={20} />
                                    <MoonPayFactBubble landmark="moon" factIndex={1} offsetY={20} />
                                    <MoonPayFactBubble landmark="moon" factIndex={2} offsetY={20} />
                                </>
                            )}
                        </>
                    )}
                </>
            )}
            
            {/* Character */}
            <VoxelCharacter 
                positionRef={characterPosRef}
                config={characterConfig}
                isFlying={isFlying}
                flyDirectionRef={flyDirectionRef}
                showArrows={gameState.phase === 'character-creation'}
                onCycleOption={onCycleOption}
                scale={gameState.phase === 'character-creation' ? 0.9 : 0.6}
            />
            
            {/* Camera controls - disabled during flight */}
            <OrbitControls 
                enablePan={false}
                enableZoom={gameState.phase === 'character-creation'}
                enableRotate={!isFlying}
                minDistance={gameState.phase === 'character-creation' ? 35 : 50}
                maxDistance={gameState.phase === 'character-creation' ? 75 : 200}
            />
        </>
    );
};

// Main Game3D component
const Game3D = () => {
    // Get player name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name') || 'Player';
    
    // Game state
    const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(playerName));
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    const [isFlying, setIsFlying] = useState(false);
    const [previousLandmarkIndex, setPreviousLandmarkIndex] = useState(0);
    
    // Use ref for transition progress to avoid re-renders every frame
    const transitionProgressRef = useRef<number>(0);
    
    // Character customization
    const [characterConfig, setCharacterConfig] = useState<CharacterConfig>({
        headIndex: 0,
        torsoIndex: 0,
        legsIndex: 0,
        headPrimaryColor: '#FFFFFF',
        headSecondaryColor: '#7D00FF',
        torsoPrimaryColor: '#FFFFFF',
        torsoSecondaryColor: '#7D00FF',
        legsPrimaryColor: '#FFFFFF',
        legsSecondaryColor: '#7D00FF',
    });
    
    // Load new question
    const loadNewQuestion = useCallback((answeredQuestions: number[]) => {
        const question = getRandomQuestion(answeredQuestions);
        setCurrentQuestion(question);
    }, []);
    
    // Callback when transition animation completes (called from useFrame)
    // Note: We don't reset transitionProgressRef here - it stays at 1 until next transition starts
    // This prevents a flicker where progress resets to 0 before isFlying state updates
    const handleTransitionComplete = useCallback(() => {
        setIsFlying(false);
    }, []);
    
    // Handle correct answer
    const handleAnswer = useCallback((isCorrect: boolean) => {
        if (!isCorrect) return;
        
        // Store the current landmark before advancing
        setPreviousLandmarkIndex(gameState.currentLandmarkIndex);
        
        // Start flying animation
        transitionProgressRef.current = 0.001; // Small value to trigger transition
        setIsFlying(true);
        
        // Advance game state
        setGameState(prev => {
            const newState = advanceToNextLandmark({
                ...prev,
                answeredQuestions: currentQuestion ? [...prev.answeredQuestions, currentQuestion.id] : prev.answeredQuestions
            });
            
            if (newState.phase !== 'victory') {
                loadNewQuestion(newState.answeredQuestions);
            }
            
            return newState;
        });
    }, [currentQuestion, loadNewQuestion, gameState.currentLandmarkIndex]);
    
    // Start game
    const handleStartGame = useCallback(() => {
        setGameState(prev => {
            const newState = startGame(prev);
            loadNewQuestion(newState.answeredQuestions);
            return newState;
        });
    }, [loadNewQuestion]);
    
    // Cycle character options (4 options each: 0-3)
    const cycleOption = useCallback((type: 'head' | 'torso' | 'legs', direction: 'left' | 'right') => {
        const delta = direction === 'right' ? 1 : -1;
        setCharacterConfig(prev => {
            const key = `${type}Index` as keyof CharacterConfig;
            const currentVal = prev[key] as number;
            let newVal = currentVal + delta;
            if (newVal < 0) newVal = 3;
            if (newVal > 3) newVal = 0;
            return { ...prev, [key]: newVal };
        });
    }, []);
    
    // Change color for a body part
    const changeColor = useCallback((part: 'head' | 'torso' | 'legs', colorType: 'primary' | 'secondary', color: string) => {
        const key = `${part}${colorType === 'primary' ? 'Primary' : 'Secondary'}Color` as keyof CharacterConfig;
        setCharacterConfig(prev => ({ ...prev, [key]: color }));
    }, []);

    return (
        <div style={styles.container}>
            {/* 3D Canvas */}
            <Canvas
                shadows
                camera={{ position: [0, 50, 100], fov: 60 }}
                style={styles.canvas}
            >
                <Suspense fallback={null}>
                    <SceneContent 
                        gameState={gameState}
                        characterConfig={characterConfig}
                        isFlying={isFlying}
                        transitionProgressRef={transitionProgressRef}
                        previousLandmarkIndex={previousLandmarkIndex}
                        onCycleOption={cycleOption}
                        onTransitionComplete={handleTransitionComplete}
                    />
                </Suspense>
            </Canvas>
            
            {/* Character Creation UI */}
            {gameState.phase === 'character-creation' && (
                <>
                    <div style={styles.creationOverlay}>
                        <div style={styles.creationCard}>
                            <h1 style={styles.creationWelcomeTitle}>Welcome to MoonPay, {playerName}! 🎉</h1>
                            <p style={styles.creationWelcomeText}>
                                Congratulations on making it through the recruitment process — we're thrilled to have you join the team!
                                <br /><br />
                                Before you dive into your new role, we've prepared a little adventure for you.
                                Test your crypto knowledge as you journey from a luxury yacht all the way to the moon!
                            </p>
                            <p style={styles.subtitle}>Click the arrows to customize your astronaut</p>
                        </div>
                    </div>
                    
                    {/* Color Selectors Panel */}
                    <div style={styles.colorPanelContainer}>
                        <div style={styles.colorPanel}>
                            <h3 style={styles.colorPanelTitle}>🎨 Customize Colors</h3>
                            
                            {/* Head Colors */}
                            <div style={styles.colorSection}>
                                <span style={styles.colorSectionLabel}>Helmet</span>
                                <div style={styles.colorRow}>
                                    <span style={styles.colorTypeLabel}>Main</span>
                                    <div style={styles.colorSwatches}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={`head-primary-${color.value}`}
                                                type="button"
                                                onClick={() => changeColor('head', 'primary', color.value)}
                                                style={{
                                                    ...styles.colorSwatch,
                                                    backgroundColor: color.value,
                                                    border: characterConfig.headPrimaryColor === color.value 
                                                        ? '3px solid #7D00FF' 
                                                        : '2px solid rgba(255,255,255,0.3)',
                                                    boxShadow: characterConfig.headPrimaryColor === color.value 
                                                        ? '0 0 10px rgba(125, 0, 255, 0.7)' 
                                                        : 'none',
                                                }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={styles.colorRow}>
                                    <span style={styles.colorTypeLabel}>Visor</span>
                                    <div style={styles.colorSwatches}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={`head-secondary-${color.value}`}
                                                type="button"
                                                onClick={() => changeColor('head', 'secondary', color.value)}
                                                style={{
                                                    ...styles.colorSwatch,
                                                    backgroundColor: color.value,
                                                    border: characterConfig.headSecondaryColor === color.value 
                                                        ? '3px solid #7D00FF' 
                                                        : '2px solid rgba(255,255,255,0.3)',
                                                    boxShadow: characterConfig.headSecondaryColor === color.value 
                                                        ? '0 0 10px rgba(125, 0, 255, 0.7)' 
                                                        : 'none',
                                                }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Torso Colors */}
                            <div style={styles.colorSection}>
                                <span style={styles.colorSectionLabel}>Suit</span>
                                <div style={styles.colorRow}>
                                    <span style={styles.colorTypeLabel}>Main</span>
                                    <div style={styles.colorSwatches}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={`torso-primary-${color.value}`}
                                                type="button"
                                                onClick={() => changeColor('torso', 'primary', color.value)}
                                                style={{
                                                    ...styles.colorSwatch,
                                                    backgroundColor: color.value,
                                                    border: characterConfig.torsoPrimaryColor === color.value 
                                                        ? '3px solid #7D00FF' 
                                                        : '2px solid rgba(255,255,255,0.3)',
                                                    boxShadow: characterConfig.torsoPrimaryColor === color.value 
                                                        ? '0 0 10px rgba(125, 0, 255, 0.7)' 
                                                        : 'none',
                                                }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={styles.colorRow}>
                                    <span style={styles.colorTypeLabel}>Accent</span>
                                    <div style={styles.colorSwatches}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={`torso-secondary-${color.value}`}
                                                type="button"
                                                onClick={() => changeColor('torso', 'secondary', color.value)}
                                                style={{
                                                    ...styles.colorSwatch,
                                                    backgroundColor: color.value,
                                                    border: characterConfig.torsoSecondaryColor === color.value 
                                                        ? '3px solid #7D00FF' 
                                                        : '2px solid rgba(255,255,255,0.3)',
                                                    boxShadow: characterConfig.torsoSecondaryColor === color.value 
                                                        ? '0 0 10px rgba(125, 0, 255, 0.7)' 
                                                        : 'none',
                                                }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Legs Colors */}
                            <div style={styles.colorSection}>
                                <span style={styles.colorSectionLabel}>Legs</span>
                                <div style={styles.colorRow}>
                                    <span style={styles.colorTypeLabel}>Main</span>
                                    <div style={styles.colorSwatches}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={`legs-primary-${color.value}`}
                                                type="button"
                                                onClick={() => changeColor('legs', 'primary', color.value)}
                                                style={{
                                                    ...styles.colorSwatch,
                                                    backgroundColor: color.value,
                                                    border: characterConfig.legsPrimaryColor === color.value 
                                                        ? '3px solid #7D00FF' 
                                                        : '2px solid rgba(255,255,255,0.3)',
                                                    boxShadow: characterConfig.legsPrimaryColor === color.value 
                                                        ? '0 0 10px rgba(125, 0, 255, 0.7)' 
                                                        : 'none',
                                                }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div style={styles.colorRow}>
                                    <span style={styles.colorTypeLabel}>Boots</span>
                                    <div style={styles.colorSwatches}>
                                        {COLOR_PALETTE.map((color) => (
                                            <button
                                                key={`legs-secondary-${color.value}`}
                                                type="button"
                                                onClick={() => changeColor('legs', 'secondary', color.value)}
                                                style={{
                                                    ...styles.colorSwatch,
                                                    backgroundColor: color.value,
                                                    border: characterConfig.legsSecondaryColor === color.value 
                                                        ? '3px solid #7D00FF' 
                                                        : '2px solid rgba(255,255,255,0.3)',
                                                    boxShadow: characterConfig.legsSecondaryColor === color.value 
                                                        ? '0 0 10px rgba(125, 0, 255, 0.7)' 
                                                        : 'none',
                                                }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={styles.bottomButtonContainer}>
                        <button type="button" style={styles.startButton} onClick={handleStartGame}>
                            🚀 Begin Your Journey
                        </button>
                    </div>
                </>
            )}
            
            {/* Question Panel */}
            {gameState.phase === 'trivia' && currentQuestion && !isFlying && (
                <QuestionPanel
                    question={currentQuestion}
                    currentLandmark={getCurrentLandmark(gameState)}
                    currentIndex={gameState.currentLandmarkIndex}
                    totalLandmarks={LANDMARKS.length}
                    onAnswer={handleAnswer}
                />
            )}
            
            {/* Victory Screen */}
            {gameState.phase === 'victory' && !isFlying && (
                <div style={styles.victoryOverlay}>
                    <div style={styles.victoryContent}>
                        <h1 style={styles.victoryTitle}>🎉 Congratulations, {playerName}!</h1>
                        <p style={styles.victoryIntro}>
                            You've successfully completed the journey to the moon! Here's what makes MoonPay an incredible place to work:
                        </p>
                        
                        <div style={styles.benefitsGrid}>
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>🏥</div>
                                <h3 style={styles.benefitTitle}>Health & Wellness</h3>
                                <ul style={styles.benefitList}>
                                    <li>Comprehensive medical, dental, and vision insurance</li>
                                    <li>Mental health support and wellness days</li>
                                    <li>Gym membership reimbursement</li>
                                </ul>
                            </div>
                            
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>💰</div>
                                <h3 style={styles.benefitTitle}>Financial Perks</h3>
                                <ul style={styles.benefitList}>
                                    <li>Competitive salary packages</li>
                                    <li>Crypto bonus eligibility</li>
                                    <li>401(k) matching up to 6%</li>
                                </ul>
                            </div>
                            
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>🌴</div>
                                <h3 style={styles.benefitTitle}>Work-Life Balance</h3>
                                <ul style={styles.benefitList}>
                                    <li>Unlimited PTO policy</li>
                                    <li>Remote-first work culture</li>
                                    <li>Flexible working hours</li>
                                </ul>
                            </div>
                            
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>🎉</div>
                                <h3 style={styles.benefitTitle}>Fun Extras</h3>
                                <ul style={styles.benefitList}>
                                    <li>Quarterly team offsites</li>
                                    <li>MoonPay swag and merchandise</li>
                                    <li>Conference attendance opportunities</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style={styles.welcomeSection}>
                            <h2 style={styles.welcomeTitle}>Welcome Aboard! 🚀</h2>
                            <p style={styles.welcomeText}>
                                We're thrilled to have you join the MoonPay family!
                            </p>
                        </div>
                        
                        <div style={styles.buttonRow}>
                            <button type="button" style={styles.restartButton} onClick={() => window.location.reload()}>
                                🔄 Play Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FONT_FAMILY = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY
    },
    canvas: {
        width: '100%',
        height: '100%'
    },
    creationOverlay: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        padding: '0 20px'
    },
    creationCard: {
        background: 'rgba(20, 10, 40, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 20,
        padding: '30px 40px',
        maxWidth: 600,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)'
    },
    creationWelcomeTitle: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 700,
        margin: 0,
        fontFamily: FONT_FAMILY
    },
    creationWelcomeText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 15,
        fontWeight: 400,
        marginTop: 16,
        lineHeight: 1.7,
        fontFamily: FONT_FAMILY
    },
    subtitle: {
        color: '#A855F7',
        fontSize: 13,
        fontWeight: 600,
        marginTop: 20,
        marginBottom: 0,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontFamily: FONT_FAMILY
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center'
    },
    startButton: {
        padding: '14px 36px',
        fontSize: 16,
        fontWeight: 600,
        color: '#FFF',
        backgroundColor: '#7D00FF',
        border: 'none',
        borderRadius: 30,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(125, 0, 255, 0.5)',
        fontFamily: FONT_FAMILY
    },
    colorPanelContainer: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10
    },
    colorPanel: {
        background: 'rgba(20, 10, 40, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 16,
        padding: '20px',
        minWidth: 200,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)'
    },
    colorPanelTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 700,
        margin: '0 0 16px 0',
        textAlign: 'center' as const,
        fontFamily: FONT_FAMILY
    },
    colorSection: {
        marginBottom: 16
    },
    colorSectionLabel: {
        color: '#A855F7',
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: 1,
        display: 'block',
        marginBottom: 8,
        fontFamily: FONT_FAMILY
    },
    colorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6
    },
    colorTypeLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        fontWeight: 500,
        width: 40,
        fontFamily: FONT_FAMILY
    },
    colorSwatches: {
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap' as const
    },
    colorSwatch: {
        width: 24,
        height: 24,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
    },
    victoryOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        fontFamily: FONT_FAMILY,
        overflowY: 'auto',
        padding: '40px 20px'
    },
    victoryContent: {
        maxWidth: 900,
        width: '100%',
        textAlign: 'center'
    },
    victoryTitle: {
        color: '#FFD700',
        fontSize: 36,
        fontWeight: 700,
        marginBottom: 16,
        fontFamily: FONT_FAMILY
    },
    victoryIntro: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 16,
        fontWeight: 400,
        marginBottom: 32,
        lineHeight: 1.6,
        fontFamily: FONT_FAMILY
    },
    benefitsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
    },
    benefitCard: {
        backgroundColor: 'rgba(125, 0, 255, 0.1)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 12,
        padding: 16,
        textAlign: 'left'
    },
    benefitIcon: {
        fontSize: 28,
        marginBottom: 8
    },
    benefitTitle: {
        color: '#7D00FF',
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 8,
        fontFamily: FONT_FAMILY
    },
    benefitList: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        lineHeight: 1.6,
        paddingLeft: 16,
        margin: 0,
        fontFamily: FONT_FAMILY
    },
    welcomeSection: {
        backgroundColor: 'rgba(125, 0, 255, 0.15)',
        border: '1px solid rgba(125, 0, 255, 0.4)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
    },
    welcomeTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 8,
        fontFamily: FONT_FAMILY
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 14,
        fontWeight: 400,
        margin: 0,
        fontFamily: FONT_FAMILY
    },
    buttonRow: {
        display: 'flex',
        gap: 16,
        justifyContent: 'center'
    },
    restartButton: {
        padding: '14px 28px',
        fontSize: 16,
        fontWeight: 600,
        color: '#FFF',
        backgroundColor: '#7D00FF',
        border: 'none',
        borderRadius: 30,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
        boxShadow: '0 4px 20px rgba(125, 0, 255, 0.5)'
    }
};

export default Game3D;
