// 2D Sprite Drawing Functions for Canvas

// Color Palettes
export const COLORS = {
    // MoonPay
    mpPurple: '#7D00FF',
    mpWhite: '#FFFFFF',
    
    // Sky
    skyDay: '#87CEEB',
    skySunset: '#FD5E53',
    skySpace: '#0a0a2e',
    
    // Water
    water: '#006994',
    waterLight: '#4FAFD7',
    
    // Landmarks
    yachtWhite: '#F5F5F5',
    yachtBlue: '#1E3A5F',
    libertyGreen: '#4A9F6E',
    libertyCopper: '#B87333',
    eiffelBrown: '#8B4513',
    burjSilver: '#C0C0C0',
    burjBlue: '#4169E1',
    issWhite: '#E8E8E8',
    issSolar: '#1a1a4e',
    moonGrey: '#BBBBBB',
    moonDark: '#888888',
    
    // Character
    skin: '#FFCCAA',
    btcOrange: '#F7931A',
    ethBlue: '#627EEA',
    dogeYellow: '#E1B303',
    
    // Effects
    flame: '#FF6600',
    flameYellow: '#FFD700',
};

// Character customization options - MoonPay space suit aesthetic
export const HEAD_OPTIONS = ['classic', 'visor', 'antenna', 'stars', 'gradient', 'glow'];
export const TORSO_OPTIONS = ['standard', 'stripe', 'badge', 'tech', 'logo', 'elite'];
export const LEGS_OPTIONS = ['standard', 'stripe', 'boots', 'tech', 'gradient', 'elite'];

export interface CharacterConfig {
    headIndex: number;
    torsoIndex: number;
    legsIndex: number;
}

// Draw rounded rectangle helper
export const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    if (ctx.strokeStyle !== 'transparent') ctx.stroke();
};

// --- CHARACTER DRAWING ---

export const drawCharacter = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    config: CharacterConfig,
    scale: number = 1,
    isFlying: boolean = false,
    flameFrame: number = 0
) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Jetpack (behind character)
    ctx.fillStyle = '#444';
    drawRoundedRect(ctx, -25, -30, 12, 40, 3);
    
    // Jetpack straps
    ctx.fillStyle = '#333';
    ctx.fillRect(-13, -20, 8, 4);
    ctx.fillRect(-13, 0, 8, 4);
    
    // Flame (when flying)
    if (isFlying) {
        const flameHeight = 20 + Math.sin(flameFrame * 0.5) * 10;
        const gradient = ctx.createLinearGradient(-19, 10, -19, 10 + flameHeight);
        gradient.addColorStop(0, COLORS.flameYellow);
        gradient.addColorStop(0.5, COLORS.flame);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-25, 10);
        ctx.lineTo(-19, 10 + flameHeight);
        ctx.lineTo(-13, 10);
        ctx.closePath();
        ctx.fill();
    }
    
    // Legs
    drawLegs(ctx, config.legsIndex);
    
    // Torso
    drawTorso(ctx, config.torsoIndex);
    
    // Head
    drawHead(ctx, config.headIndex);
    
    ctx.restore();
};

