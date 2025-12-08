// Canvas Rendering Utilities for 2D MoonBase Game

import type { MoonBaseInfo } from './moonbases';

// Image cache for map images
const imageCache: Map<string, HTMLImageElement> = new Map();
const loadingImages: Map<string, Promise<HTMLImageElement>> = new Map();

// Preload an image
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
    // Return cached image if available
    const cached = imageCache.get(src);
    if (cached) {
        return Promise.resolve(cached);
    }
    
    // Return existing loading promise if already loading
    const loading = loadingImages.get(src);
    if (loading) {
        return loading;
    }
    
    // Start loading the image
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            imageCache.set(src, img);
            loadingImages.delete(src);
            resolve(img);
        };
        img.onerror = () => {
            loadingImages.delete(src);
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
    });
    
    loadingImages.set(src, promise);
    return promise;
};

// Get cached image (returns null if not loaded)
export const getCachedImage = (src: string): HTMLImageElement | null => {
    return imageCache.get(src) || null;
};

// MoonPay brand colors
export const COLORS = {
    mpPurple: '#7D00FF',
    mpPurpleLight: '#9933FF',
    mpPurpleDark: '#5a0099',
    mpPurpleGlow: '#B366FF',
    mpWhite: '#FFFFFF',
    mpDarkBg: '#0D0B1A',
    mpSpaceBg: '#080510',
    spaceBlue: '#1A1A2E',
    starWhite: '#FFFFFF',
    starYellow: '#FFD700',
    gold: '#FFD700',
};

// Star field data for background
interface Star {
    x: number;
    y: number;
    size: number;
    brightness: number;
    twinkleSpeed: number;
    twinkleOffset: number;
}

let stars: Star[] = [];

// Initialize star field
export const initStarField = (width: number, height: number, count: number = 200): void => {
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random() * 0.5 + 0.5,
            twinkleSpeed: Math.random() * 2 + 1,
            twinkleOffset: Math.random() * Math.PI * 2,
        });
    }
};

// Draw space background with twinkling stars
export const drawSpaceBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
): void => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, COLORS.mpSpaceBg);
    gradient.addColorStop(0.3, COLORS.spaceBlue);
    gradient.addColorStop(0.7, '#1A1030');
    gradient.addColorStop(1, COLORS.mpPurpleDark);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw stars with twinkling effect
    for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        // Add subtle glow to larger stars
        if (star.size > 1.5) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
            ctx.fill();
        }
    }
};

// Draw stylized country map (supports both SVG paths and images)
export const drawCountryMap = (
    ctx: CanvasRenderingContext2D,
    moonbase: MoonBaseInfo,
    x: number,
    y: number,
    scale: number = 1,
    isActive: boolean = false,
    isCompleted: boolean = false,
    isHovered: boolean = false,
    hoverIntensity: number = 0 // 0-1 for smooth hover transition
): void => {
    ctx.save();
    
    // Check if we have an image for this moonbase
    if (moonbase.mapImage) {
        const img = getCachedImage(moonbase.mapImage);
        if (img) {
            // Calculate dimensions
            const imgWidth = img.width * scale;
            const imgHeight = img.height * scale;
            
            // Apply brightness filter when hovered (smooth transition via hoverIntensity)
            const brightness = 1 + (hoverIntensity * 0.3); // Up to 30% brighter
            ctx.filter = `brightness(${brightness})`;
            
            // Apply alpha based on state
            if (isActive || hoverIntensity > 0) {
                ctx.globalAlpha = 1;
            } else if (isCompleted) {
                ctx.globalAlpha = 0.7;
            } else {
                ctx.globalAlpha = 0.5;
            }
            
            ctx.drawImage(img, x, y, imgWidth, imgHeight);
            
            ctx.filter = 'none';
            ctx.restore();
            return;
        }
        // If image not loaded yet, try to load it (fallback to path below)
        preloadImage(moonbase.mapImage);
    }
    
    // Fallback: Draw SVG path
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Parse and draw the country path
    const path = new Path2D(moonbase.countryPath);
    
    // Fill color based on state
    if (isHovered) {
        ctx.fillStyle = COLORS.mpPurpleLight;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 30;
    } else if (isActive) {
        ctx.fillStyle = COLORS.mpPurpleLight;
        ctx.shadowColor = COLORS.mpPurple;
        ctx.shadowBlur = 20;
    } else if (isCompleted) {
        ctx.fillStyle = COLORS.mpPurpleDark;
    } else {
        ctx.fillStyle = 'rgba(125, 0, 255, 0.3)';
    }
    
    ctx.fill(path);
    
    // Outline
    ctx.strokeStyle = (isActive || isHovered) ? COLORS.mpWhite : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = (isActive || isHovered) ? 2 : 1;
    ctx.stroke(path);
    
    ctx.restore();
};

