import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { GameState } from '../utils/gameState';
import { 
    createInitialGameState, 
    advanceToNextLocation, 
    startGame,
    MOONBASE_ORDER
} from '../utils/gameState';
import type { TriviaQuestion } from '../utils/triviaQuestions';
import { getRandomQuestion } from '../utils/triviaQuestions';
import { CHARACTER_PRESETS, type CharacterPreset } from '../utils/characterSprites';
import { drawAlienSaucer } from '../utils/canvasRenderer';
import GameCanvas2D from './GameCanvas2D';
import ProgressSidebar from './ProgressSidebar';
import QuestionPanel from './QuestionPanel';

// FYI facts for each moonbase location
const MOONBASE_FYIS: Record<string, string[]> = {
    'london': [
        "MoonPay HQ. Ranked #21 on CNBC's 2025 Disruptor 50 list.",
        "Where it all started. Now serving 30 million users across 180+ countries.",
        "Global headquarters. From startup to $3.4B valuation in under 4 years.",
        "Home base since 2019. Over $8 billion in crypto transactions processed."
    ],
    'amsterdam': [
        "MoonPay received MiCA approval here — turning Europe purple in 2025.",
        "EU headquarters. First crypto on-ramp with full MiCA compliance.",
        "Where we secured European regulatory approval. Compliance never looked so good.",
        "Our EU hub. Licensed across 50+ jurisdictions worldwide."
    ],
    'barcelona': [
        "Engineering hub. The team here helped ship MoonPay Commerce in 2025.",
        "Where we build products used by 6,000+ businesses globally.",
        "Sun, sangria, and smart contracts. Our Mediterranean dev hub.",
        "Home to the engineers powering 150 million merchant integrations."
    ],
    'dublin': [
        "EMEA operations. Acquired Helio in 2025 to supercharge crypto payments.",
        "Payments HQ. We partnered with Mastercard for global stablecoin payments here.",
        "Where deals get done. Iron acquisition? Signed here. Mastercard partnership? Here too.",
        "Our compliance nerve center. Operating in 180+ countries from this office."
    ],
    'new-york': [
        "Just secured a New York Trust Charter — crypto custody and OTC trading unlocked.",
        "Americas HQ. November 2025: MoonPay becomes a licensed NY trust company.",
        "Wall Street meets Web3. Now offering institutional-grade crypto services.",
        "The office that closed our $555M Series A. Now a regulated trust."
    ],
    'moon': [
        "You made it! Welcome to the team powering crypto's mainstream adoption.",
        "Final stop. MoonPay: 30M users, 180 countries, one mission.",
        "To the moon! You're joining the #21 most disruptive company of 2025.",
        "Mission complete. From fiat to moon — that's the MoonPay way."
    ]
};

// Get all FYIs for a location
const getFYIs = (location: string): string[] => {
    return MOONBASE_FYIS[location] || MOONBASE_FYIS['london'];
};