const drawHead = (ctx: CanvasRenderingContext2D, index: number) => {
    const headType = HEAD_OPTIONS[index];
    
    ctx.strokeStyle = '#5a0099';
    ctx.lineWidth = 2;
    
    switch (headType) {
        case 'visor':
            // White helmet with purple visor band
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -17, -72, 34, 34, 10);
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -14, -62, 28, 14, 4);
            // Reflection
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            drawRoundedRect(ctx, -10, -60, 8, 6, 2);
            break;
            
        case 'antenna':
            // Helmet with antenna
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -17, -72, 34, 34, 10);
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -14, -62, 28, 14, 4);
            // Antenna
            ctx.fillStyle = '#888';
            ctx.fillRect(-2, -85, 4, 15);
            ctx.fillStyle = COLORS.mpPurple;
            ctx.beginPath();
            ctx.arc(0, -88, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 'stars':
            // Helmet with star decorations
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -17, -72, 34, 34, 10);
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -14, -62, 28, 14, 4);
            // Stars on helmet
            ctx.fillStyle = COLORS.mpPurple;
            ctx.font = '10px Arial';
            ctx.fillText('★', -12, -68);
            ctx.fillText('★', 6, -68);
            break;
            
        case 'gradient': {
            // Purple gradient helmet
            const headGrad = ctx.createLinearGradient(-17, -72, 17, -38);
            headGrad.addColorStop(0, COLORS.mpPurple);
            headGrad.addColorStop(1, '#4a0080');
            ctx.fillStyle = headGrad;
            drawRoundedRect(ctx, -17, -72, 34, 34, 10);
            // White visor
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            drawRoundedRect(ctx, -14, -62, 28, 14, 4);
            break;
        }
            
        case 'glow':
            // Glowing helmet effect
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -17, -72, 34, 34, 10);
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -14, -62, 28, 14, 4);
            // Glow ring
            ctx.strokeStyle = COLORS.mpPurple;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -55, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#5a0099';
            ctx.lineWidth = 2;
            break;
            
        default: // classic
            // Clean white helmet with purple visor
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -17, -72, 34, 34, 10);
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -14, -62, 28, 14, 4);
    }
};

const drawTorso = (ctx: CanvasRenderingContext2D, index: number) => {
    const torsoType = TORSO_OPTIONS[index];
    
    ctx.strokeStyle = '#5a0099';
    ctx.lineWidth = 2;
    
    // All torso options follow MoonPay space suit aesthetic
    switch (torsoType) {
        case 'stripe':
            // White suit with purple stripe
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -18, -40, 36, 35, 8);
            ctx.fillStyle = COLORS.mpPurple;
            ctx.fillRect(-3, -40, 6, 35);
            break;
            
        case 'badge':
            // White suit with M badge
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -18, -40, 36, 35, 8);
            // Badge circle
            ctx.fillStyle = COLORS.mpPurple;
            ctx.beginPath();
            ctx.arc(-8, -28, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = COLORS.mpWhite;
            ctx.font = 'bold 10px Arial';
            ctx.fillText('M', -11, -25);
            break;
            
        case 'tech':
            // Tech suit with panel lines
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -18, -40, 36, 35, 8);
            ctx.strokeStyle = COLORS.mpPurple;
            ctx.lineWidth = 1;
            // Tech lines
            ctx.beginPath();
            ctx.moveTo(-12, -38);
            ctx.lineTo(-12, -8);
            ctx.moveTo(12, -38);
            ctx.lineTo(12, -8);
            ctx.moveTo(-18, -25);
            ctx.lineTo(18, -25);
            ctx.stroke();
            ctx.strokeStyle = '#5a0099';
            ctx.lineWidth = 2;
            break;
            
        case 'logo':
            // Purple suit with large M
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -18, -40, 36, 35, 8);
            ctx.fillStyle = COLORS.mpWhite;
            ctx.font = 'bold 20px Arial';
            ctx.fillText('M', -8, -18);
            break;
            
        case 'elite': {
            // Gradient suit
            const torsoGrad = ctx.createLinearGradient(-18, -40, 18, -5);
            torsoGrad.addColorStop(0, COLORS.mpWhite);
            torsoGrad.addColorStop(0.5, COLORS.mpPurple);
            torsoGrad.addColorStop(1, COLORS.mpWhite);
            ctx.fillStyle = torsoGrad;
            drawRoundedRect(ctx, -18, -40, 36, 35, 8);
            break;
        }
            
        default: // standard
            // Clean white suit
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -18, -40, 36, 35, 8);
    }
    
    // Arms in matching white
    ctx.fillStyle = COLORS.mpWhite;
    drawRoundedRect(ctx, -25, -38, 10, 25, 4);
    drawRoundedRect(ctx, 15, -38, 10, 25, 4);
};

