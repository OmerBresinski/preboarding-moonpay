import { useState, useCallback, useRef } from 'react';
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
import GameCanvas2D from './GameCanvas2D';
import ProgressSidebar from './ProgressSidebar';
import QuestionPanel from './QuestionPanel';

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
    const [moonRevealed, setMoonRevealed] = useState(false);
    
    // NYC index - moon reveals when we arrive here
    const NYC_INDEX = 4;
    
    // Animation progress ref
    const transitionProgressRef = useRef<number>(0);
    
    // Load new question
    const loadNewQuestion = useCallback((answeredQuestions: number[]) => {
        const question = getRandomQuestion(answeredQuestions);
        setCurrentQuestion(question);
    }, []);
    
    // Handle transition complete
    const handleTransitionComplete = useCallback(() => {
        setIsFlying(false);
        transitionProgressRef.current = 0;
        
        // Reveal moon when we arrive at NYC
        if (gameState.currentLocationIndex >= NYC_INDEX && !moonRevealed) {
            setMoonRevealed(true);
        }
        
        // Check if we reached the moon
        if (gameState.phase === 'victory') {
            setShowVictoryScreen(1);
        }
    }, [gameState.phase, gameState.currentLocationIndex, moonRevealed]);
    
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
            
            {/* Progress Sidebar */}
            {gameState.phase !== 'character-creation' && !showVictoryScreen && (
                <ProgressSidebar
                    currentIndex={gameState.currentLocationIndex}
                    isFlying={isFlying}
                    moonRevealed={moonRevealed}
                />
            )}
            
            {/* Character Creation UI */}
            {gameState.phase === 'character-creation' && (
                <>
                    <div style={styles.creationOverlay}>
                        <div style={styles.creationCard}>
                            <h1 style={styles.welcomeTitle}>Welcome to MoonPay, {playerName}! 🎉</h1>
                            <p style={styles.welcomeText}>
                                Congratulations on making it through the recruitment process — we're thrilled to have you join the team!
                                <br /><br />
                                Before you dive into your new role, we've prepared a little adventure for you.
                                Journey through MoonPay's global offices, from London all the way to the moon!
                            </p>
                        </div>
                    </div>
                    
                    {/* Character Preset Selector */}
                    <div style={styles.presetPanelContainer}>
                        <div style={styles.presetPanel}>
                            <h3 style={styles.presetTitle}>🚀 Choose Your Astronaut</h3>
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
                            <p style={styles.presetDescription}>{selectedPreset.description}</p>
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
                        <div style={styles.moonpayLogo}>🌙</div>
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
        </div>
    );
};

// Simple character preview component using canvas
const CharacterPreview = ({ preset }: { preset: CharacterPreset }) => {
    const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const scale = 2;
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
    creationOverlay: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        padding: '0 20px',
        zIndex: 10
    },
    creationCard: {
        background: 'rgba(13, 11, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 20,
        padding: '30px 40px',
        maxWidth: 600,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)'
    },
    welcomeTitle: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 700,
        margin: 0,
        fontFamily: FONT_FAMILY
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 15,
        fontWeight: 400,
        marginTop: 16,
        lineHeight: 1.7,
        fontFamily: FONT_FAMILY
    },
    presetPanelContainer: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10
    },
    presetPanel: {
        background: 'rgba(13, 11, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 16,
        padding: '16px',
        minWidth: 340,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)'
    },
    presetTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 700,
        margin: '0 0 16px 0',
        textAlign: 'center',
        fontFamily: FONT_FAMILY
    },
    presetGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        maxWidth: 320
    },
    presetButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 6,
        border: '2px solid',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    previewCanvas: {
        width: 32,
        height: 48,
        imageRendering: 'pixelated'
    },
    presetName: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 600,
        marginTop: 4,
        fontFamily: FONT_FAMILY
    },
    presetDescription: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 0,
        fontFamily: FONT_FAMILY
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
    },
    startButton: {
        padding: '16px 40px',
        fontSize: 18,
        fontWeight: 600,
        color: '#FFF',
        background: 'linear-gradient(135deg, #7D00FF 0%, #5a0099 100%)',
        border: 'none',
        borderRadius: 30,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(125, 0, 255, 0.5)',
        fontFamily: FONT_FAMILY,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
        fontSize: 64,
        marginBottom: 24
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