const Game2D = () => {
    // Get player name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name') || 'Player';
    
    // Game state
    const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(playerName));
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    const [isFlying, setIsFlying] = useState(false);
    const [previousLocationIndex, setPreviousLocationIndex] = useState(0);
    const [selectedPreset, setSelectedPreset] = useState<CharacterPreset>(CHARACTER_PRESETS[0]);
    const [showVictoryScreen, setShowVictoryScreen] = useState<1 | 2 | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Animation progress ref
    const transitionProgressRef = useRef<number>(0);
    
    // Get all FYIs for current location
    const locationFYIs = useMemo(() => {
        const location = MOONBASE_ORDER[gameState.currentLocationIndex];
        return getFYIs(location);
    }, [gameState.currentLocationIndex]);
    
    // Load new question
    const loadNewQuestion = useCallback((answeredQuestions: number[]) => {
        const question = getRandomQuestion(answeredQuestions);
        setCurrentQuestion(question);
    }, []);
    
    // Handle transition complete
    const handleTransitionComplete = useCallback(() => {
        setIsFlying(false);
        transitionProgressRef.current = 0;
        
        // Check if we reached the final destination (NYC)
        if (gameState.phase === 'victory') {
            setShowVictoryScreen(1);
        }
    }, [gameState.phase]);
    
    // Handle correct answer
    const handleAnswer = useCallback((isCorrect: boolean) => {
        if (!isCorrect) return;
        
        // Store current location before advancing
        setPreviousLocationIndex(gameState.currentLocationIndex);
        
        // Start flying animation
        transitionProgressRef.current = 0.001;
        setIsFlying(true);
        
        // Advance game state
        setGameState(prev => {
            const newState = advanceToNextLocation({
                ...prev,
                answeredQuestions: currentQuestion ? [...prev.answeredQuestions, currentQuestion.id] : prev.answeredQuestions
            });
            
            if (newState.phase !== 'victory') {
                loadNewQuestion(newState.answeredQuestions);
            }
            
            return newState;
        });
    }, [currentQuestion, loadNewQuestion, gameState.currentLocationIndex]);
    
    // Start game
    const handleStartGame = useCallback(() => {
        setGameState(prev => {
            const newState = startGame(prev);
            loadNewQuestion(newState.answeredQuestions);
            return newState;
        });
    }, [loadNewQuestion]);
    
    // Select character preset
    const handleSelectPreset = useCallback((preset: CharacterPreset) => {
        setSelectedPreset(preset);
        setGameState(prev => ({
            ...prev,
            selectedCharacterPreset: preset.id
        }));
    }, []);
    
    // Victory screen navigation
    const handleVictoryNext = useCallback(() => {
        if (showVictoryScreen === 1) {
            setShowVictoryScreen(2);
        }
    }, [showVictoryScreen]);

    // Get current location for display
    const currentLocation = MOONBASE_ORDER[gameState.currentLocationIndex];

    return (
        <div style={styles.container}>
            {/* Main Game Canvas */}
            <GameCanvas2D
                gameState={gameState}
                characterPreset={selectedPreset}
                isFlying={isFlying}
                previousLocationIndex={previousLocationIndex}
                transitionProgressRef={transitionProgressRef}
                onTransitionComplete={handleTransitionComplete}
            />
            
            {/* Journey Map Panel - container expands while icon stays in place */}
            {gameState.phase !== 'character-creation' && !showVictoryScreen && !isFlying && (
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: 'absolute',
                        top: 40,
                        left: 0,
                        zIndex: 100,
                        width: sidebarOpen ? 253 : 61,
                        height: sidebarOpen ? 330 : 58,
                        backgroundColor: '#1D1436',
                        borderTop: '1px solid #480990',
                        borderRight: '1px solid #480990',
                        borderBottom: '1px solid #480990',
                        borderLeft: 'none',
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                        boxShadow: '0 0 20px 1px #5E0CA06B',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'width 0.3s ease, height 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: 0,
                        textAlign: 'left'
                    }}
                >
                    {/* Header with icon - always visible */}
                    <div
                        style={{
                            padding: sidebarOpen ? '20px 24px 12px 24px' : '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transition: 'padding 0.3s ease'
                        }}
                    >
                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="mapIconTitle">
                            <title id="mapIconTitle">Toggle Journey Map</title>
                            <path d="M7.875 15.75L1.75 19.25V5.25L7.875 1.75M7.875 15.75L14 19.25M7.875 15.75V1.75M14 19.25L19.25 15.75V1.75L14 5.25M14 19.25V5.25M14 5.25L7.875 1.75" stroke="#DADADA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span 
                            style={{ 
                                color: '#DADADA', 
                                fontSize: 18, 
                                fontWeight: 600, 
                                fontFamily: "'Space Grotesk', sans-serif",
                                opacity: sidebarOpen ? 1 : 0,
                                transition: 'opacity 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Journey Map
                        </span>
                    </div>
                    
                    {/* Content - fades in when expanded */}
                    <div
                        style={{
                            opacity: sidebarOpen ? 1 : 0,
                            transition: sidebarOpen ? 'opacity 0.2s ease 0.15s' : 'opacity 0.1s ease',
                            pointerEvents: sidebarOpen ? 'auto' : 'none'
                        }}
                    >
                        <ProgressSidebar
                            currentIndex={gameState.currentLocationIndex}
                            isFlying={isFlying}
                        />
                    </div>
                </button>
            )}
            
            {/* Character Creation UI */}
            {gameState.phase === 'character-creation' && (
                <>
                    <div style={styles.welcomeSection}>
                        <h1 style={styles.welcomeTitle}>Welcome, <span style={styles.playerName}>{playerName}</span></h1>
                        <p style={styles.welcomeText}>
                            Congratulations on making it through the recruitment process, we're thrilled to have you join the team!
                            <br /><br />
                            Before you dive into your new role, we've prepared a little adventure for you 🚀
                        </p>
                    </div>
                    
                    {/* Character Preset Selector */}
                    <div style={styles.presetPanelContainer}>
                        <div style={styles.presetPanel}>
                            <h3 style={styles.presetTitle}>Ready for lift off?</h3>
                            <div style={styles.presetGrid}>
                                {CHARACTER_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset)}
                                        style={{
                                            ...styles.presetButton,
                                            borderColor: selectedPreset.id === preset.id 
                                                ? '#7D00FF' 
                                                : 'rgba(255, 255, 255, 0.2)',
                                            boxShadow: selectedPreset.id === preset.id 
                                                ? '0 0 20px rgba(125, 0, 255, 0.5)' 
                                                : 'none',
                                            background: selectedPreset.id === preset.id
                                                ? 'rgba(125, 0, 255, 0.2)'
                                                : 'rgba(255, 255, 255, 0.05)'
                                        }}
                                    >
                                        <CharacterPreview preset={preset} />
                                        <span style={styles.presetName}>{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Chat Bubble next to character */}
                    <div style={styles.chatBubbleContainer}>
                        <div style={styles.chatBubble}>
                            <span style={styles.chatBubbleText}>{selectedPreset.description}</span>
                        </div>
                    </div>
                    
                    <div style={styles.bottomButtonContainer}>
                        <button 
                            type="button" 
                            style={styles.startButton} 
                            onClick={handleStartGame}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#33005A'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#250041'}
                        >
                            Let's go!
                        </button>
                    </div>
                </>
            )}
            
            {/* Question Panel */}
            {gameState.phase === 'trivia' && currentQuestion && !isFlying && !showVictoryScreen && (
                <QuestionPanel
                    question={currentQuestion}
                    currentLocation={currentLocation}
                    currentIndex={gameState.currentLocationIndex}
                    totalLocations={MOONBASE_ORDER.length}
                    onAnswer={handleAnswer}
                />
            )}
            
            {/* Victory Screen 1: $20 Unlock */}
            {showVictoryScreen === 1 && (
                <div style={styles.victoryOverlay}>
                    <div style={styles.unlockCard}>
                        <div style={styles.moonpayLogo}>
                            <svg width="80" height="80" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="moonpay-logo-title">
                                <title id="moonpay-logo-title">MoonPay Logo</title>
                                <path fill="#7D00FF" d="M14.555 6.928a2.464 2.464 0 1 0 0-4.928 2.464 2.464 0 0 0 0 4.928M6.998 18.025a6.004 6.004 0 1 1 .01-12.008 6.004 6.004 0 0 1-.01 12.008"/>
                            </svg>
                        </div>
                        <h1 style={styles.unlockTitle}>You've unlocked $20 on MoonPay!</h1>
                        <p style={styles.unlockDisclaimer}>
                            The first $20 are on us — expense it on your first day and share your feedback!
                        </p>
                        <button 
                            type="button" 
                            style={styles.unlockButton}
                            onClick={handleVictoryNext}
                        >
                            Wanna see what you get on your first day? →
                        </button>
                    </div>
                </div>
            )}
            
            {/* Victory Screen 2: Perks Page */}
            {showVictoryScreen === 2 && (
                <div style={styles.victoryOverlay}>
                    <div style={styles.perksContent}>
                        <h1 style={styles.perksTitle}>Welcome Aboard, {playerName}! 🚀</h1>
                        <p style={styles.perksSubtitle}>Here's what awaits you at MoonPay</p>
                        
                        <div style={styles.perksGrid}>
                            {PERKS.map((perk) => (
                                <div key={perk.id} style={styles.perkCard}>
                                    <span style={styles.perkIcon}>{perk.icon}</span>
                                    <h3 style={styles.perkTitle}>{perk.title}</h3>
                                    <p style={styles.perkDescription}>{perk.description}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div style={styles.missionSection}>
                            <h2 style={styles.missionTitle}>Our Mission & Vision</h2>
                            <p style={styles.missionText}>
                                Making cryptocurrency accessible to everyone, everywhere. 
                                We're building the bridge between traditional finance and the crypto ecosystem.
                            </p>
                            <div style={styles.missionLinks}>
                                <a href="https://www.moonpay.com/about" target="_blank" rel="noopener noreferrer" style={styles.missionLink}>
                                    Learn More About Us →
                                </a>
                            </div>
                        </div>
                        
                        <button 
                            type="button" 
                            style={styles.restartButton}
                            onClick={() => window.location.reload()}
                        >
                            🔄 Play Again
                        </button>
                    </div>
                </div>
            )}
            
            {/* Flying Saucer Overlay with FYI */}
            <SaucerOverlay 
                key={gameState.currentLocationIndex}
                visible={gameState.phase === 'trivia' && !showVictoryScreen} 
                isFlying={isFlying}
                fyis={locationFYIs}
            />
        </div>
    );
};

// Simple character preview component using canvas
const CharacterPreview = ({ preset }: { preset: CharacterPreset }) => {
    const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const scale = 2.5;
        const spriteWidth = preset.spriteData[0].length * scale;
        const spriteHeight = preset.spriteData.length * scale;
        
        canvas.width = spriteWidth;
        canvas.height = spriteHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let row = 0; row < preset.spriteData.length; row++) {
            for (let col = 0; col < preset.spriteData[row].length; col++) {
                const colorIndex = preset.spriteData[row][col];
                if (colorIndex === 0) continue;
                
                const color = preset.palette[colorIndex];
                if (color === 'transparent') continue;
                
                ctx.fillStyle = color;
                ctx.fillRect(col * scale, row * scale, scale, scale);
            }
        }
    }, [preset]);
    
    return <canvas ref={canvasRef} style={styles.previewCanvas} />;
};

