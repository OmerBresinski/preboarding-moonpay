// MoonBase Location Data
// Each location has a stylized country/state outline, pin position, and office info

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
    canvasPosition: { x: number; y: number };
    // SVG path data for the country/state outline (used if no mapImage)
    countryPath: string;
    // Optional: path to an image file to use instead of SVG path
    mapImage?: string;
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
        canvasPosition: { x: 0.1, y: 0.5 }, // Evenly spaced: 0.1
        mapScale: 0.18,
        countryPath: `M 45 5 L 55 10 L 60 8 L 65 15 L 60 25 L 65 30 Z`,
        mapImage: '/src/assets/london.png',
        pinOffset: { x: 0.55, y: 0.85 }
    },
    'amsterdam': {
        id: 'amsterdam',
        name: 'Amsterdam',
        country: 'Netherlands',
        officeName: 'MoonPay Amsterdam',
        funFact: 'The Netherlands is a hub for European fintech! Our Amsterdam team brings Dutch innovation to crypto accessibility.',
        canvasPosition: { x: 0.3, y: 0.5 }, // Evenly spaced: 0.3
        mapScale: 0.18,
        countryPath: `M 20 10 L 30 5 L 45 8 L 55 5 L 60 15 Z`,
        mapImage: '/src/assets/amsterdam.png',
        pinOffset: { x: 0.45, y: 0.35 }
    },
    'barcelona': {
        id: 'barcelona',
        name: 'Barcelona',
        country: 'Spain',
        officeName: 'MoonPay Barcelona',
        funFact: 'Barcelona combines Mediterranean culture with tech innovation. Our team here loves the beach and blockchain equally!',
        canvasPosition: { x: 0.5, y: 0.5 }, // Evenly spaced: 0.5
        mapScale: 0.18,
        countryPath: `M 15 15 L 35 8 L 60 10 L 75 18 L 85 15 Z`,
        mapImage: '/src/assets/barcelona.png',
        pinOffset: { x: 0.85, y: 0.25 }
    },
    'dublin': {
        id: 'dublin',
        name: 'Dublin',
        country: 'Ireland',
        officeName: 'MoonPay Dublin',
        funFact: 'Ireland\'s tech scene is legendary! Dublin is home to many of the world\'s leading tech companies, and now MoonPay too.',
        canvasPosition: { x: 0.7, y: 0.5 }, // Evenly spaced: 0.7
        mapScale: 0.18,
        countryPath: `M 40 5 L 55 10 L 60 20 L 65 35 L 60 50 Z`,
        mapImage: '/src/assets/dublin.png',
        pinOffset: { x: 0.65, y: 0.35 }
    },
    'new-york': {
        id: 'new-york',
        name: 'New York',
        country: 'United States',
        officeName: 'MoonPay NYC',
        funFact: 'The city that never sleeps! Our New York office operates in the heart of the global financial capital.',
        canvasPosition: { x: 0.9, y: 0.5 }, // Evenly spaced: 0.9
        mapScale: 0.18,
        countryPath: `M 20 10 L 60 10 L 60 45 L 85 45 L 95 55 Z`,
        mapImage: '/src/assets/new-york.png',
        pinOffset: { x: 0.75, y: 0.88 }
    },
    'moon': {
        id: 'moon',
        name: 'The Moon',
        country: 'Space',
        officeName: 'MoonPay Lunar Base',
        funFact: 'Welcome to the MoonPay Lunar Base! As we say: "To the moon!" - but for us, that\'s just the beginning.',
        canvasPosition: { x: 1.15, y: 0.5 }, // Off-screen initially, animated in after NYC
        mapScale: 1.3, // Bigger moon!
        countryPath: `M 50 2 C 78 2, 98 22, 98 50 C 98 78, 78 98, 50 98 C 22 98, 2 78, 2 50 C 2 22, 22 2, 50 2 Z`,
        mapImage: '/src/assets/moon.png',
        pinOffset: { x: 0.5, y: 0.5 }
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