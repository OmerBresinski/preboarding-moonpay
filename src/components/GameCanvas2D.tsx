import { useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../utils/gameState';
import { MOONBASE_ORDER } from '../utils/gameState';
import { MOONBASE_DATA, type MoonBaseInfo } from '../utils/moonbases';
import { 
    drawSpaceBackground, 
    drawCountryMap, 
    drawOfficeLabel,
    drawProgressPath,
    calculateJumpArcPosition,
    drawJumpTrail,
    initStarField,
    easing,
    preloadImage
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
    // Smooth intensity for each location (0-1) - used for active state highlighting
    const intensityRef = useRef<Record<string, number>>({});
    
    // Track intro transition (from character creation to game)
    const introTransitionRef = useRef<{ active: boolean; startTime: number; fromPhase: string }>({ 
        active: false, 
        startTime: 0,
        fromPhase: 'character-creation'
    });
    const lastPhaseRef = useRef(gameState.phase);
    
    // Camera state for zoom effect
    const cameraRef = useRef<{
        zoom: number;
        targetX: number;
        targetY: number;
        currentX: number;
        currentY: number;
    }>({
        zoom: 2.8, // Zoomed in by default (matches ZOOM_IN)
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0
    });
    const ZOOM_IN = 2.8; // Zoom level when focused on a moonbase (fills ~60% of screen)
    const ZOOM_OUT = 1.0; // Zoom level when showing all moonbases
    
    // Mouse position in world coordinates (for character interaction)
    const mousePositionRef = useRef<{ worldX: number; worldY: number; screenX: number; screenY: number } | null>(null);
    
    // Moon is always visible now (no animation needed)
    const moonRevealRef = useRef<{ revealed: boolean }>({
        revealed: true
    });
    const NYC_INDEX = 4; // NYC is at index 4
    
    // Maps fade out - triggered when NYC is completed, never returns
    const mapsFadeRef = useRef<{ startTime: number; fadingOut: boolean; fullyHidden: boolean }>({
        startTime: 0,
        fadingOut: false,
        fullyHidden: false
    });
    const MAPS_FADE_DURATION = 1000; // 1 second fade

    // Get canvas positions for all locations based on canvas size
    const getLocationCanvasPositions = useCallback((width: number, height: number) => {
        return MOONBASE_ORDER.map((loc) => {
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
    // Character is offset to the left so the moonbase image is more visible
    const getCharacterPositionAtLocation = useCallback((
        loc: { x: number; y: number; moonbase: MoonBaseInfo },
        spriteSize: { width: number; height: number },
        baseScale: number
    ) => {
        const mapScale = baseScale * loc.moonbase.mapScale;
        const mapWidth = 800 * mapScale;
        const mapHeight = 100 * mapScale;
        return {
            x: loc.x - spriteSize.width / 2 - mapWidth * 0.25 - 70, // Offset left by 25% of map width + 70px
            y: loc.y - mapHeight / 2 - spriteSize.height - 15
        };
    }, []);

    // Preload map images on mount
    useEffect(() => {
        // Preload any map images
        MOONBASE_ORDER.forEach(loc => {
            const moonbase = MOONBASE_DATA[loc];
            if (moonbase.mapImage) {
                preloadImage(moonbase.mapImage);
            }
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

        const TRANSITION_DURATION = 2000; // 2 seconds for horizontal travel
        const INTRO_TRANSITION_DURATION = 1200; // 1.2 seconds for intro zoom

        const render = (time: number) => {
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
            
            // Get location positions
            const locations = getLocationCanvasPositions(width, height);
            
            // === CAMERA ZOOM LOGIC ===
            const camera = cameraRef.current;
            let targetZoom = ZOOM_IN;
            let targetX = width / 2;
            let targetY = height / 2;
            
            // Check if we're at the moon (last location)
            const isAtMoon = gameState.currentLocationIndex === MOONBASE_ORDER.length - 1;
            
            if (gameState.phase === 'character-creation') {
                // No zoom during character creation
                targetZoom = 1.0;
                targetX = width / 2;
                targetY = height / 2;
            } else if (gameState.phase === 'victory' && isAtMoon) {
                // Keep camera still during victory at moon - don't move it
                // Just maintain current position (no lerp update will happen)
                targetZoom = camera.zoom;
                targetX = camera.currentX;
                targetY = camera.currentY;
            } else if (isFlying) {
                // Zoom out during flight to show both locations
                targetZoom = ZOOM_OUT;
                targetX = width / 2;
                targetY = height / 2;
            } else {
                const currentLoc = locations[gameState.currentLocationIndex];
                if (currentLoc) {
                    // Don't zoom in on moon - it's already huge
                    targetZoom = isAtMoon ? ZOOM_OUT : ZOOM_IN;
                    targetX = currentLoc.x;
                    const screenOffsetY = (height / 2 - 250) / ZOOM_IN;
                    targetY = currentLoc.y + screenOffsetY;
                }
            }
            
            // Smoothly interpolate camera (lerp)
            const lerpSpeed = 0.08;
            camera.zoom += (targetZoom - camera.zoom) * lerpSpeed;
            camera.currentX += (targetX - camera.currentX) * lerpSpeed;
            camera.currentY += (targetY - camera.currentY) * lerpSpeed;
            
            // === MAPS FADE OUT (during victory) ===
            const mapsFade = mapsFadeRef.current;
            const isFlyingToMoon = isFlying && previousLocationIndex === NYC_INDEX;
            
            // Trigger maps fade when flying to moon or at moon
            if ((gameState.currentLocationIndex > NYC_INDEX || isFlyingToMoon) && !mapsFade.fadingOut && !mapsFade.fullyHidden) {
                mapsFade.fadingOut = true;
                mapsFade.startTime = time;
            }
            
            // Calculate maps fade progress (0 = fully visible, 1 = fully hidden)
            let mapsFadeProgress = 0;
            if (mapsFade.fullyHidden) {
                mapsFadeProgress = 1;
            } else if (mapsFade.fadingOut) {
                const fadeElapsed = time - mapsFade.startTime;
                mapsFadeProgress = Math.min(fadeElapsed / MAPS_FADE_DURATION, 1);
                if (mapsFadeProgress >= 1) {
                    mapsFade.fullyHidden = true;
                }
            }

            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Draw space background with twinkling stars (not affected by camera)
            drawSpaceBackground(ctx, width, height, time / 1000);
            
            // Calculate base scale based on canvas size
            const baseScale = Math.min(width / 1920, height / 1080) * 0.8;
            const gameScale = baseScale * 4 * 0.6;
            
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
                // Apply camera transform
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.scale(camera.zoom, camera.zoom);
                ctx.translate(-camera.currentX, -camera.currentY);
                
                // Fade in locations during intro transition
                if (introTransitionRef.current.active) {
                    ctx.globalAlpha = easing.easeOut(introProgress);
                }
                
                // When flying, use previousLocationIndex for the progress path to avoid showing ahead
                const progressIndex = isFlying ? previousLocationIndex : gameState.currentLocationIndex;
                
                // Maps visibility (inverted from fade progress: 1 = visible, 0 = hidden)
                const mapsVisibility = 1 - mapsFadeProgress;
                
                // Draw progress path connecting all locations (horizontal line)
                // Hide/fade path when maps are fading/hidden
                // Only show progress path when flying (hidden when landed/question appears)
                if (isFlying && mapsVisibility > 0) {
                    ctx.globalAlpha = mapsVisibility;
                    const pathPoints = locations
                        .filter(loc => loc.id !== 'moon' || moonRevealRef.current.revealed)
                        .map(loc => ({ x: loc.x, y: loc.y }));
                    // Pass gap radius based on map size
                    const gapRadius = 100 * baseScale;
                    drawProgressPath(ctx, pathPoints, progressIndex, transitionProgressRef.current, gapRadius);
                    ctx.globalAlpha = 1;
                }
                
                // Draw all locations
                
                locations.forEach((loc, index) => {
                    // Hide non-moon maps when fully faded (during victory)
                    if (loc.id !== 'moon' && mapsVisibility <= 0) {
                        return; // Fully faded, skip
                    }
                    
                    // Apply fade for non-moon maps
                    if (loc.id !== 'moon' && mapsVisibility < 1) {
                        ctx.globalAlpha = mapsVisibility;
                    }
                    
                    // When flying, the "active" location is where we're coming FROM
                    const isActive = isFlying ? index === previousLocationIndex : index === gameState.currentLocationIndex;
                    const isCompleted = index < (isFlying ? previousLocationIndex : gameState.currentLocationIndex);
                    // Smooth active intensity transition
                    const currentIntensity = intensityRef.current[loc.id] || 0;
                    const targetIntensity = isActive ? 1 : 0;
                    const newIntensity = currentIntensity + (targetIntensity - currentIntensity) * 0.15;
                    intensityRef.current[loc.id] = newIntensity;
                    
                    // Use the moonbase's own scale multiplied by base scale (0.9x larger)
                    const mapScale = baseScale * loc.moonbase.mapScale * 1.25;
                    
                    // Calculate map dimensions - using larger base for image maps
                    const mapWidth = 800 * mapScale;
                    const mapHeight = 800 * mapScale;
                    
                    // Calculate position - center the map on the location point
                    const drawX = loc.x - mapWidth / 2;
                    const drawY = loc.y - mapHeight / 2;
                    
                    // Draw country map (pins are baked into the images)
                    drawCountryMap(
                        ctx,
                        loc.moonbase,
                        drawX,
                        drawY,
                        mapScale,
                        isActive,
                        isCompleted,
                        false, // No hover
                        newIntensity // Pass intensity for smooth brightness transition
                    );
                    
                    // Draw label below the location, tooltip above the map
                    const labelY = drawY + mapHeight + 30;
                    const tooltipY = drawY - 20; // Position tooltip above the map
                    drawOfficeLabel(ctx, loc.moonbase, drawX + mapWidth / 2, labelY, false, tooltipY);
                    
                    // Reset alpha
                    ctx.globalAlpha = 1;
                });
                
                ctx.globalAlpha = 1;
                
                // Idle hover animation - gentle bobbing up and down
                const hoverOffset = Math.sin(time / 400) * 6;
                
                // Handle flying animation (within camera transform)
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
                    const charDrawX = charPos.x - spriteSize.width / 2;
                    const charDrawY = charPos.y - spriteSize.height;
                    
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
                        charDrawX,
                        charDrawY,
                        gameScale,
                        endLoc.x < startLoc.x, // Flip if moving left
                        true, // isFlying - show jetpack flames
                        time,
                        true, // showJetpack
                        mousePositionRef.current ? { x: mousePositionRef.current.worldX, y: mousePositionRef.current.worldY } : undefined
                    );
                    
                    // Check if animation complete
                    if (rawProgress >= 1) {
                        isAnimatingRef.current = false;
                        trailPositionsRef.current = [];
                        onTransitionComplete();
                    }
                } else if (introTransitionRef.current.active) {
                    // Intro transition: animate from center big to first location small
                    const easedIntro = easing.easeInOut(introProgress);
                    
                    // Calculate interpolated scale
                    const currentScale = Math.round(creationScale + (gameScale - creationScale) * easedIntro);
                    
                    // Start position (center, big) - in screen space
                    const startSpriteSize = getSpriteSize(characterPreset, creationScale);
                    const startX = width / 2 - startSpriteSize.width / 2;
                    const startY = height / 2 - startSpriteSize.height / 2 + 20;
                    
                    // End position (first location) - in world space
                    const firstLoc = locations[0];
                    const endSpriteSize = getSpriteSize(characterPreset, gameScale);
                    const endPos = getCharacterPositionAtLocation(firstLoc, endSpriteSize, baseScale);
                    
                    // Interpolate position with decreasing hover effect
                    const currentX = startX + (endPos.x - startX) * easedIntro;
                    const currentY = startY + (endPos.y - startY) * easedIntro + hoverOffset * (1 - easedIntro);
                    
                    drawCharacterSprite(
                        ctx,
                        characterPreset,
                        currentX,
                        currentY,
                        currentScale,
                        false,
                        false,
                        time,
                        true,
                        mousePositionRef.current ? { x: mousePositionRef.current.worldX, y: mousePositionRef.current.worldY } : undefined
                    );
                } else {
                    // Normal idle state at current location with hover animation
                    isAnimatingRef.current = false;
                    const currentLoc = locations[gameState.currentLocationIndex];
                    const spriteSize = getSpriteSize(characterPreset, gameScale);
                    const charPos = getCharacterPositionAtLocation(currentLoc, spriteSize, baseScale);
                    
                    drawCharacterSprite(
                        ctx,
                        characterPreset,
                        charPos.x,
                        charPos.y + hoverOffset, // Apply hover bobbing
                        gameScale,
                        false,
                        false,
                        time,
                        true, // Show jetpack
                        mousePositionRef.current ? { x: mousePositionRef.current.worldX, y: mousePositionRef.current.worldY } : undefined
                    );
                }
                
                // Restore camera transform
                ctx.restore();
            } else {
                // Character creation phase - no camera transform
                isAnimatingRef.current = false;
                const hoverOffset = Math.sin(time / 400) * 6;
                
                // Character creation: draw character BIG and CENTERED with hover
                const spriteSize = getSpriteSize(characterPreset, creationScale);
                // In character creation, use screen coordinates since no camera transform
                drawCharacterSprite(
                    ctx,
                    characterPreset,
                    width / 2 - spriteSize.width / 2,
                    height / 2 - spriteSize.height / 2 + 20 + hoverOffset,
                    creationScale,
                    false,
                    false,
                    time,
                    true, // Show jetpack
                    mousePositionRef.current ? { x: mousePositionRef.current.screenX, y: mousePositionRef.current.screenY } : undefined
                );
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
        getLocationCanvasPositions,
        getCharacterPositionAtLocation,
        onTransitionComplete,
        transitionProgressRef
    ]);

    // Mouse move handler for hover effects and cursor tracking
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates (inverse of camera transform)
        const camera = cameraRef.current;
        const worldX = (screenX - canvas.width / 2) / camera.zoom + camera.currentX;
        const worldY = (screenY - canvas.height / 2) / camera.zoom + camera.currentY;
        
        // Store mouse position for character interaction
        mousePositionRef.current = { worldX, worldY, screenX, screenY };
    }, []);

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