// Draw MoonPay pin marker
export const drawMoonPayPin = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number = 1,
    isActive: boolean = false,
    pulsePhase: number = 0
): void => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Pulse effect for active pin
    if (isActive) {
        const pulseSize = 1 + Math.sin(pulsePhase) * 0.1;
        ctx.scale(pulseSize, pulseSize);
        
        // Glow
        ctx.shadowColor = COLORS.mpPurple;
        ctx.shadowBlur = 15;
    }
    
    // Pin body (moon shape)
    ctx.beginPath();
    ctx.arc(0, -15, 12, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.mpPurple;
    ctx.fill();
    
    // Pin point
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(0, 5);
    ctx.lineTo(8, -8);
    ctx.fillStyle = COLORS.mpPurple;
    ctx.fill();
    
    // Moon crescent detail
    ctx.beginPath();
    ctx.arc(3, -15, 8, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.mpPurpleDark;
    ctx.fill();
    
    // Highlight
    ctx.beginPath();
    ctx.arc(-3, -18, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
    
    ctx.restore();
};

// Draw location label with hover tooltip
export const drawOfficeLabel = (
    ctx: CanvasRenderingContext2D,
    moonbase: MoonBaseInfo,
    x: number,
    y: number,
    isHovered: boolean = false,
    tooltipY?: number // Optional: Y position for tooltip (above the map)
): void => {
    ctx.save();
    
    // Country/region name only
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(moonbase.country, x, y);
    
    // Fun fact tooltip on hover (positioned above the map if tooltipY is provided)
    if (isHovered) {
        const tipY = tooltipY !== undefined ? tooltipY : y - 40;
        drawTooltip(ctx, moonbase.funFact, x, tipY, 280);
    }
    
    ctx.restore();
};

// Draw tooltip box
export const drawTooltip = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number = 200
): void => {
    ctx.save();
    
    ctx.font = '12px "Space Grotesk", sans-serif';
    
    // Word wrap text
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth - 20 && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    
    const lineHeight = 18;
    const padding = 12;
    const boxHeight = lines.length * lineHeight + padding * 2;
    const boxWidth = maxWidth;
    
    // Position tooltip above the point
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight;
    
    // Background with glassmorphism
    ctx.fillStyle = 'rgba(13, 11, 26, 0.9)';
    ctx.strokeStyle = COLORS.mpPurple;
    ctx.lineWidth = 1;
    
    // Rounded rectangle
    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(boxX + radius, boxY);
    ctx.lineTo(boxX + boxWidth - radius, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
    ctx.lineTo(boxX + radius, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
    ctx.lineTo(boxX, boxY + radius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Text
    ctx.fillStyle = COLORS.mpWhite;
    ctx.textAlign = 'left';
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], boxX + padding, boxY + padding + 12 + i * lineHeight);
    }
    
    ctx.restore();
};

// Helper to calculate point along a line segment, stopping at a gap
const getPointWithGap = (
    fromX: number, fromY: number,
    toX: number, toY: number,
    gapRadius: number,
    isStart: boolean // true = start from gap, false = stop at gap
): { x: number; y: number } => {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x: fromX, y: fromY };
    
    const ratio = gapRadius / dist;
    if (isStart) {
        // Start point: move away from 'from' towards 'to'
        return { x: fromX + dx * ratio, y: fromY + dy * ratio };
    } else {
        // End point: stop before reaching 'to'
        return { x: toX - dx * ratio, y: toY - dy * ratio };
    }
};