const drawLegs = (ctx: CanvasRenderingContext2D, index: number) => {
    const legsType = LEGS_OPTIONS[index];
    
    ctx.strokeStyle = '#5a0099';
    ctx.lineWidth = 2;
    
    // All leg options follow MoonPay space suit aesthetic
    switch (legsType) {
        case 'stripe':
            // White pants with purple stripe
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -14, -5, 12, 35, 4);
            drawRoundedRect(ctx, 2, -5, 12, 35, 4);
            ctx.fillStyle = COLORS.mpPurple;
            ctx.fillRect(-10, -5, 3, 35);
            ctx.fillRect(6, -5, 3, 35);
            break;
            
        case 'boots':
            // White pants with purple boots
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -14, -5, 12, 22, 4);
            drawRoundedRect(ctx, 2, -5, 12, 22, 4);
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -15, 15, 14, 15, 4);
            drawRoundedRect(ctx, 1, 15, 14, 15, 4);
            break;
            
        case 'tech':
            // Tech pants with panel lines
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -14, -5, 12, 35, 4);
            drawRoundedRect(ctx, 2, -5, 12, 35, 4);
            ctx.strokeStyle = COLORS.mpPurple;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(-8, 25);
            ctx.moveTo(8, 0);
            ctx.lineTo(8, 25);
            ctx.stroke();
            ctx.strokeStyle = '#5a0099';
            ctx.lineWidth = 2;
            break;
            
        case 'gradient': {
            // Gradient from white to purple
            const legGrad = ctx.createLinearGradient(0, -5, 0, 30);
            legGrad.addColorStop(0, COLORS.mpWhite);
            legGrad.addColorStop(1, COLORS.mpPurple);
            ctx.fillStyle = legGrad;
            drawRoundedRect(ctx, -14, -5, 12, 35, 4);
            drawRoundedRect(ctx, 2, -5, 12, 35, 4);
            break;
        }
            
        case 'elite':
            // Full purple pants
            ctx.fillStyle = COLORS.mpPurple;
            drawRoundedRect(ctx, -14, -5, 12, 35, 4);
            drawRoundedRect(ctx, 2, -5, 12, 35, 4);
            // White knee pads
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -12, 8, 8, 8, 3);
            drawRoundedRect(ctx, 4, 8, 8, 8, 3);
            break;
            
        default: // standard
            // Clean white pants
            ctx.fillStyle = COLORS.mpWhite;
            drawRoundedRect(ctx, -14, -5, 12, 35, 4);
            drawRoundedRect(ctx, 2, -5, 12, 35, 4);
    }
};

// --- LANDMARK DRAWING ---

export const drawYacht = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Water
    ctx.fillStyle = COLORS.water;
    ctx.fillRect(-150, 50, 300, 100);
    
    // Waves
    ctx.strokeStyle = COLORS.waterLight;
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-150 + i * 60, 60 + i * 15);
        ctx.quadraticCurveTo(-120 + i * 60, 50 + i * 15, -90 + i * 60, 60 + i * 15);
        ctx.stroke();
    }
    
    // Hull
    ctx.fillStyle = COLORS.yachtWhite;
    ctx.beginPath();
    ctx.moveTo(-100, 50);
    ctx.lineTo(100, 50);
    ctx.lineTo(120, 20);
    ctx.lineTo(100, -20);
    ctx.lineTo(-80, -20);
    ctx.lineTo(-100, 50);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Purple stripe
    ctx.fillStyle = COLORS.mpPurple;
    ctx.fillRect(-95, 10, 200, 15);
    
    // Cabin
    ctx.fillStyle = COLORS.yachtWhite;
    drawRoundedRect(ctx, -60, -70, 100, 50, 8);
    
    // Windows
    ctx.fillStyle = '#AAE';
    drawRoundedRect(ctx, -50, -60, 25, 20, 4);
    drawRoundedRect(ctx, -15, -60, 25, 20, 4);
    drawRoundedRect(ctx, 20, -60, 25, 20, 4);
    
    // Upper deck
    ctx.fillStyle = COLORS.yachtWhite;
    drawRoundedRect(ctx, -40, -100, 60, 30, 5);
    
    // Radar
    ctx.fillStyle = '#444';
    ctx.fillRect(-5, -115, 10, 15);
    ctx.fillRect(-15, -120, 30, 5);
    
    ctx.restore();
};

