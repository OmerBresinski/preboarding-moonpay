import { useRef, useEffect, useCallback, useState } from 'react';
import type { GameState } from '../utils/gameState';
import { getCurrentLocation, MOONBASE_ORDER } from '../utils/gameState';
import { MOONBASE_DATA, type MoonBaseInfo } from '../utils/moonbases';
import { 
    drawSpaceBackground, 
    drawCountryMap, 
    drawMoonPayPin, 
    drawOfficeLabel,
    drawProgressPath,
    calculateJumpArcPosition,
    drawJumpTrail,
    initStarField,
    easing,
    COLORS
} from '../utils/canvasRenderer';
import { drawCharacterSprite, getSpriteSize, type CharacterPreset } from '../utils/characterSprites';

interface GameCanvas2DProps {
    gameState: GameState;
    characterPreset: CharacterPreset;
    isFlying: boolean;
    previousLocationIndex: number;
    transitionProgressRef: React.MutableRefObject<number>;
    onTransitionComplete: () => void;
}

const GameCanvas2D = ({
    gameState,
    characterPreset,
    isFlying,
    previousLocationIndex,
    transitionProgressRef,
    onTransitionComplete
}: GameCanvas2DProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const isAnimatingRef = useRef(false);
    const trailPositionsRef = useRef<{ x: number; y: number }[]>([]);
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    
    // Track intro transition (from character creation to game)
    const introTransitionRef = useRef<{ active: boolean; startTime: number; fromPhase: string }>({ 
        active: false, 
        startTime: 0,
        fromPhase: 'character-creation'
    });
    const lastPhaseRef = useRef(gameState.phase);

    // Get canvas positions for all locations based on canvas size
    const getLocationCanvasPositions = useCallback((width: number, height: number) => {
        return MOONBASE_ORDER.map(loc => {
            const moonbase = MOONBASE_DATA[loc];
            return {
                id: loc,
                x: moonbase.canvasPosition.x * width,
                y: moonbase.canvasPosition.y * height,
                moonbase
            };
        });
    }, []);

    // Calculate character position for a given location (consistent positioning)
    const getCharacterPositionAtLocation = useCallback((
        loc: { x: number; y: number; moonbase: MoonBaseInfo },
        spriteSize: { width: number; height: number },
        baseScale: number
    ) => {
        const mapScale = baseScale * loc.moonbase.mapScale;
        const mapHeight = 100 * mapScale;
        return {
            x: loc.x - spriteSize.width / 2,
            y: loc.y - mapHeight / 2 - spriteSize.height - 15
        };
    }, []);

    // Initialize stars on mount and resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const width = window.innerWidth;
                const height = window.innerHeight;
                canvas.width = width;
                canvas.height = height;
                setCanvasSize({ width, height });
                initStarField(width, height, 300);
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Main render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lastTime = 0;
        const TRANSITION_DURATION = 2000; // 2 seconds for horizontal travel
        const INTRO_TRANSITION_DURATION = 1200; // 1.2 seconds for intro zoom

        const render = (time: number) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            
            const { width, height } = canvas;
            if (width === 0 || height === 0) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            // Detect phase change from character-creation to trivia
            if (lastPhaseRef.current === 'character-creation' && gameState.phase === 'trivia') {
                introTransitionRef.current = { active: true, startTime: time, fromPhase: 'character-creation' };
            }
            lastPhaseRef.current = gameState.phase;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw space background with twinkling stars
            drawSpaceBackground(ctx, width, height, time / 1000);
            
            // Get location positions
            const locations = getLocationCanvasPositions(width, height);
            
            // Calculate base scale based on canvas size
            const baseScale = Math.min(width / 1920, height / 1080) * 0.8;
            const gameScale = Math.max(3, Math.floor(baseScale * 4));
            
            // Character creation large scale
            const creationScale = Math.max(8, Math.floor(baseScale * 12));
            
            // Calculate intro transition progress
            let introProgress = 1;
            if (introTransitionRef.current.active) {
                const elapsed = time - introTransitionRef.current.startTime;
                introProgress = Math.min(elapsed / INTRO_TRANSITION_DURATION, 1);
                if (introProgress >= 1) {
                    introTransitionRef.current.active = false;
                }
            }
            
            // Only draw locations and progress path when NOT in character creation (or during intro transition)
            if (gameState.phase !== 'character-creation') {
                // Fade in locations during intro transition
                if (introTransitionRef.current.active) {
                    ctx.globalAlpha = easing.easeOut(introProgress);
                }
                
                // When flying, use previousLocationIndex for the progress path to avoid showing ahead
                const progressIndex = isFlying ? previousLocationIndex : gameState.currentLocationIndex;
                
                // Draw progress path connecting all locations (horizontal line)
                const pathPoints = locations.map(loc => ({ x: loc.x, y: loc.y }));
                drawProgressPath(ctx, pathPoints, progressIndex, isFlying ? transitionProgressRef.current : 0);
                
                // Draw all locations
                locations.forEach((loc, index) => {
                    // When flying, the "active" location is where we're coming FROM
                    const isActive = isFlying ? index === previousLocationIndex : index === gameState.currentLocationIndex;
                    const isCompleted = index < (isFlying ? previousLocationIndex : gameState.currentLocationIndex);
                    const isHovered = hoveredLocation === loc.id;
                    
                    // Use the moonbase's own scale multiplied by base scale
                    const mapScale = baseScale * loc.moonbase.mapScale;
                    
                    // Calculate map dimensions for centering (approximate based on 100x100 viewbox)
                    const mapWidth = 100 * mapScale;
                    const mapHeight = 100 * mapScale;
                    
                    // Draw country/moon map - centered on position
                    drawCountryMap(
                        ctx,
                        loc.moonbase,
                        loc.x - mapWidth / 2,
                        loc.y - mapHeight / 2,
                        mapScale,
                        isActive,
                        isCompleted
                    );
                    
                    // Draw pin marker at the pin offset position
                    const pinX = loc.x - mapWidth / 2 + loc.moonbase.pinOffset.x * mapWidth;
                    const pinY = loc.y - mapHeight / 2 + loc.moonbase.pinOffset.y * mapHeight;
                    drawMoonPayPin(ctx, pinX, pinY, 0.7, isActive, time / 500);
                    
                    // Draw label below the location
                    const labelY = loc.y + mapHeight / 2 + 30;
                    drawOfficeLabel(ctx, loc.moonbase, loc.x, labelY, isHovered);
                });
                
                ctx.globalAlpha = 1;
            }
            
            // Handle flying animation
            if (isFlying && gameState.phase !== 'character-creation') {
                if (!isAnimatingRef.current) {
                    isAnimatingRef.current = true;
                    startTimeRef.current = time;
                    trailPositionsRef.current = [];
                }
                
                const elapsed = time - startTimeRef.current;
                const rawProgress = Math.min(elapsed / TRANSITION_DURATION, 1);
                const easedProgress = easing.easeInOut(rawProgress);
                transitionProgressRef.current = rawProgress;
                
                // Get start and end positions
                const startLoc = locations[previousLocationIndex];
                const endLoc = locations[gameState.currentLocationIndex];
                
                // Get character positions at start and end (using consistent positioning)
                const spriteSize = getSpriteSize(characterPreset, gameScale);
                const startCharPos = getCharacterPositionAtLocation(startLoc, spriteSize, baseScale);
                const endCharPos = getCharacterPositionAtLocation(endLoc, spriteSize, baseScale);
                
                // Calculate arc height - smaller for horizontal movement
                const arcHeight = Math.min(height * 0.12, 100);
                
                // Get current position along the arc (using consistent Y positioning)
                const charPos = calculateJumpArcPosition(
                    startCharPos.x + spriteSize.width / 2,
                    startCharPos.y + spriteSize.height,
                    endCharPos.x + spriteSize.width / 2,
                    endCharPos.y + spriteSize.height,
                    easedProgress,
                    arcHeight
                );
                
                // Adjust for sprite anchor
                const drawX = charPos.x - spriteSize.width / 2;
                const drawY = charPos.y - spriteSize.height;
                
                // Add to trail
                trailPositionsRef.current.push({ x: charPos.x, y: charPos.y });
                if (trailPositionsRef.current.length > 20) {
                    trailPositionsRef.current.shift();
                }
                
                // Draw trail
                drawJumpTrail(ctx, trailPositionsRef.current, 20);
                
                // Draw character at current position with jetpack flames
                drawCharacterSprite(
                    ctx,
                    characterPreset,
                    drawX,
                    drawY,
                    gameScale,
                    endLoc.x < startLoc.x, // Flip if moving left
                    true, // isFlying - show jetpack flames
                    time,
                    true // showJetpack
                );
                
                // Check if animation complete
                if (rawProgress >= 1) {
                    isAnimatingRef.current = false;
                    trailPositionsRef.current = [];
                    onTransitionComplete();
                }
            } else {
                // Draw character at current location (or during intro transition)
                isAnimatingRef.current = false;
                
                if (gameState.phase === 'character-creation') {
                    // Character creation: draw character BIG and CENTERED
                    const spriteSize = getSpriteSize(characterPreset, creationScale);
                    drawCharacterSprite(
                        ctx,
                        characterPreset,
                        width / 2 - spriteSize.width / 2,
                        height / 2 - spriteSize.height / 2 + 20, // Slightly lower to account for UI above
                        creationScale,
                        false,
                        false,
                        time,
                        true // Show jetpack (without flames)
                    );
                } else if (introTransitionRef.current.active) {
                    // Intro transition: animate from center big to first location small
                    const easedIntro = easing.easeInOut(introProgress);
                    
                    // Calculate interpolated scale
                    const currentScale = Math.round(creationScale + (gameScale - creationScale) * easedIntro);
                    const spriteSize = getSpriteSize(characterPreset, currentScale);
                    
                    // Start position (center, big)
                    const startX = width / 2 - getSpriteSize(characterPreset, creationScale).width / 2;
                    const startY = height / 2 - getSpriteSize(characterPreset, creationScale).height / 2 + 20;
                    
                    // End position (first location)
                    const firstLoc = locations[0];
                    const endSpriteSize = getSpriteSize(characterPreset, gameScale);
                    const endPos = getCharacterPositionAtLocation(firstLoc, endSpriteSize, baseScale);
                    
                    // Interpolate position
                    const currentX = startX + (endPos.x - startX) * easedIntro;
                    const currentY = startY + (endPos.y - startY) * easedIntro;
                    
                    drawCharacterSprite(
                        ctx,
                        characterPreset,
                        currentX,
                        currentY,
                        currentScale,
                        false,
                        false,
                        time,
                        true
                    );
                } else {
                    // Normal idle state at current location
                    const currentLoc = locations[gameState.currentLocationIndex];
                    const spriteSize = getSpriteSize(characterPreset, gameScale);
                    const charPos = getCharacterPositionAtLocation(currentLoc, spriteSize, baseScale);
                    
                    drawCharacterSprite(
                        ctx,
                        characterPreset,
                        charPos.x,
                        charPos.y,
                        gameScale,
                        false,
                        false,
                        time,
                        true // Show jetpack (without flames)
                    );
                }
            }
            
            animationRef.current = requestAnimationFrame(render);
        };
        
        animationRef.current = requestAnimationFrame(render);
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [
        gameState.currentLocationIndex,
        gameState.phase,
        characterPreset,
        isFlying,
        previousLocationIndex,
        hoveredLocation,
        getLocationCanvasPositions,
        getCharacterPositionAtLocation,
        onTransitionComplete,
        transitionProgressRef
    ]);

    // Mouse move handler for hover effects
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const locations = getLocationCanvasPositions(canvas.width, canvas.height);
        
        // Check if hovering over any location
        let foundHover = false;
        for (const loc of locations) {
            const dist = Math.sqrt((x - loc.x) ** 2 + (y - loc.y) ** 2);
            if (dist < 80) {
                setHoveredLocation(loc.id);
                foundHover = true;
                break;
            }
        }
        
        if (!foundHover) {
            setHoveredLocation(null);
        }
    }, [getLocationCanvasPositions]);

    return (
        <canvas
            ref={canvasRef}
            style={styles.canvas}
            onMouseMove={handleMouseMove}
        />
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }
};

export default GameCanvas2D;