// Draw progress path connecting locations (with gaps around each point)
export const drawProgressPath = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    currentIndex: number,
    animationProgress: number = 1,
    gapRadius: number = 80 // Gap radius around each map
): void => {
    if (points.length < 2) return;
    
    ctx.save();
    
    // Draw each segment separately to create gaps around maps
    const drawSegment = (
        fromIdx: number, 
        toIdx: number, 
        style: string, 
        lineWidth: number, 
        dashed: boolean,
        partialProgress?: number // 0-1 for partial segment
    ) => {
        const from = points[fromIdx];
        const to = points[toIdx];
        
        // Calculate start and end points with gaps
        const startPt = getPointWithGap(from.x, from.y, to.x, to.y, gapRadius, true);
        let endPt = getPointWithGap(from.x, from.y, to.x, to.y, gapRadius, false);
        
        // If partial progress, interpolate the end point
        if (partialProgress !== undefined && partialProgress < 1) {
            const fullEndX = endPt.x;
            const fullEndY = endPt.y;
            const progressX = startPt.x + (fullEndX - startPt.x) * partialProgress;
            const progressY = startPt.y + (fullEndY - startPt.y) * partialProgress;
            endPt = { x: progressX, y: progressY };
        }
        
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(endPt.x, endPt.y);
        ctx.strokeStyle = style;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(dashed ? [8, 8] : []);
        ctx.stroke();
    };
    
    // Draw completed segments (solid purple)
    for (let i = 0; i < currentIndex && i < points.length - 1; i++) {
        drawSegment(i, i + 1, COLORS.mpPurple, 3, false);
    }
    
    // Draw current transition animation
    if (currentIndex < points.length - 1 && animationProgress > 0 && animationProgress < 1) {
        drawSegment(currentIndex, currentIndex + 1, COLORS.mpPurpleGlow, 3, false, animationProgress);
    }
    
    // Draw remaining segments (dashed, faded)
    const startIdx = animationProgress >= 1 ? currentIndex : currentIndex + 1;
    for (let i = startIdx; i < points.length - 1; i++) {
        drawSegment(i, i + 1, 'rgba(125, 0, 255, 0.3)', 2, true);
    }
    
    ctx.restore();
};

// Draw character jump arc animation
export const calculateJumpArcPosition = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    progress: number, // 0 to 1
    arcHeight: number = 100
): { x: number; y: number } => {
    // Horizontal interpolation
    const x = startX + (endX - startX) * progress;
    
    // Vertical with parabolic arc
    const baseY = startY + (endY - startY) * progress;
    const arc = Math.sin(progress * Math.PI) * arcHeight;
    const y = baseY - arc;
    
    return { x, y };
};