export const drawStatueOfLiberty = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Ground
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(-150, 80, 300, 70);
    
    // Pedestal
    ctx.fillStyle = '#888';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, 80);
    ctx.lineTo(-40, -20);
    ctx.lineTo(40, -20);
    ctx.lineTo(50, 80);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Body/Robe
    ctx.fillStyle = COLORS.libertyGreen;
    ctx.beginPath();
    ctx.moveTo(-30, -20);
    ctx.lineTo(-25, -120);
    ctx.lineTo(25, -120);
    ctx.lineTo(30, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -135, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Crown spikes
    for (let i = 0; i < 7; i++) {
        const angle = Math.PI + (i / 6) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 15, -135 + Math.sin(angle) * 15);
        ctx.lineTo(Math.cos(angle) * 25, -135 + Math.sin(angle) * 25);
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    // Torch arm
    ctx.fillStyle = COLORS.libertyGreen;
    ctx.beginPath();
    ctx.moveTo(25, -100);
    ctx.lineTo(50, -170);
    ctx.lineTo(60, -165);
    ctx.lineTo(35, -95);
    ctx.fill();
    
    // Torch
    ctx.fillStyle = COLORS.libertyCopper;
    drawRoundedRect(ctx, 45, -185, 20, 20, 5);
    
    // Flame
    ctx.fillStyle = COLORS.flame;
    ctx.beginPath();
    ctx.moveTo(55, -185);
    ctx.quadraticCurveTo(45, -210, 55, -220);
    ctx.quadraticCurveTo(65, -210, 55, -185);
    ctx.fill();
    
    ctx.restore();
};

export const drawEiffelTower = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Ground
    ctx.fillStyle = '#888';
    ctx.fillRect(-150, 80, 300, 70);
    
    ctx.fillStyle = COLORS.eiffelBrown;
    ctx.strokeStyle = '#5a3510';
    ctx.lineWidth = 3;
    
    // Main structure
    ctx.beginPath();
    // Left leg
    ctx.moveTo(-70, 80);
    ctx.lineTo(-30, -50);
    ctx.lineTo(-20, -50);
    ctx.lineTo(-50, 80);
    // Right leg
    ctx.moveTo(70, 80);
    ctx.lineTo(30, -50);
    ctx.lineTo(20, -50);
    ctx.lineTo(50, 80);
    ctx.fill();
    
    // Middle section
    ctx.beginPath();
    ctx.moveTo(-30, -50);
    ctx.lineTo(-15, -150);
    ctx.lineTo(15, -150);
    ctx.lineTo(30, -50);
    ctx.closePath();
    ctx.fill();
    
    // Top
    ctx.beginPath();
    ctx.moveTo(-15, -150);
    ctx.lineTo(-5, -220);
    ctx.lineTo(5, -220);
    ctx.lineTo(15, -150);
    ctx.closePath();
    ctx.fill();
    
    // Antenna
    ctx.fillRect(-3, -250, 6, 30);
    
    // Platforms
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(-60, 20, 120, 10);
    ctx.fillRect(-35, -50, 70, 8);
    ctx.fillRect(-18, -150, 36, 6);
    
    // Arch
    ctx.strokeStyle = COLORS.eiffelBrown;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 80, 50, Math.PI, 0);
    ctx.stroke();
    
    ctx.restore();
};

export const drawBurjKhalifa = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Desert ground
    ctx.fillStyle = '#C2B280';
    ctx.fillRect(-150, 80, 300, 70);
    
    ctx.fillStyle = COLORS.burjSilver;
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    
    // Main tower sections (tapering)
    const sections = [
        { w: 60, h: 50, y: 80 },
        { w: 50, h: 50, y: 30 },
        { w: 40, h: 50, y: -20 },
        { w: 30, h: 50, y: -70 },
        { w: 20, h: 50, y: -120 },
        { w: 12, h: 40, y: -160 },
        { w: 6, h: 50, y: -210 },
    ];
    
    sections.forEach(s => {
        ctx.fillStyle = COLORS.burjSilver;
        ctx.fillRect(-s.w/2, s.y - s.h, s.w, s.h);
        ctx.strokeRect(-s.w/2, s.y - s.h, s.w, s.h);
        
        // Blue window strips
        ctx.fillStyle = COLORS.burjBlue;
        ctx.fillRect(-s.w/2 + 2, s.y - s.h + 5, s.w - 4, 3);
    });
    
    // Spire
    ctx.fillStyle = COLORS.burjSilver;
    ctx.beginPath();
    ctx.moveTo(-3, -260);
    ctx.lineTo(0, -300);
    ctx.lineTo(3, -260);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
};