// Flying saucer overlay component with FYI chat bubble
const SaucerOverlay = ({ visible, isFlying, fyis }: { visible: boolean; isFlying: boolean; fyis: string[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const animationStartRef = useRef<number>(0);
    const lastFlyingRef = useRef<boolean>(false);
    const positionRef = useRef<number>(window.innerWidth + 150); // Start off-screen right
    const hasArrivedRef = useRef<boolean>(false); // Track if saucer has arrived at this location
    const [bubbleVisible, setBubbleVisible] = useState(false);
    const [currentFyiIndex, setCurrentFyiIndex] = useState(0);
    const [showEllipsis, setShowEllipsis] = useState(false);
    const [ellipsisCount, setEllipsisCount] = useState(1);
    const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ellipsisTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Reset position when component mounts (new location via key change)
    useEffect(() => {
        positionRef.current = window.innerWidth + 150;
        hasArrivedRef.current = false;
    }, []);
    
    // Handle FYI cycling: 3s FYI -> 2s ellipsis animation -> next FYI
    useEffect(() => {
        if (!visible || isFlying || !bubbleVisible) {
            if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
            if (ellipsisTimerRef.current) clearInterval(ellipsisTimerRef.current);
            const resetTimer = setTimeout(() => setShowEllipsis(false), 0);
            return () => clearTimeout(resetTimer);
        }
        
        const fyiCount = fyis.length;
        let ellipsisPhase = false;
        let ellipsisCounter = 0;
        
        // Main cycle: every 100ms check what phase we're in
        const cycleLength = 6500; // 4.5s FYI + 2s ellipsis
        const startTime = Date.now();
        
        const tick = () => {
            const elapsed = (Date.now() - startTime) % cycleLength;
            
            if (elapsed < 4500) {
                // FYI phase
                if (ellipsisPhase) {
                    ellipsisPhase = false;
                    setShowEllipsis(false);
                    setCurrentFyiIndex(prev => (prev + 1) % fyiCount);
                }
            } else {
                // Ellipsis phase
                if (!ellipsisPhase) {
                    ellipsisPhase = true;
                    setShowEllipsis(true);
                    ellipsisCounter = 0;
                }
                // Update ellipsis dots
                const ellipsisElapsed = elapsed - 4500;
                const newCount = Math.min(3, Math.floor(ellipsisElapsed / 400) % 3 + 1);
                if (newCount !== ellipsisCounter) {
                    ellipsisCounter = newCount;
                    setEllipsisCount(newCount);
                }
            }
        };
        
        ellipsisTimerRef.current = setInterval(tick, 100);
        
        return () => {
            if (ellipsisTimerRef.current) clearInterval(ellipsisTimerRef.current);
        };
    }, [visible, isFlying, bubbleVisible, fyis.length]);
    
    // Handle bubble visibility with timer
    useEffect(() => {
        // Reset position when not visible OR when we stop flying (arrived at new location)
        if (!visible || !isFlying) {
            // If we just stopped flying or became visible, reset position to come from right
            if (visible && !isFlying) {
                positionRef.current = window.innerWidth + 150;
                hasArrivedRef.current = false;
            }
        }
        
        if (!visible || isFlying) {
            const hideTimer = setTimeout(() => setBubbleVisible(false), 0);
            return () => clearTimeout(hideTimer);
        }
        
        // Show bubble after saucer arrives (approx 1.5s for slower flight)
        const showTimer = setTimeout(() => {
            setBubbleVisible(true);
        }, 1500);
        
        return () => clearTimeout(showTimer);
    }, [visible, isFlying]);
    
    useEffect(() => {
        if (!visible) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);
        
        // Detect transition to flying
        if (isFlying && !lastFlyingRef.current) {
            animationStartRef.current = performance.now();
        }
        // Detect transition from flying to not flying (arrived at new location)
        if (!isFlying && lastFlyingRef.current) {
            positionRef.current = window.innerWidth + 150;
            hasArrivedRef.current = false;
        }
        lastFlyingRef.current = isFlying;
        
        const render = (time: number) => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);
            
            const targetX = width - 200; // Stop 200px from right
            const saucerY = height * 0.35 - 70; // 70px higher
            
            // Calculate opacity (fade out when flying/leaving)
            let opacity = 1;
            if (isFlying) {
                // Fade out over 600ms
                const fadeProgress = Math.min(1, (time - animationStartRef.current) / 600);
                opacity = 1 - fadeProgress;
            }
            
            // Position logic (no exit movement, just approach and drift)
            if (!isFlying) {
                if (positionRef.current > targetX) {
                    // Fast approach to target
                    const diff = targetX - positionRef.current;
                    positionRef.current += diff * 0.03;
                } else {
                    // Slow drift to the left
                    positionRef.current -= 0.15;
                }
            }
            
            // Wobbly hover animation
            const hoverOffset = Math.sin(time / 400) * 6 + Math.sin(time / 250) * 3;
            const wobbleX = Math.sin(time / 300) * 8;
            const tilt = Math.sin(time / 500) * 0.05;
            
            // Tilt based on movement
            const movementTilt = positionRef.current > targetX + 50 ? -0.08 : tilt;
            
            // Apply opacity
            ctx.globalAlpha = opacity;
            
            drawAlienSaucer(
                ctx, 
                positionRef.current + wobbleX, 
                saucerY + hoverOffset, 
                time / 1000, 
                mouseRef.current.x, 
                mouseRef.current.y, 
                movementTilt * 1000
            );
            
            // Reset alpha
            ctx.globalAlpha = 1;
            
            animationRef.current = requestAnimationFrame(render);
        };
        
        animationRef.current = requestAnimationFrame(render);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [visible, isFlying]);
    
    if (!visible) return null;
    
    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1000
                }}
            />
            {/* Chat bubble - positioned to the left of the alien */}
            <div style={{
                position: 'absolute',
                right: 270,
                top: 'calc(35% - 80px)',
                maxWidth: 300,
                padding: '12px 16px',
                background: 'rgba(125, 0, 255, 0.95)',
                borderRadius: 12,
                borderBottomRightRadius: 4,
                color: 'white',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 13,
                lineHeight: 1.5,
                pointerEvents: 'none',
                zIndex: 1001,
                opacity: bubbleVisible ? 1 : 0,
                transform: `translateX(${bubbleVisible ? 0 : -20}px)`,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                boxShadow: '0 4px 20px rgba(125, 0, 255, 0.4)'
            }}>
                {showEllipsis ? '.'.repeat(ellipsisCount) : fyis[currentFyiIndex]}
            </div>
        </>
    );
};

