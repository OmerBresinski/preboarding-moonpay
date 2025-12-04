// MoonBase Location Data
// Each location has a stylized country outline, pin position, and office info

export type MoonBaseLocation = 'london' | 'amsterdam' | 'barcelona' | 'dublin' | 'new-york' | 'moon';

export const MOONBASE_ORDER: MoonBaseLocation[] = [
    'london',
    'amsterdam', 
    'barcelona',
    'dublin',
    'new-york',
    'moon'
];

export interface MoonBaseInfo {
    id: MoonBaseLocation;
    name: string;
    country: string;
    officeName: string;
    funFact: string;
    // Canvas position (percentage of canvas width/height for responsive positioning)
    // Horizontal layout: left to right
    canvasPosition: { x: number; y: number };
    // SVG path data for the country outline (more realistic shapes)
    countryPath: string;
    // Map scale for this country
    mapScale: number;
    // Pin position relative to country path (0-1 within bounding box)
    pinOffset: { x: number; y: number };
}

export const MOONBASE_DATA: Record<MoonBaseLocation, MoonBaseInfo> = {
    'london': {
        id: 'london',
        name: 'London',
        country: 'United Kingdom',
        officeName: 'MoonPay HQ',
        funFact: 'Our London office is where it all started! Founded in 2019, MoonPay now serves over 15 million customers worldwide.',
        canvasPosition: { x: 0.18, y: 0.5 },
        mapScale: 1.8,
        // Realistic UK silhouette - Great Britain + Northern Ireland
        countryPath: `
            M 45 5 
            L 50 8 L 52 5 L 55 8 L 53 12 L 56 15 L 54 18 L 57 22 
            L 55 28 L 58 32 L 55 38 L 52 42 L 48 45 L 50 50 
            L 47 55 L 50 60 L 48 65 L 52 70 L 48 75 L 45 78 
            L 42 82 L 38 85 L 35 82 L 32 85 L 28 82 L 25 78 
            L 22 75 L 25 70 L 22 65 L 25 60 L 22 55 L 25 50 
            L 22 45 L 25 40 L 28 35 L 25 30 L 28 25 L 32 20 
            L 35 15 L 38 12 L 42 8 Z
            M 15 35 L 18 32 L 22 35 L 25 32 L 22 38 L 18 42 L 15 38 Z
        `,
        pinOffset: { x: 0.55, y: 0.7 }
    },
    'amsterdam': {
        id: 'amsterdam',
        name: 'Amsterdam',
        country: 'Netherlands',
        officeName: 'MoonPay Amsterdam',
        funFact: 'The Netherlands is a hub for European fintech! Our Amsterdam team brings Dutch innovation to crypto accessibility.',
        canvasPosition: { x: 0.32, y: 0.5 },
        mapScale: 2.2,
        // Netherlands silhouette - distinctive shape with Frisian Islands
        countryPath: `
            M 25 10 L 35 8 L 45 5 L 55 8 L 60 12 L 58 18 
            L 62 22 L 60 28 L 55 32 L 58 38 L 55 45 L 50 50 
            L 45 55 L 38 60 L 32 58 L 25 55 L 20 50 L 15 45 
            L 12 38 L 15 30 L 12 22 L 18 15 Z
            M 30 2 L 35 0 L 38 3 L 35 6 L 30 5 Z
            M 42 0 L 48 2 L 45 5 L 40 3 Z
        `,
        pinOffset: { x: 0.45, y: 0.35 }
    },
    'barcelona': {
        id: 'barcelona',
        name: 'Barcelona',
        country: 'Spain',
        officeName: 'MoonPay Barcelona',
        funFact: 'Barcelona combines Mediterranean culture with tech innovation. Our team here loves the beach and blockchain equally!',
        canvasPosition: { x: 0.46, y: 0.5 },
        mapScale: 1.2,
        // Spain silhouette - Iberian peninsula shape with Portugal indent
        countryPath: `
            M 20 15 L 30 10 L 45 8 L 60 10 L 75 15 L 85 12 
            L 90 18 L 88 25 L 92 32 L 88 40 L 85 48 L 80 55 
            L 72 60 L 65 58 L 58 62 L 50 60 L 42 65 L 35 62 
            L 28 58 L 22 55 L 15 50 L 10 42 L 8 35 L 5 28 
            L 8 22 L 12 18 L 15 22 L 18 28 L 15 35 L 18 42 
            L 12 48 L 15 42 L 12 35 L 15 28 L 12 22 L 15 18 Z
        `,
        pinOffset: { x: 0.8, y: 0.25 }
    },
    'dublin': {
        id: 'dublin',
        name: 'Dublin',
        country: 'Ireland',
        officeName: 'MoonPay Dublin',
        funFact: 'Ireland\'s tech scene is legendary! Dublin is home to many of the world\'s leading tech companies, and now MoonPay too.',
        canvasPosition: { x: 0.60, y: 0.5 },
        mapScale: 2.0,
        // Ireland silhouette - distinctive west coast inlets
        countryPath: `
            M 45 5 L 52 8 L 58 15 L 62 22 L 60 30 L 65 38 
            L 62 45 L 58 52 L 55 60 L 50 65 L 45 70 L 38 68 
            L 32 72 L 25 68 L 20 62 L 15 55 L 12 48 L 8 40 
            L 12 35 L 8 28 L 15 25 L 12 18 L 18 15 L 15 10 
            L 22 8 L 28 12 L 35 8 L 40 5 Z
        `,
        pinOffset: { x: 0.6, y: 0.35 }
    },
    'new-york': {
        id: 'new-york',
        name: 'New York',
        country: 'United States',
        officeName: 'MoonPay NYC',
        funFact: 'The city that never sleeps! Our New York office operates in the heart of the global financial capital.',
        canvasPosition: { x: 0.74, y: 0.5 },
        mapScale: 0.8,
        // USA silhouette - continental US shape
        countryPath: `
            M 5 30 L 8 25 L 15 22 L 25 18 L 35 15 L 45 12 
            L 55 10 L 65 12 L 75 10 L 85 15 L 92 12 L 98 18 
            L 100 25 L 98 32 L 95 38 L 92 42 L 88 48 L 82 52 
            L 75 55 L 68 58 L 60 55 L 52 58 L 45 55 L 38 58 
            L 30 55 L 22 52 L 15 48 L 10 42 L 5 35 Z
            M 8 55 L 12 52 L 18 55 L 22 60 L 18 65 L 12 62 L 8 58 Z
        `,
        pinOffset: { x: 0.88, y: 0.28 }
    },
    'moon': {
        id: 'moon',
        name: 'The Moon',
        country: 'Space',
        officeName: 'MoonPay Lunar Base',
        funFact: 'Welcome to the MoonPay Lunar Base! As we say: "To the moon!" - but for us, that\'s just the beginning.',
        canvasPosition: { x: 0.85, y: 0.5 },
        mapScale: 3.5, // HUGE moon
        // Moon with MANY craters - detailed lunar surface
        countryPath: `
            M 50 2 
            C 78 2, 98 22, 98 50 
            C 98 78, 78 98, 50 98 
            C 22 98, 2 78, 2 50 
            C 2 22, 22 2, 50 2 Z
            M 25 20 C 32 14, 44 16, 42 26 C 40 36, 28 38, 24 32 C 20 26, 18 22, 25 20 Z
            M 65 15 C 72 10, 82 14, 80 24 C 78 34, 68 36, 64 30 C 60 24, 58 18, 65 15 Z
            M 18 45 C 24 40, 34 42, 32 52 C 30 62, 20 64, 16 58 C 12 52, 12 48, 18 45 Z
            M 55 35 C 68 28, 82 34, 78 48 C 74 62, 58 68, 50 60 C 42 52, 42 42, 55 35 Z
            M 30 65 C 38 58, 50 62, 48 74 C 46 86, 34 88, 28 80 C 22 72, 22 68, 30 65 Z
            M 70 55 C 78 50, 88 54, 86 66 C 84 78, 74 82, 68 74 C 62 66, 62 58, 70 55 Z
            M 42 12 C 46 8, 54 10, 52 16 C 50 22, 44 24, 42 20 C 40 16, 38 14, 42 12 Z
            M 78 40 C 84 36, 92 40, 90 48 C 88 56, 80 58, 76 52 C 72 46, 72 42, 78 40 Z
            M 12 28 C 16 24, 24 26, 22 34 C 20 42, 14 44, 10 38 C 6 32, 8 28, 12 28 Z
            M 60 78 C 68 72, 80 76, 76 86 C 72 92, 62 92, 58 86 C 54 80, 52 76, 60 78 Z
            M 35 48 C 40 44, 48 46, 46 52 C 44 58, 38 60, 34 56 C 30 52, 30 48, 35 48 Z
            M 85 72 C 90 68, 96 72, 94 80 C 92 86, 86 88, 82 82 C 78 76, 80 70, 85 72 Z
        `,
        pinOffset: { x: 0.5, y: 0.45 }
    }
};

export const getMoonBaseByIndex = (index: number): MoonBaseInfo => {
    const location = MOONBASE_ORDER[index];
    return MOONBASE_DATA[location];
};

export const getMoonBaseName = (location: MoonBaseLocation): string => {
    return MOONBASE_DATA[location].name;
};

export const getNextMoonBase = (current: MoonBaseLocation): MoonBaseLocation | null => {
    const currentIndex = MOONBASE_ORDER.indexOf(current);
    if (currentIndex === -1 || currentIndex >= MOONBASE_ORDER.length - 1) return null;
    return MOONBASE_ORDER[currentIndex + 1];
};

export const isFinalDestination = (location: MoonBaseLocation): boolean => {
    return location === 'moon';
};