// Draw jump trail effect
export const drawJumpTrail = (
    ctx: CanvasRenderingContext2D,
    positions: { x: number; y: number }[],
    maxLength: number = 10
): void => {
    if (positions.length < 2) return;
    
    ctx.save();
    
    const trailPositions = positions.slice(-maxLength);
    
    for (let i = 0; i < trailPositions.length - 1; i++) {
        const alpha = (i / trailPositions.length) * 0.5;
        const pos = trailPositions[i];
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3 * (i / trailPositions.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125, 0, 255, ${alpha})`;
        ctx.fill();
    }
    
    ctx.restore();
};

// Easing functions for smooth animations
export const easing = {
    easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),
    easeIn: (t: number): number => t * t * t,
    bounce: (t: number): number => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            t -= 1.5 / 2.75;
            return 7.5625 * t * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            t -= 2.25 / 2.75;
            return 7.5625 * t * t + 0.9375;
        } else {
            t -= 2.625 / 2.75;
            return 7.5625 * t * t + 0.984375;
        }
    },
};

// Shimmer particle for cursor effect
interface ShimmerParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

// Shimmer particles pool
let shimmerParticles: ShimmerParticle[] = [];

// Draw cursor shimmer effect at a position
export const drawCursorShimmer = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    isActive: boolean = true
): void => {
    if (!isActive) return;
    
    ctx.save();
    
    // Spawn new particles occasionally
    if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        shimmerParticles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1, // Slight upward bias
            life: 1,
            maxLife: 1,
            size: Math.random() * 4 + 2,
            color: Math.random() > 0.5 ? COLORS.mpPurpleLight : COLORS.mpPurpleGlow,
        });
    }
    
    // Limit particles
    if (shimmerParticles.length > 30) {
        shimmerParticles = shimmerParticles.slice(-30);
    }
    
    // Update and draw particles
    shimmerParticles = shimmerParticles.filter(p => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life <= 0) return false;
        
        // Draw particle
        const alpha = p.life * 0.8;
        const size = p.size * p.life;
        
        // Glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', '');
        
        // Convert hex to rgba
        const hex = p.color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`;
        ctx.fill();
        
        return true;
    });
    
    // Draw main shimmer ring at cursor
    const ringPulse = Math.sin(time * 4) * 0.3 + 0.7;
    const ringSize = 15 * ringPulse;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, ringSize * 2);
    gradient.addColorStop(0, 'rgba(125, 0, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(153, 51, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(125, 0, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, ringSize * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Inner ring
    ctx.beginPath();
    ctx.arc(x, y, ringSize, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(179, 102, 255, ${0.5 * ringPulse})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Sparkle points around the ring
    const numSparkles = 6;
    for (let i = 0; i < numSparkles; i++) {
        const angle = (i / numSparkles) * Math.PI * 2 + time * 2;
        const sparkleX = x + Math.cos(angle) * ringSize * 1.2;
        const sparkleY = y + Math.sin(angle) * ringSize * 1.2;
        const sparkleSize = 2 + Math.sin(time * 3 + i) * 1;
        
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 4 + i) * 0.3})`;
        ctx.fill();
    }
    
    ctx.restore();
};

// Clear shimmer particles (call when hover ends)
export const clearShimmerParticles = (): void => {
    shimmerParticles = [];
};

// Draw pixel art alien saucer
export const drawAlienSaucer = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number
): void => {
    ctx.save();
    
    const pixelSize = 2; // Smaller pixel size
    
    // Slight wobble animation
    const wobble = Math.sin(time * 3) * 1.5;
    const tilt = Math.sin(time * 2) * 0.04;
    
    ctx.translate(x + 30, y + 30);
    ctx.rotate(tilt);
    ctx.translate(-30, -30);
    
    // Colors
    const purple = '#7D00FF';
    const purpleDark = '#5a00bb';
    const lightRed = '#FF6B6B';
    const lightRedDark = '#E85555';
    const yellow = '#FFD700';
    const glassColor = 'rgba(135, 206, 235, 0.6)';
    const glassHighlight = 'rgba(255, 255, 255, 0.5)';
    const alienPurple = '#9B59B6';
    const alienDarkPurple = '#7D4A94';
    const turquoiseEyes = '#008B8B';
    
    // Helper to draw a pixel
    const drawPixel = (px: number, py: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(px * pixelSize, py * pixelSize + wobble, pixelSize, pixelSize);
    };
    
    // === LEGS (purple, chunkier) ===
    // Left leg - chunky
    drawPixel(5, 16, purple);
    drawPixel(4, 16, purple);
    drawPixel(4, 17, purple);
    drawPixel(3, 17, purple);
    drawPixel(3, 18, purpleDark);
    drawPixel(2, 18, purpleDark);
    drawPixel(2, 19, purpleDark);
    
    // Middle leg - chunky
    drawPixel(14, 16, purple);
    drawPixel(15, 16, purple);
    drawPixel(14, 17, purple);
    drawPixel(15, 17, purple);
    drawPixel(14, 18, purpleDark);
    drawPixel(15, 18, purpleDark);
    drawPixel(14, 19, purpleDark);
    drawPixel(15, 19, purpleDark);
    
    // Right leg - chunky
    drawPixel(24, 16, purple);
    drawPixel(25, 16, purple);
    drawPixel(25, 17, purple);
    drawPixel(26, 17, purple);
    drawPixel(26, 18, purpleDark);
    drawPixel(27, 18, purpleDark);
    drawPixel(27, 19, purpleDark);
    
    // === BODY (light red ellipse with yellow dots) ===
    const bodyRows = [
        { y: 12, startX: 6, endX: 23 },
        { y: 13, startX: 4, endX: 25 },
        { y: 14, startX: 3, endX: 26 },
        { y: 15, startX: 4, endX: 25 },
        { y: 16, startX: 6, endX: 23 },
    ];
    
    bodyRows.forEach(row => {
        for (let px = row.startX; px <= row.endX; px++) {
            drawPixel(px, row.y, row.y === 14 ? lightRed : lightRedDark);
        }
    });
    
    // Yellow dots across the middle of the body (row 14)
    const dotPositions = [5, 9, 13, 17, 21, 25];
    dotPositions.forEach(px => {
        drawPixel(px, 14, yellow);
    });
    
    // Body rim highlight (top edge)
    for (let px = 7; px <= 22; px++) {
        drawPixel(px, 11, '#FF8888');
    }
    
    // === GLASS DOME ===
    const domeRows = [
        { y: 5, startX: 11, endX: 18 },
        { y: 6, startX: 9, endX: 20 },
        { y: 7, startX: 8, endX: 21 },
        { y: 8, startX: 8, endX: 21 },
        { y: 9, startX: 8, endX: 21 },
        { y: 10, startX: 9, endX: 20 },
        { y: 11, startX: 10, endX: 19 },
    ];
    
    domeRows.forEach(row => {
        for (let px = row.startX; px <= row.endX; px++) {
            drawPixel(px, row.y, glassColor);
        }
    });
    
    // Glass highlight (reflection)
    drawPixel(9, 6, glassHighlight);
    drawPixel(10, 6, glassHighlight);
    drawPixel(9, 7, glassHighlight);
    drawPixel(10, 7, glassHighlight);
    
    // === ALIEN inside the dome (pickle/straight body) ===
    // Alien body - more vertical/pickle shaped
    const alienRows = [
        { y: 6, startX: 13, endX: 16 },
        { y: 7, startX: 12, endX: 17 },
        { y: 8, startX: 12, endX: 17 },
        { y: 9, startX: 12, endX: 17 },
        { y: 10, startX: 13, endX: 16 },
    ];
    
    alienRows.forEach(row => {
        for (let px = row.startX; px <= row.endX; px++) {
            drawPixel(px, row.y, alienPurple);
        }
    });
    
    // Alien darker shading (right side)
    drawPixel(16, 7, alienDarkPurple);
    drawPixel(17, 7, alienDarkPurple);
    drawPixel(16, 8, alienDarkPurple);
    drawPixel(17, 8, alienDarkPurple);
    drawPixel(16, 9, alienDarkPurple);
    
    // Alien eyes (dark turquoise)
    // Left eye
    drawPixel(13, 7, turquoiseEyes);
    drawPixel(13, 8, turquoiseEyes);
    
    // Right eye
    drawPixel(15, 7, turquoiseEyes);
    drawPixel(15, 8, turquoiseEyes);
    
    // Eye highlights
    drawPixel(13, 7, '#00BFBF');
    drawPixel(15, 7, '#00BFBF');
    
    // === TOP ANTENNA/LIGHT ===
    drawPixel(14, 3, purple);
    drawPixel(15, 3, purple);
    drawPixel(14, 4, purple);
    drawPixel(15, 4, purple);
    // Blinking light
    const blink = Math.sin(time * 8) > 0;
    if (blink) {
        drawPixel(14, 2, '#FF0000');
        drawPixel(15, 2, '#FF0000');
    } else {
        drawPixel(14, 2, '#AA0000');
        drawPixel(15, 2, '#AA0000');
    }
    
    ctx.restore();
};

// Calculate saucer flight path (figure-8 / lemniscate pattern)
export const getSaucerPosition = (
    time: number,
    centerX: number,
    centerY: number,
    radiusX: number = 200,
    radiusY: number = 100
): { x: number; y: number } => {
    const t = time * 0.3; // Speed of movement
    // Figure-8 / lemniscate pattern
    const x = centerX + radiusX * Math.sin(t);
    const y = centerY + radiusY * Math.sin(t * 2) * 0.5;
    return { x, y };
};

