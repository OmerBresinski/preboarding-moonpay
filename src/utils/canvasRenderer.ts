// Canvas Rendering Utilities for 2D MoonBase Game

import type { MoonBaseInfo } from './moonbases';

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

// Draw stylized country map
export const drawCountryMap = (
    ctx: CanvasRenderingContext2D,
    moonbase: MoonBaseInfo,
    x: number,
    y: number,
    scale: number = 1,
    isActive: boolean = false,
    isCompleted: boolean = false
): void => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Parse and draw the country path
    const path = new Path2D(moonbase.countryPath);
    
    // Fill color based on state
    if (isActive) {
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
    ctx.strokeStyle = isActive ? COLORS.mpWhite : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = isActive ? 2 : 1;
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

// Draw office name label with hover tooltip
export const drawOfficeLabel = (
    ctx: CanvasRenderingContext2D,
    moonbase: MoonBaseInfo,
    x: number,
    y: number,
    isHovered: boolean = false
): void => {
    ctx.save();
    
    // Office name
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.mpWhite;
    ctx.fillText(moonbase.officeName, x, y);
    
    // City name below
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(moonbase.name, x, y + 18);
    
    // Fun fact tooltip on hover
    if (isHovered) {
        drawTooltip(ctx, moonbase.funFact, x, y - 40, 250);
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
    
    // Arrow pointing down
    ctx.beginPath();
    ctx.moveTo(x - 8, boxY + boxHeight);
    ctx.lineTo(x, boxY + boxHeight + 8);
    ctx.lineTo(x + 8, boxY + boxHeight);
    ctx.fillStyle = 'rgba(13, 11, 26, 0.9)';
    ctx.fill();
    
    // Text
    ctx.fillStyle = COLORS.mpWhite;
    ctx.textAlign = 'left';
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], boxX + padding, boxY + padding + 12 + i * lineHeight);
    }
    
    ctx.restore();
};

// Draw progress path connecting locations
export const drawProgressPath = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    currentIndex: number,
    animationProgress: number = 1
): void => {
    if (points.length < 2) return;
    
    ctx.save();
    
    // Completed path (solid)
    ctx.strokeStyle = COLORS.mpPurple;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i <= currentIndex && i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Current transition animation
    if (currentIndex < points.length - 1 && animationProgress < 1) {
        const from = points[currentIndex];
        const to = points[currentIndex + 1];
        const currentX = from.x + (to.x - from.x) * animationProgress;
        const currentY = from.y + (to.y - from.y) * animationProgress;
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = COLORS.mpPurpleGlow;
        ctx.stroke();
    }
    
    // Remaining path (dashed)
    if (currentIndex < points.length - 1) {
        ctx.strokeStyle = 'rgba(125, 0, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        
        const startIdx = Math.max(currentIndex, 0);
        ctx.beginPath();
        ctx.moveTo(points[startIdx].x, points[startIdx].y);
        
        for (let i = startIdx + 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
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