export const drawISS = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Stars background
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 30; i++) {
        const sx = (Math.sin(i * 123.456) * 0.5 + 0.5) * 300 - 150;
        const sy = (Math.cos(i * 789.012) * 0.5 + 0.5) * 200 - 100;
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    
    // Main truss
    ctx.fillStyle = '#AAA';
    ctx.fillRect(-120, -5, 240, 10);
    
    // Central modules
    ctx.fillStyle = COLORS.issWhite;
    drawRoundedRect(ctx, -30, -25, 60, 50, 8);
    drawRoundedRect(ctx, -70, -20, 35, 40, 6);
    drawRoundedRect(ctx, 35, -20, 35, 40, 6);
    
    // Solar panels
    ctx.fillStyle = COLORS.issSolar;
    const panelPositions = [-100, -70, 70, 100];
    panelPositions.forEach(px => {
        ctx.fillRect(px - 15, -60, 30, 50);
        ctx.fillRect(px - 15, 10, 30, 50);
        // Panel lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(px - 15, -60 + i * 10);
            ctx.lineTo(px + 15, -60 + i * 10);
            ctx.moveTo(px - 15, 10 + i * 10);
            ctx.lineTo(px + 15, 10 + i * 10);
            ctx.stroke();
        }
    });
    
    ctx.restore();
};

export const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Moon surface
    ctx.fillStyle = COLORS.moonGrey;
    ctx.beginPath();
    ctx.arc(0, 100, 200, Math.PI, 0);
    ctx.fill();
    
    // Craters
    ctx.fillStyle = COLORS.moonDark;
    const craters = [
        { x: -60, y: 50, r: 25 },
        { x: 40, y: 30, r: 20 },
        { x: -20, y: 70, r: 15 },
        { x: 80, y: 60, r: 18 },
        { x: -90, y: 40, r: 12 },
    ];
    craters.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Earth in distance
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(-80, -80, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(-85, -75, 10, 0, Math.PI * 2);
    ctx.arc(-70, -90, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // MoonPay flag
    ctx.fillStyle = '#888';
    ctx.fillRect(50, -60, 4, 80);
    
    ctx.fillStyle = COLORS.mpPurple;
    ctx.fillRect(54, -60, 50, 30);
    
    ctx.fillStyle = COLORS.mpWhite;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('M', 70, -40);
    
    ctx.restore();
};

// Landmark factory
export type LandmarkType = 'yacht' | 'statue-of-liberty' | 'eiffel-tower' | 'burj-khalifa' | 'iss' | 'moon';

export const drawLandmark = (
    ctx: CanvasRenderingContext2D,
    type: LandmarkType,
    x: number,
    y: number,
    scale: number = 1
) => {
    switch (type) {
        case 'yacht': drawYacht(ctx, x, y, scale); break;
        case 'statue-of-liberty': drawStatueOfLiberty(ctx, x, y, scale); break;
        case 'eiffel-tower': drawEiffelTower(ctx, x, y, scale); break;
        case 'burj-khalifa': drawBurjKhalifa(ctx, x, y, scale); break;
        case 'iss': drawISS(ctx, x, y, scale); break;
        case 'moon': drawMoon(ctx, x, y, scale); break;
    }
};

// Get character standing position relative to landmark center (top-left of landmark)
export const getCharacterOffset = (type: LandmarkType): { x: number, y: number } => {
    switch (type) {
        case 'yacht': return { x: -80, y: -120 };
        case 'statue-of-liberty': return { x: -100, y: -180 };
        case 'eiffel-tower': return { x: -100, y: -220 };
        case 'burj-khalifa': return { x: -80, y: -280 };
        case 'iss': return { x: -130, y: -80 };
        case 'moon': return { x: -100, y: -60 };
    }
};

