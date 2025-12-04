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

        const render = (time: number) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            
            const { width, height } = canvas;
            if (width === 0 || height === 0) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw space background with twinkling stars
            drawSpaceBackground(ctx, width, height, time / 1000);
            
            // Get location positions
            const locations = getLocationCanvasPositions(width, height);
            
            // Calculate base scale based on canvas size
            const baseScale = Math.min(width / 1920, height / 1080) * 0.8;
            
            // Only draw locations and progress path when NOT in character creation
            if (gameState.phase !== 'character-creation') {
                // Draw progress path connecting all locations (horizontal line)
                const pathPoints = locations.map(loc => ({ x: loc.x, y: loc.y }));
                drawProgressPath(ctx, pathPoints, gameState.currentLocationIndex, transitionProgressRef.current);
                
                // Draw all locations
                locations.forEach((loc, index) => {
                    const isActive = index === gameState.currentLocationIndex;
                    const isCompleted = index < gameState.currentLocationIndex;
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
            }
            
            // Handle flying animation
            if (isFlying) {
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
                
                // Calculate arc height - smaller for horizontal movement
                const arcHeight = Math.min(height * 0.15, 120);
                
                // Get current position along the arc
                const charPos = calculateJumpArcPosition(
                    startLoc.x,
                    startLoc.y,
                    endLoc.x,
                    endLoc.y,
                    easedProgress,
                    arcHeight
                );
                
                // Add to trail
                trailPositionsRef.current.push({ ...charPos });
                if (trailPositionsRef.current.length > 20) {
                    trailPositionsRef.current.shift();
                }
                
                // Draw trail
                drawJumpTrail(ctx, trailPositionsRef.current, 20);
                
                // Draw character at current position
                const spriteScale = Math.max(3, Math.floor(baseScale * 4));
                const spriteSize = getSpriteSize(characterPreset, spriteScale);
                drawCharacterSprite(
                    ctx,
                    characterPreset,
                    charPos.x - spriteSize.width / 2,
                    charPos.y - spriteSize.height,
                    spriteScale,
                    endLoc.x < startLoc.x // Flip if moving left
                );
                
                // Check if animation complete
                if (rawProgress >= 1) {
                    isAnimatingRef.current = false;
                    trailPositionsRef.current = [];
                    onTransitionComplete();
                }
            } else {
                // Draw character at current location
                isAnimatingRef.current = false;
                const currentLoc = locations[gameState.currentLocationIndex];
                
                if (gameState.phase !== 'character-creation') {
                    const spriteScale = Math.max(3, Math.floor(baseScale * 4));
                    const spriteSize = getSpriteSize(characterPreset, spriteScale);
                    
                    // Position character above the current location
                    const mapScale = baseScale * currentLoc.moonbase.mapScale;
                    const mapHeight = 100 * mapScale;
                    
                    drawCharacterSprite(
                        ctx,
                        characterPreset,
                        currentLoc.x - spriteSize.width / 2,
                        currentLoc.y - mapHeight / 2 - spriteSize.height - 10,
                        spriteScale
                    );
                } else {
                    // Character creation: draw character in center-left area
                    const spriteScale = 6;
                    const spriteSize = getSpriteSize(characterPreset, spriteScale);
                    drawCharacterSprite(
                        ctx,
                        characterPreset,
                        width * 0.35 - spriteSize.width / 2,
                        height * 0.5 - spriteSize.height / 2,
                        spriteScale
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
            if (dist < 80) {  // Increased hover radius for larger maps
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
