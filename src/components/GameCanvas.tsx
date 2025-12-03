import type React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { drawCharacter, drawLandmark, COLORS } from '../utils/sprites';
import type { CharacterConfig, LandmarkType } from '../utils/sprites';
import type { GameState } from '../utils/gameState';
import { createInitialGameState, getCurrentLandmark, advanceToNextLandmark, startGame, LANDMARKS } from '../utils/gameState';
import type { TriviaQuestion } from '../utils/triviaQuestions';
import { getRandomQuestion } from '../utils/triviaQuestions';
import QuestionPanel from './QuestionPanel';

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const frameRef = useRef(0); // Persistent frame counter for animations
    
    // Animation refs (don't trigger re-renders)
    const scrollOffsetRef = useRef(0);
    const characterYRef = useRef(0);
    const flameFrameRef = useRef(0);
    const prevLandmarkIndexRef = useRef(0); // Track previous landmark for transitions
    
    // Get player name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name') || 'Player';
    
    // Game state
    const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(playerName));
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    
    // Character customization
    const [characterConfig, setCharacterConfig] = useState<CharacterConfig>({
        headIndex: 0,
        torsoIndex: 0,
        legsIndex: 0
    });
    
    // Animation state (only for triggering renders when needed)
    const [isFlying, setIsFlying] = useState(false);
    
    // Load new question
    const loadNewQuestion = useCallback((answeredQuestions: number[]) => {
        const question = getRandomQuestion(answeredQuestions);
        setCurrentQuestion(question);
    }, []);
    
    // Handle correct answer - trigger flight animation
    const handleAnswer = useCallback((isCorrect: boolean) => {
        if (!isCorrect) return;
        
        // Save current landmark index before transitioning
        prevLandmarkIndexRef.current = gameState.currentLandmarkIndex;
        
        // Start flight animation
        setIsFlying(true);
        scrollOffsetRef.current = 0; // Reset animation progress
        
        // After animation, advance to next landmark
        setTimeout(() => {
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
            setIsFlying(false);
            characterYRef.current = 0;
        }, 2000);
    }, [currentQuestion, loadNewQuestion, gameState.currentLandmarkIndex]);
    
    // Start game
    const handleStartGame = useCallback(() => {
        setGameState(prev => {
            const newState = startGame(prev);
            loadNewQuestion(newState.answeredQuestions);
            return newState;
        });
    }, [loadNewQuestion]);
    
    // Character customization
    const cycleOption = (type: 'head' | 'torso' | 'legs', direction: 'left' | 'right') => {
        const delta = direction === 'right' ? 1 : -1;
        setCharacterConfig(prev => {
            const key = `${type}Index` as keyof CharacterConfig;
            let newVal = prev[key] + delta;
            if (newVal < 0) newVal = 5;
            if (newVal > 5) newVal = 0;
            return { ...prev, [key]: newVal };
        });
    };
    
    // Main render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const render = () => {
            frameRef.current++;
            
            // Update canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - 150; // Leave room for question panel
            
            const w = canvas.width;
            const h = canvas.height;
            
            // Helper function to calculate sky colors for a given landmark index
            const getSkyColors = (idx: number): { color1: string, color2: string, isSpace: boolean } => {
                const isSpaceScene = idx >= 4; // ISS and Moon
                if (isSpaceScene) {
                    return { color1: COLORS.skySpace, color2: '#000', isSpace: true };
                }
                const sunsetProgress = idx / 3;
                const dayColor = { r: 135, g: 206, b: 235 };
                const sunsetColor = { r: 253, g: 94, b: 83 };
                const r = Math.round(dayColor.r + (sunsetColor.r - dayColor.r) * sunsetProgress);
                const g = Math.round(dayColor.g + (sunsetColor.g - dayColor.g) * sunsetProgress);
                const b = Math.round(dayColor.b + (sunsetColor.b - dayColor.b) * sunsetProgress);
                return {
                    color1: `rgb(${r}, ${g}, ${b})`,
                    color2: `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 30)})`,
                    isSpace: false
                };
            };
            
            // Calculate sky color based on landmark index (with transition support)
            let skyColor1: string, skyColor2: string;
            let isSpace: boolean;
            let starsAlpha = 0;
            let cloudsAlpha = 0.7;
            
            if (isFlying && gameState.phase !== 'victory') {
                // Animate sky during transition
                const progress = scrollOffsetRef.current;
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                const prevSky = getSkyColors(prevLandmarkIndexRef.current);
                const nextSky = getSkyColors(Math.min(prevLandmarkIndexRef.current + 1, 5));
                
                // Interpolate colors
                const parseRgb = (str: string) => {
                    const match = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (match) return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
                    if (str === COLORS.skySpace) return { r: 10, g: 10, b: 46 };
                    return { r: 0, g: 0, b: 0 };
                };
                
                const prev1 = parseRgb(prevSky.color1);
                const next1 = parseRgb(nextSky.color1);
                const prev2 = parseRgb(prevSky.color2);
                const next2 = parseRgb(nextSky.color2);
                
                skyColor1 = `rgb(${Math.round(prev1.r + (next1.r - prev1.r) * easeOut)}, ${Math.round(prev1.g + (next1.g - prev1.g) * easeOut)}, ${Math.round(prev1.b + (next1.b - prev1.b) * easeOut)})`;
                skyColor2 = `rgb(${Math.round(prev2.r + (next2.r - prev2.r) * easeOut)}, ${Math.round(prev2.g + (next2.g - prev2.g) * easeOut)}, ${Math.round(prev2.b + (next2.b - prev2.b) * easeOut)})`;
                
                // Transition stars and clouds
                isSpace = nextSky.isSpace;
                if (prevSky.isSpace !== nextSky.isSpace) {
                    starsAlpha = nextSky.isSpace ? easeOut : (1 - easeOut);
                    cloudsAlpha = nextSky.isSpace ? 0.7 * (1 - easeOut) : 0.7 * easeOut;
                } else {
                    starsAlpha = nextSky.isSpace ? 1 : 0;
                    cloudsAlpha = nextSky.isSpace ? 0 : 0.7;
                }
            } else {
                const landmarkIndex = gameState.currentLandmarkIndex;
                const sky = getSkyColors(landmarkIndex);
                skyColor1 = sky.color1;
                skyColor2 = sky.color2;
                isSpace = sky.isSpace;
                starsAlpha = isSpace ? 1 : 0;
                cloudsAlpha = isSpace ? 0 : 0.7;
            }
            
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, skyColor1);
            gradient.addColorStop(1, skyColor2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
            
            // Stars for space scenes (with alpha for transitions)
            if (starsAlpha > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${starsAlpha})`;
                for (let i = 0; i < 100; i++) {
                    const sx = (Math.sin(i * 123.456 + frameRef.current * 0.001) * 0.5 + 0.5) * w;
                    const sy = (Math.cos(i * 789.012) * 0.5 + 0.5) * h;
                    const size = 1 + Math.sin(frameRef.current * 0.05 + i) * 0.5;
                    ctx.beginPath();
                    ctx.arc(sx, sy, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Clouds for day scenes (with alpha for transitions)
            if (cloudsAlpha > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${cloudsAlpha})`;
                for (let i = 0; i < 5; i++) {
                    const cx = ((i * 300 + frameRef.current * 0.2) % (w + 200)) - 100;
                    const cy = 50 + i * 40;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
                    ctx.arc(cx + 25, cy - 10, 25, 0, Math.PI * 2);
                    ctx.arc(cx + 50, cy, 35, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Character creation UI - only show character customization
            if (gameState.phase === 'character-creation') {
                // Draw character in center for customization
                const charCenterX = w / 2;
                const charCenterY = h / 2 + 40; // Shifted down to make room for text
                drawCharacter(ctx, charCenterX, charCenterY, characterConfig, 2, false, 0);
                
                // Arrow positions - character parts at scale 2:
                // Head center: -55 * 2 = -110, Torso center: -22 * 2 = -44, Legs center: 12 * 2 = 24
                const leftArrowX = charCenterX - 80;
                const rightArrowX = charCenterX + 60;
                
                ctx.fillStyle = COLORS.mpPurple;
                ctx.font = 'bold 36px Plus Jakarta Sans, Arial';
                ctx.textBaseline = 'middle';
                
                // Head arrows (y = charCenterY - 110)
                const headY = charCenterY - 110;
                ctx.fillText('◀', leftArrowX, headY);
                ctx.fillText('▶', rightArrowX, headY);
                
                // Torso arrows (y = charCenterY - 44)
                const torsoY = charCenterY - 44;
                ctx.fillText('◀', leftArrowX, torsoY);
                ctx.fillText('▶', rightArrowX, torsoY);
                
                // Legs arrows (y = charCenterY + 24)
                const legsY = charCenterY + 24;
                ctx.fillText('◀', leftArrowX, legsY);
                ctx.fillText('▶', rightArrowX, legsY);
            } else {
                // Game phase - show landmarks and character
                const currentLandmark = getCurrentLandmark(gameState) as LandmarkType;
                const scale = Math.min(w / 600, h / 400) * 0.8;
                
                // Landmark types array for lookup
                const landmarkTypes: LandmarkType[] = ['yacht', 'statue-of-liberty', 'eiffel-tower', 'burj-khalifa', 'iss', 'moon'];
                
                // Target landmark position
                const targetLandmarkX = w / 2 + 100;
                const landmarkY = h * 0.65;
                
                // Character position relative to landmark (top-left of landmark)
                const charOffsetX = -180 * scale;
                const charOffsetY = -220 * scale;
                const charScale = scale * 0.7;
                
                if (isFlying && gameState.phase !== 'victory') {
                    // Animate landmark sliding in from right during flight
                    scrollOffsetRef.current += 0.015; // Progress from 0 to 1
                    if (scrollOffsetRef.current > 1) scrollOffsetRef.current = 1;
                    flameFrameRef.current++;
                    
                    // Ease out the landmark position
                    const progress = scrollOffsetRef.current;
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    
                    // Old landmark slides out to left, new landmark slides in from right
                    const oldLandmarkX = targetLandmarkX - (easeOut * w * 0.6);
                    const newLandmarkX = targetLandmarkX + ((1 - easeOut) * w * 0.8);
                    
                    // Get the previous landmark (the one we're leaving)
                    const prevLandmark = landmarkTypes[prevLandmarkIndexRef.current];
                    // Get the next landmark (the one we're going to)
                    const nextLandmarkIndex = Math.min(prevLandmarkIndexRef.current + 1, landmarkTypes.length - 1);
                    const nextLandmark = landmarkTypes[nextLandmarkIndex];
                    
                    // Draw old landmark (fading out, sliding left)
                    ctx.globalAlpha = 1 - easeOut;
                    drawLandmark(ctx, prevLandmark, oldLandmarkX, landmarkY, scale);
                    ctx.globalAlpha = 1;
                    
                    // Draw new landmark (fading in, sliding in from right)
                    ctx.globalAlpha = easeOut;
                    drawLandmark(ctx, nextLandmark, newLandmarkX, landmarkY, scale);
                    ctx.globalAlpha = 1;
                    
                    // Draw flying character with jetpack (positioned relative to new landmark)
                    const charX = newLandmarkX + charOffsetX;
                    const charY = landmarkY + charOffsetY;
                    drawCharacter(ctx, charX, charY, characterConfig, charScale, true, flameFrameRef.current);
                } else {
                    // Reset scroll for next transition
                    scrollOffsetRef.current = 0;
                    
                    // Draw current landmark
                    drawLandmark(ctx, currentLandmark, targetLandmarkX, landmarkY, scale);
                    
                    // Character position (top-left of landmark)
                    const charX = targetLandmarkX + charOffsetX;
                    const charY = landmarkY + charOffsetY;
                    
                    // Idle bob animation
                    const bobOffset = gameState.phase === 'trivia' ? Math.sin(frameRef.current * 0.05) * 3 : 0;
                    
                    // Draw character (not flying) - show even on victory for moon scene
                    drawCharacter(ctx, charX, charY + bobOffset, characterConfig, charScale, false, 0);
                }
            }
            
            animationRef.current = requestAnimationFrame(render);
        };
        
        render();
        
        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [gameState, characterConfig, isFlying]);
    
    // Handle canvas clicks for character customization
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (gameState.phase !== 'character-creation') return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Scale click coordinates to match canvas internal dimensions
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 40; // Match the shifted character position
        
        // Arrow positions (must match exactly what's drawn in render)
        const leftArrowX = centerX - 80;
        const rightArrowX = centerX + 60;
        
        // Click hit areas - generous padding around each arrow
        const hitPadding = 35;
        
        // Head row (y = centerY - 110)
        const headY = centerY - 110;
        if (y > headY - hitPadding && y < headY + hitPadding) {
            if (x > leftArrowX - hitPadding && x < leftArrowX + hitPadding) {
                cycleOption('head', 'left');
                return;
            }
            if (x > rightArrowX - hitPadding && x < rightArrowX + hitPadding) {
                cycleOption('head', 'right');
                return;
            }
        }
        
        // Torso row (y = centerY - 44)
        const torsoY = centerY - 44;
        if (y > torsoY - hitPadding && y < torsoY + hitPadding) {
            if (x > leftArrowX - hitPadding && x < leftArrowX + hitPadding) {
                cycleOption('torso', 'left');
                return;
            }
            if (x > rightArrowX - hitPadding && x < rightArrowX + hitPadding) {
                cycleOption('torso', 'right');
                return;
            }
        }
        
        // Legs row (y = centerY + 24)
        const legsY = centerY + 24;
        if (y > legsY - hitPadding && y < legsY + hitPadding) {
            if (x > leftArrowX - hitPadding && x < leftArrowX + hitPadding) {
                cycleOption('legs', 'left');
                return;
            }
            if (x > rightArrowX - hitPadding && x < rightArrowX + hitPadding) {
                cycleOption('legs', 'right');
                return;
            }
        }
    };
    
    return (
        <div style={styles.container}>
            {/* Game Canvas */}
            <canvas 
                ref={canvasRef} 
                style={styles.canvas}
                onClick={handleCanvasClick}
            />
            
            {/* Character Creation UI - Top text */}
            {gameState.phase === 'character-creation' && (
                <>
                    <div style={styles.creationOverlay}>
                        <h1 style={styles.creationWelcomeTitle}>Welcome to MoonPay, {playerName}! 🎉</h1>
                        <p style={styles.creationWelcomeText}>
                            Congratulations on making it through the recruitment process — we're thrilled to have you join the team!
                            <br /><br />
                            Before you dive into your new role, we've prepared a little adventure for you.
                            <br />
                            Test your crypto knowledge as you journey from a luxury yacht all the way to the moon!
                            <br /><br />
                            Answer trivia questions correctly to unlock new destinations and prove you're ready for the world of Web3.
                        </p>
                        <p style={styles.subtitle}>First, create your avatar using the arrows</p>
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
            {gameState.phase === 'victory' && (
                <div style={styles.victoryOverlay}>
                    <div style={styles.victoryContent}>
                        <h1 style={styles.victoryTitle}>🎉 Congratulations, {playerName}!</h1>
                        <p style={styles.victoryIntro}>
                            You've successfully completed the journey to the moon! Here's what makes MoonPay an incredible place to work:
                        </p>
                        
                        <div style={styles.benefitsGrid}>
                            {/* Health & Wellness */}
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>🏥</div>
                                <h3 style={styles.benefitTitle}>Health & Wellness</h3>
                                <ul style={styles.benefitList}>
                                    <li>Comprehensive medical, dental, and vision insurance</li>
                                    <li>Mental health support and wellness days</li>
                                    <li>Gym membership reimbursement</li>
                                    <li>Annual health checkup coverage</li>
                                </ul>
                            </div>
                            
                            {/* Financial Perks */}
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>💰</div>
                                <h3 style={styles.benefitTitle}>Financial Perks</h3>
                                <ul style={styles.benefitList}>
                                    <li>Competitive salary packages</li>
                                    <li>Crypto bonus eligibility</li>
                                    <li>401(k) matching up to 6%</li>
                                    <li>Stock options for key roles</li>
                                    <li>Annual performance bonuses</li>
                                </ul>
                            </div>
                            
                            {/* Work-Life Balance */}
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>🌴</div>
                                <h3 style={styles.benefitTitle}>Work-Life Balance</h3>
                                <ul style={styles.benefitList}>
                                    <li>Unlimited PTO policy</li>
                                    <li>Remote-first work culture</li>
                                    <li>Flexible working hours</li>
                                    <li>Home office setup stipend ($1,500)</li>
                                    <li>Learning & development budget ($2,000/year)</li>
                                </ul>
                            </div>
                            
                            {/* Fun Extras */}
                            <div style={styles.benefitCard}>
                                <div style={styles.benefitIcon}>🎉</div>
                                <h3 style={styles.benefitTitle}>Fun Extras</h3>
                                <ul style={styles.benefitList}>
                                    <li>Quarterly team offsites</li>
                                    <li>MoonPay swag and merchandise</li>
                                    <li>Crypto wallet setup support</li>
                                    <li>Monthly team building events</li>
                                    <li>Conference attendance opportunities</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style={styles.welcomeSection}>
                            <h2 style={styles.welcomeTitle}>Welcome Aboard! 🚀</h2>
                            <p style={styles.welcomeText}>
                                We're thrilled to have you join the MoonPay family. Your journey in revolutionizing crypto payments starts now!
                            </p>
                            <p style={styles.nextSteps}>
                                <strong>Next steps:</strong> Check your email for onboarding details and your first-day schedule.
                            </p>
                        </div>
                        
                        <div style={styles.buttonRow}>
                            <button 
                                type="button"
                                style={styles.shareButton}
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'I joined MoonPay!',
                                            text: 'I just completed the MoonPay onboarding adventure! 🚀🌙',
                                            url: window.location.href
                                        });
                                    } else {
                                        navigator.clipboard.writeText('I just completed the MoonPay onboarding adventure! 🚀🌙 ' + window.location.href);
                                        alert('Link copied to clipboard!');
                                    }
                                }}
                            >
                                📤 Share Your Achievement
                            </button>
                            <button 
                                type="button"
                                style={styles.restartButton}
                                onClick={() => window.location.reload()}
                            >
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
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY
    },
    canvas: {
        flex: 1,
        display: 'block',
        cursor: 'pointer'
    },
    creationOverlay: {
        position: 'absolute',
        top: 30,
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
        textShadow: '0 2px 20px rgba(125, 0, 255, 0.5)',
        fontFamily: FONT_FAMILY
    },
    creationWelcomeText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 16,
        fontWeight: 400,
        marginTop: 12,
        lineHeight: 1.6,
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        fontFamily: FONT_FAMILY
    },
    subtitle: {
        color: '#7D00FF',
        fontSize: 14,
        fontWeight: 600,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: FONT_FAMILY
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
        pointerEvents: 'auto',
        boxShadow: '0 4px 20px rgba(125, 0, 255, 0.5)',
        fontFamily: FONT_FAMILY,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    bottomButtonContainer: {
        position: 'absolute',
        top: 'calc(50% + 160px)',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none'
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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 32
    },
    benefitCard: {
        backgroundColor: 'rgba(125, 0, 255, 0.1)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 16,
        padding: 24,
        textAlign: 'left'
    },
    benefitIcon: {
        fontSize: 32,
        marginBottom: 12
    },
    benefitTitle: {
        color: '#7D00FF',
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 12,
        fontFamily: FONT_FAMILY
    },
    benefitList: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        lineHeight: 1.8,
        paddingLeft: 20,
        margin: 0,
        fontFamily: FONT_FAMILY
    },
    welcomeSection: {
        backgroundColor: 'rgba(125, 0, 255, 0.15)',
        border: '1px solid rgba(125, 0, 255, 0.4)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32
    },
    welcomeTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 12,
        fontFamily: FONT_FAMILY
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 16,
        fontWeight: 400,
        marginBottom: 16,
        lineHeight: 1.6,
        fontFamily: FONT_FAMILY
    },
    nextSteps: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        fontFamily: FONT_FAMILY,
        margin: 0
    },
    buttonRow: {
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    shareButton: {
        padding: '14px 28px',
        fontSize: 16,
        fontWeight: 600,
        color: '#7D00FF',
        backgroundColor: 'transparent',
        border: '2px solid #7D00FF',
        borderRadius: 30,
        cursor: 'pointer',
        fontFamily: FONT_FAMILY,
        transition: 'all 0.2s ease'
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

export default GameCanvas;
