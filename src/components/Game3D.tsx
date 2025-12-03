import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Cloud, Html } from '@react-three/drei';
import { Suspense, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
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

// Character configuration
interface CharacterConfig {
    headIndex: number;
    torsoIndex: number;
    legsIndex: number;
}

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
                background: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                whiteSpace: 'nowrap',
                border: '2px solid rgba(125, 0, 255, 0.5)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
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

// Camera controller that follows the player along the terrain
const CameraController = ({ 
    currentLandmark,
    transitionProgressRef,
    previousLandmark,
    isFlying,
    isCharacterCreation
}: { 
    currentLandmark: Landmark;
    transitionProgressRef: React.MutableRefObject<number>;
    previousLandmark: Landmark;
    isFlying: boolean;
    isCharacterCreation: boolean;
}) => {
    const { camera } = useThree();
    const targetRef = useRef(new THREE.Vector3(0, 30, 0));
    
    useFrame(() => {
        if (isCharacterCreation) {
            // Character creation camera - front facing with slight left offset
            camera.position.lerp(new THREE.Vector3(-5, 12, 35), 0.08);
            targetRef.current.lerp(new THREE.Vector3(0, 8, 0), 0.08);
        } else {
            const currentPos = LANDMARK_POSITIONS[currentLandmark];
            const prevPos = LANDMARK_POSITIONS[previousLandmark];
            const isGoingToSpace = isSpaceLandmark(currentLandmark) && !isSpaceLandmark(previousLandmark);
            const inSpace = isSpaceLandmark(currentLandmark);
            const transitionProgress = transitionProgressRef.current;
            
            let targetCamPos: THREE.Vector3;
            let targetLookAt: THREE.Vector3;
            
            if (isFlying && transitionProgress > 0) {
                const progress = easeInOutCubic(transitionProgress);
                
                // Interpolate between previous and current positions
                const interpX = prevPos[0] + (currentPos[0] - prevPos[0]) * progress;
                const interpY = prevPos[1] + (currentPos[1] - prevPos[1]) * progress;
                
                if (isGoingToSpace) {
                    // Rising up to space - camera lifts dramatically
                    const riseProgress = Math.min(1, progress * 1.5);
                    targetCamPos = new THREE.Vector3(
                        interpX,
                        20 + riseProgress * 180,
                        120 - riseProgress * 40
                    );
                    targetLookAt = new THREE.Vector3(interpX, interpY + 20, 0);
                } else if (inSpace) {
                    // Moving between space landmarks
                    targetCamPos = new THREE.Vector3(interpX, interpY + 50, 100);
                    targetLookAt = new THREE.Vector3(interpX, interpY, 0);
                } else {
                    // Moving along the terrain - camera follows smoothly from front
                    targetCamPos = new THREE.Vector3(interpX, 50, 120);
                    targetLookAt = new THREE.Vector3(interpX, 30, 0);
                }
                
                // Faster lerp for smoother tracking during flight
                camera.position.lerp(targetCamPos, 0.12);
                targetRef.current.lerp(targetLookAt, 0.12);
            } else {
                // Stationary at current landmark - front-facing camera
                if (inSpace) {
                    targetCamPos = new THREE.Vector3(currentPos[0], currentPos[1] + 50, 100);
                    targetLookAt = new THREE.Vector3(currentPos[0], currentPos[1], 0);
                } else {
                    // Camera positioned in front of landmark (positive Z), looking at landmark
                    targetCamPos = new THREE.Vector3(currentPos[0], 50, 120);
                    targetLookAt = new THREE.Vector3(currentPos[0], 30, 0);
                }
                
                // Faster lerp for quicker camera settling
                camera.position.lerp(targetCamPos, 0.1);
                targetRef.current.lerp(targetLookAt, 0.1);
            }
        }
        
        camera.lookAt(targetRef.current);
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
        
        if (shouldShowSpace !== lastShowSpaceRef.current) {
            lastShowSpaceRef.current = shouldShowSpace;
            setShowSpace(shouldShowSpace);
            setShowTerrain(shouldShowTerrain);
        }
        
        // Update character position smoothly
        const progress = easeInOutCubic(transitionProgressRef.current);
        
        if (gameState.phase === 'character-creation') {
            characterPosRef.current = [0, 0, 0];
            flyDirectionRef.current = 0;
        } else {
            const currentPos = LANDMARK_POSITIONS[currentLandmark];
            const currentOffset = getCharacterOffset(currentLandmark);
            const targetPos: [number, number, number] = [
                currentPos[0] + currentOffset[0],
                currentPos[1] + currentOffset[1],
                currentPos[2] + currentOffset[2]
            ];
            
            if (isFlying && transitionProgressRef.current > 0) {
                const prevPos = LANDMARK_POSITIONS[previousLandmark];
                const prevOffset = getCharacterOffset(previousLandmark);
                const startPos: [number, number, number] = [
                    prevPos[0] + prevOffset[0],
                    prevPos[1] + prevOffset[1],
                    prevPos[2] + prevOffset[2]
                ];
                
                // Calculate fly direction angle based on horizontal movement
                const dx = targetPos[0] - startPos[0];
                flyDirectionRef.current = Math.atan2(dx, 1) * 0.5; // Gentle turn toward direction
                
                // Character flies from previous to current position
                const isGoingToSpace = isSpaceLandmark(currentLandmark) && !isSpaceLandmark(previousLandmark);
                const flyHeight = isGoingToSpace ? 100 : 30;
                
                // Arc motion - up in the middle
                const arcY = Math.sin(progress * Math.PI) * flyHeight;
                
                characterPosRef.current = [
                    startPos[0] + (targetPos[0] - startPos[0]) * progress,
                    startPos[1] + (targetPos[1] - startPos[1]) * progress + arcY,
                    startPos[2] + (targetPos[2] - startPos[2]) * progress
                ];
            } else {
                characterPosRef.current = targetPos;
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
                currentLandmark={currentLandmark}
                transitionProgressRef={transitionProgressRef}
                previousLandmark={previousLandmark}
                isFlying={isFlying}
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
                    
                    <StatueOfLiberty position={LANDMARK_POSITIONS['statue-of-liberty']} />
                    <LandmarkLabel landmark="statue-of-liberty" />
                    
                    <EiffelTower position={LANDMARK_POSITIONS['eiffel-tower']} />
                    <LandmarkLabel landmark="eiffel-tower" />
                    
                    <BurjKhalifa position={LANDMARK_POSITIONS['burj-khalifa']} />
                    <LandmarkLabel landmark="burj-khalifa" />
                </>
            )}
            
            {/* Space Landmarks - only when in space */}
            {gameState.phase !== 'character-creation' && showSpace && (
                <>
                    {(currentLandmark === 'iss' || (isFlying && LANDMARKS[gameState.currentLandmarkIndex] === 'iss')) && (
                        <>
                            <ISS position={LANDMARK_POSITIONS['iss']} />
                            <LandmarkLabel landmark="iss" />
                        </>
                    )}
                    
                    {(currentLandmark === 'moon' || (isFlying && LANDMARKS[gameState.currentLandmarkIndex] === 'moon')) && (
                        <>
                            <Moon position={LANDMARK_POSITIONS['moon']} />
                            <LandmarkLabel landmark="moon" />
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
        legsIndex: 0
    });
    
    // Load new question
    const loadNewQuestion = useCallback((answeredQuestions: number[]) => {
        const question = getRandomQuestion(answeredQuestions);
        setCurrentQuestion(question);
    }, []);
    
    // Callback when transition animation completes (called from useFrame)
    const handleTransitionComplete = useCallback(() => {
        setIsFlying(false);
        transitionProgressRef.current = 0;
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
    
    // Cycle character options
    const cycleOption = useCallback((type: 'head' | 'torso' | 'legs', direction: 'left' | 'right') => {
        const delta = direction === 'right' ? 1 : -1;
        setCharacterConfig(prev => {
            const key = `${type}Index` as keyof CharacterConfig;
            let newVal = prev[key] + delta;
            if (newVal < 0) newVal = 5;
            if (newVal > 5) newVal = 0;
            return { ...prev, [key]: newVal };
        });
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
                        <h1 style={styles.creationWelcomeTitle}>Welcome to MoonPay, {playerName}! 🎉</h1>
                        <p style={styles.creationWelcomeText}>
                            Congratulations on making it through the recruitment process — we're thrilled to have you join the team!
                            <br /><br />
                            Before you dive into your new role, we've prepared a little adventure for you.
                            Test your crypto knowledge as you journey from a luxury yacht all the way to the moon!
                        </p>
                        <p style={styles.subtitle}>Click the arrows to customize your astronaut</p>
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
        textAlign: 'center',
        pointerEvents: 'none',
        padding: '0 20px'
    },
    creationWelcomeTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 700,
        margin: 0,
        textShadow: '0 2px 20px rgba(0,0,0,0.8)',
        fontFamily: FONT_FAMILY
    },
    creationWelcomeText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontWeight: 400,
        marginTop: 12,
        lineHeight: 1.6,
        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        fontFamily: FONT_FAMILY
    },
    subtitle: {
        color: '#7D00FF',
        fontSize: 14,
        fontWeight: 600,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: FONT_FAMILY,
        textShadow: '0 1px 4px rgba(0,0,0,0.8)'
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