// Perks data
const PERKS = [
    { id: 'health', icon: '🏥', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
    { id: 'equity', icon: '📈', title: 'Equity Bonus', description: 'Eligibility for equity bonus as part of compensation' },
    { id: 'offsites', icon: '✈️', title: 'Team Offsites', description: 'Quarterly team gatherings in exciting locations' },
    { id: 'swag', icon: '👕', title: 'MoonPay Swag', description: 'Welcome kit with exclusive MoonPay merchandise' },
    { id: 'wallet', icon: '💰', title: 'Wallet Allowance', description: 'Monthly MoonPay wallet allowance for crypto' },
    { id: 'office', icon: '🖥️', title: 'Home Office', description: 'Equipment budget for your home workspace' },
    { id: 'ld', icon: '📚', title: 'L&D Budget', description: 'Learning & Development budget for growth' },
    { id: 'pension', icon: '🏦', title: 'Pension Schemes', description: 'Competitive pension/retirement contributions' },
    { id: 'lunches', icon: '🍽️', title: 'On-site Lunches', description: 'Free lunches at all MoonBase locations' },
];

const FONT_FAMILY = "'Space Grotesk', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY,
        backgroundColor: '#080510'
    },
    welcomeSection: {
        position: 'absolute',
        top: 195,
        left: 90,
        zIndex: 10,
        pointerEvents: 'none'
    },
    welcomeTitle: {
        color: '#FFF',
        fontSize: 67,
        fontWeight: 700,
        margin: 0,
        fontFamily: "'Roboto Slab', serif"
    },
    playerName: {
        textTransform: 'capitalize'
    },
    welcomeText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 400,
        marginTop: 18,
        lineHeight: 1.7,
        maxWidth: 496,
        fontFamily: "'Roboto', sans-serif"
    },
    presetPanelContainer: {
        position: 'absolute',
        right: 27,
        top: 217,
        zIndex: 10
    },
    presetPanel: {
        background: 'rgba(13, 10, 29, 0.5)',
        borderRadius: 11,
        padding: 20,
        width: 340
    },
    presetTitle: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 500,
        margin: '0 0 16px 0',
        textAlign: 'center',
        fontFamily: "'Roboto Slab', serif"
    },
    presetGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10
    },
    presetButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 10,
        border: '2px solid',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: 95,
        minWidth: 70
    },
    previewCanvas: {
        width: 40,
        height: 60,
        imageRendering: 'pixelated'
    },
    presetName: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 600,
        marginTop: 6,
        fontFamily: FONT_FAMILY,
        textAlign: 'center'
    },
    chatBubbleContainer: {
        position: 'absolute',
        left: '50%',
        top: '30%',
        transform: 'translateX(20px)',
        zIndex: 10
    },
    chatBubble: {
        background: 'linear-gradient(135deg, rgba(125, 0, 255, 0.35) 0%, rgba(90, 0, 153, 0.3) 100%)',
        border: '2px solid rgba(125, 0, 255, 0.6)',
        borderRadius: 16,
        padding: '16px 20px',
        maxWidth: 280,
        boxShadow: '0 4px 20px rgba(125, 0, 255, 0.3)',
        backdropFilter: 'blur(10px)'
    },
    chatBubbleText: {
        color: '#E0FFE0',
        fontSize: 16,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
        lineHeight: 1.6,
        display: 'block',
        textAlign: 'left'
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 88,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
    },
    startButton: {
        width: 218,
        height: 57,
        fontSize: 20,
        fontWeight: 600,
        lineHeight: '25px',
        color: '#FFF',
        background: '#250041',
        border: 'none',
        borderRadius: 37,
        cursor: 'pointer',
        fontFamily: "'Roboto', sans-serif",
        transition: 'background 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
        justifyContent: 'center',
        backgroundColor: 'rgba(8, 5, 16, 0.95)',
        fontFamily: FONT_FAMILY,
        zIndex: 100,
        overflowY: 'auto',
        padding: 40
    },
    unlockCard: {
        background: 'linear-gradient(135deg, rgba(125, 0, 255, 0.2) 0%, rgba(90, 0, 153, 0.2) 100%)',
        border: '2px solid rgba(125, 0, 255, 0.4)',
        borderRadius: 24,
        padding: 48,
        maxWidth: 500,
        textAlign: 'center',
        boxShadow: '0 0 60px rgba(125, 0, 255, 0.3)'
    },
    moonpayLogo: {
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'center'
    },
    unlockTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 16,
        fontFamily: FONT_FAMILY
    },
    unlockDisclaimer: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        lineHeight: 1.6,
        marginBottom: 32,
        fontFamily: FONT_FAMILY
    },
    unlockButton: {
        padding: '16px 32px',
        fontSize: 16,
        fontWeight: 600,
        color: '#FFF',
        background: 'linear-gradient(135deg, #7D00FF 0%, #5a0099 100%)',
        border: 'none',
        borderRadius: 30,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
        transition: 'transform 0.2s ease'
    },
    perksContent: {
        maxWidth: 900,
        width: '100%',
        textAlign: 'center'
    },
    perksTitle: {
        color: '#FFD700',
        fontSize: 36,
        fontWeight: 700,
        marginBottom: 8,
        fontFamily: FONT_FAMILY
    },
    perksSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        marginBottom: 32,
        fontFamily: FONT_FAMILY
    },
    perksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 32
    },
    perkCard: {
        background: 'rgba(125, 0, 255, 0.1)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 16,
        padding: 20,
        textAlign: 'center'
    },
    perkIcon: {
        fontSize: 32,
        display: 'block',
        marginBottom: 12
    },
    perkTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 8,
        fontFamily: FONT_FAMILY
    },
    perkDescription: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        lineHeight: 1.5,
        margin: 0,
        fontFamily: FONT_FAMILY
    },
    missionSection: {
        background: 'rgba(125, 0, 255, 0.15)',
        border: '1px solid rgba(125, 0, 255, 0.4)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32
    },
    missionTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 12,
        fontFamily: FONT_FAMILY
    },
    missionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        lineHeight: 1.7,
        marginBottom: 16,
        fontFamily: FONT_FAMILY
    },
    missionLinks: {
        display: 'flex',
        justifyContent: 'center',
        gap: 24
    },
    missionLink: {
        color: '#B366FF',
        fontSize: 14,
        fontWeight: 600,
        textDecoration: 'none',
        fontFamily: FONT_FAMILY
    },
    restartButton: {
        padding: '14px 28px',
        fontSize: 16,
        fontWeight: 600,
        color: '#FFF',
        background: 'linear-gradient(135deg, #7D00FF 0%, #5a0099 100%)',
        border: 'none',
        borderRadius: 30,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
        boxShadow: '0 4px 20px rgba(125, 0, 255, 0.5)'
    }
};

export default Game2D;

