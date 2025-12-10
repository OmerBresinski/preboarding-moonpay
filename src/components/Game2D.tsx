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
    const [showVictoryScreen, setShowVictoryScreen] = useState<boolean>(false);
    const [activePerkIndex, setActivePerkIndex] = useState(0);
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
            setShowVictoryScreen(true);
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
    
    // Carousel navigation
    const nextPerk = () => {
        setActivePerkIndex((prev) => (prev + 1) % PERKS.length);
    };

    const prevPerk = () => {
        setActivePerkIndex((prev) => (prev - 1 + PERKS.length) % PERKS.length);
    };

    // Handle Victory Next - removed as we only have one screen now
    // const handleVictoryNext = useCallback(() => { ... });

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
                        height: sidebarOpen ? 338 : 58,
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
            
            {/* Victory Screen: Welcome Aboard */}
            {showVictoryScreen && (
                <div style={styles.victoryOverlay}>
                    <h1 style={styles.victoryTitle}>
                        Welcome Aboard, <span style={{ textTransform: 'capitalize' }}>{playerName}</span> 🚀
                    </h1>
                    <p style={styles.victorySubtitle}>Here's what awaits you at MoonPay</p>

                    {/* Benefits Carousel */}
                    <div style={styles.carouselContainer}>
                        {/* Navigation Buttons */}
                        <div style={{ ...styles.carouselNavButton, left: 0 }} onClick={prevPerk}>
                            ←
                        </div>
                        <div style={{ ...styles.carouselNavButton, right: 0 }} onClick={nextPerk}>
                            →
                        </div>

                        {/* Cards */}
                        {PERKS.map((perk, index) => {
                            // Calculate relative position
                            const total = PERKS.length;
                            // Calculate circular distance
                            let offset = index - activePerkIndex;
                            if (offset > total / 2) offset -= total;
                            if (offset < -total / 2) offset += total;
                            
                            // Only show neighbors (range -2 to 2)
                            if (Math.abs(offset) > 2) return null;
                            
                            // Calculate styles based on offset
                            const isActive = offset === 0;
                            const xTrans = offset * 140; // 140px separation
                            const zTrans = Math.abs(offset) * -50; // Push back
                            // Rotate logic: negative offset (left) -> rotate positive (towards center) ? 
                            // Standard fan: left items rotate left (negative), right items rotate right (positive)
                            // Screenshot shows left item rotated clockwise (positive?) No, left item top is tilted left.
                            // Let's try: left item (negative offset) -> rotate -10deg.
                            const rotate = offset * 5; 
                            const scale = isActive ? 1.1 : 1 - Math.abs(offset) * 0.15;
                            const opacity = isActive ? 1 : 1 - Math.abs(offset) * 0.4;
                            const zIndex = 10 - Math.abs(offset);

                            return (
                                <div 
                                    key={perk.id}
                                    style={{
                                        ...styles.carouselCardBase,
                                        transform: `translateX(${xTrans}px) translateZ(${zTrans}px) rotateZ(${rotate}deg) scale(${scale})`,
                                        opacity,
                                        zIndex
                                    }}
                                >
                                    <span style={styles.perkIcon}>{perk.icon}</span>
                                    <h3 style={styles.perkTitle}>{perk.title}</h3>
                                    <p style={styles.perkDescription}>{perk.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        type="button" 
                        style={styles.playAgainButton}
                        onClick={() => window.location.reload()}
                    >
                        Play Again
                    </button>

                    {/* Mission Footer */}
                    <div style={styles.missionBox}>
                        <h3 style={styles.missionTitle}>Our Mission & Vision</h3>
                        <p style={styles.missionText}>
                            Making cryptocurrency accessible to everyone, everywhere. 
                            We're building the bridge between traditional finance and the crypto ecosystem.
                        </p>
                        <div style={styles.missionLinks}>
                            <a href="https://www.moonpay.com/about" target="_blank" rel="noopener noreferrer" style={styles.missionLink}>Learn More About Us →</a>
                            <a href="https://www.moonpay.com/about" target="_blank" rel="noopener noreferrer" style={styles.missionLink}>Learn More About Us →</a>
                            <a href="https://www.moonpay.com/about" target="_blank" rel="noopener noreferrer" style={styles.missionLink}>Learn More About Us →</a>
                            <a href="https://www.moonpay.com/about" target="_blank" rel="noopener noreferrer" style={styles.missionLink}>Learn More About Us →</a>
                        </div>
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
    const bubbleRef = useRef<HTMLDivElement>(null);
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
            
            const targetX = width - 350; // Stop 250px from right (was 200px)
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

            // Update bubble position to follow alien
            if (bubbleRef.current) {
                // Alien center X (approximate based on sprite width)
                // Sprite is ~30px wide * 2.7 scale ≈ 80px. Center is +40px.
                const alienHeadX = positionRef.current + wobbleX + 40;
                
                // Alien top Y (dome top)
                // Dome starts at y=5 * 2.7 ≈ 13.5px offset. 
                const alienHeadY = saucerY + hoverOffset + 10;

                bubbleRef.current.style.left = `${alienHeadX}px`;
                bubbleRef.current.style.top = `${alienHeadY - 20}px`; // 20px over the head
            }
            
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
            <div 
                ref={bubbleRef}
                style={{
                    position: 'absolute',
                    // right/top removed, controlled by JS
                    maxWidth: 200,
                    padding: '12px 16px',
                    background: 'linear-gradient(180deg, rgba(60, 21, 112, 0.94) 0%, rgba(50, 18, 91, 0.94) 100%)',
                    borderRadius: 8,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 4,
                    border: '1px solid #5813A8',
                    color: 'white',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 13,
                    lineHeight: 1.5,
                    pointerEvents: 'none',
                    zIndex: 1001,
                    opacity: bubbleVisible ? 1 : 0,
                    transform: `translate(${bubbleVisible ? 0 : -20}px, -100%)`, // -100% Y to position bottom-left corner at target
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    boxShadow: '0 0 12px 2px rgba(104, 40, 167, 0.42)' // #6828A76B
                }}
            >
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
        // justifyContent: 'center', // Removed to allow top positioning
        paddingTop: 62, // Position content from top
        backgroundColor: '#080510',
        zIndex: 100,
        overflow: 'hidden'
    },
    victoryTitle: {
        color: '#FFF',
        fontSize: 55,
        fontWeight: 700,
        marginBottom: 11,
        marginTop: 0,
        fontFamily: "'Roboto Slab', serif",
        textAlign: 'center'
    },
    victorySubtitle: {
        color: '#B3B3B3',
        fontSize: 22,
        fontWeight: 400,
        marginBottom: 60,
        marginTop: 0,
        fontFamily: "'Roboto', sans-serif",
        textAlign: 'center'
    },
    carouselContainer: {
        position: 'relative',
        width: 1000,
        height: 380,
        marginBottom: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1000px'
    },
    carouselCardBase: {
        position: 'absolute',
        width: 237,
        height: 287,
        background: '#21073C',
        // Gradient border trick with border-radius
        backgroundImage: 'linear-gradient(#21073C, #21073C), linear-gradient(210.41deg, #3E006A 3.36%, #7B16C5 55.34%, #3E006A 98.21%)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        border: '1px solid transparent',
        borderRadius: 10,
        padding: '40px 24px', // 40px top padding
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        transformOrigin: 'bottom center',
        boxSizing: 'border-box'
    },
    carouselNavButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3E006A 0%, #5813A8 100%)',
        border: '1px solid rgba(125, 0, 255, 0.5)',
        color: '#FFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 20,
        transition: 'all 0.2s',
        fontSize: 20,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    playAgainButton: {
        padding: '16px 48px',
        fontSize: 16,
        fontWeight: 600,
        color: '#FFF',
        background: 'linear-gradient(90deg, #2D0B5A 0%, #4B1296 100%)',
        border: '1px solid rgba(125, 0, 255, 0.5)',
        borderRadius: 30,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
        marginBottom: 100,
        boxShadow: '0 0 30px rgba(125, 0, 255, 0.2)',
        transition: 'all 0.2s'
    },
    missionBox: {
        width: '100%',
        maxWidth: 800,
        background: 'linear-gradient(180deg, rgba(20, 10, 40, 0.95) 0%, rgba(10, 5, 20, 0.95) 100%)',
        border: '1px solid rgba(125, 0, 255, 0.2)',
        borderRadius: 12,
        padding: '24px 40px',
        textAlign: 'center',
        position: 'absolute',
        bottom: 40
    },
    missionTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 12,
        fontFamily: FONT_FAMILY
    },
    missionText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        lineHeight: 1.6,
        marginBottom: 16,
        fontFamily: FONT_FAMILY,
        maxWidth: 600,
        margin: '0 auto 16px auto'
    },
    missionLinks: {
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        flexWrap: 'wrap'
    },
    missionLink: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        textDecoration: 'none',
        fontFamily: FONT_FAMILY,
        transition: 'color 0.2s'
    },
    perkIcon: {
        fontSize: 25, // Fallback if emoji
        width: 25,    // For image/svg icons
        marginBottom: 18,
        display: 'block'
    },
    perkTitle: {
        color: '#EAD9FC',
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 40,
        fontFamily: "'Roboto', sans-serif"
    },
    perkDescription: {
        color: '#CEB5E7',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
        margin: 0,
        fontFamily: "'Roboto', sans-serif"
    }
};

export default Game2D;

