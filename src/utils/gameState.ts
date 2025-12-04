// Game State Management for 2D MoonBase Game

import { MOONBASE_ORDER, type MoonBaseLocation, getMoonBaseByIndex, isFinalDestination } from './moonbases';

export type GamePhase = 'character-creation' | 'trivia' | 'victory';

// Re-export for convenience
export type { MoonBaseLocation };
export { MOONBASE_ORDER, getMoonBaseByIndex };

export const MOONBASE_NAMES: Record<MoonBaseLocation, string> = {
    'london': 'London',
    'amsterdam': 'Amsterdam',
    'barcelona': 'Barcelona',
    'dublin': 'Dublin',
    'new-york': 'New York',
    'moon': 'The Moon'
};

export interface GameState {
    phase: GamePhase;
    playerName: string;
    currentLocationIndex: number;
    selectedCharacterPreset: number;
    currentQuestionIndex: number;
    answeredQuestions: number[];
    isTransitioning: boolean;
}

export const createInitialGameState = (playerName: string): GameState => ({
    phase: 'character-creation',
    playerName: playerName || 'Player',
    currentLocationIndex: 0,
    selectedCharacterPreset: 0,
    currentQuestionIndex: 0,
    answeredQuestions: [],
    isTransitioning: false
});

export const getCurrentLocation = (state: GameState): MoonBaseLocation => {
    return MOONBASE_ORDER[state.currentLocationIndex];
};

export const getNextLocation = (state: GameState): MoonBaseLocation | null => {
    if (state.currentLocationIndex >= MOONBASE_ORDER.length - 1) return null;
    return MOONBASE_ORDER[state.currentLocationIndex + 1];
};

export const advanceToNextLocation = (state: GameState): GameState => {
    const nextIndex = state.currentLocationIndex + 1;
    
    if (nextIndex >= MOONBASE_ORDER.length) {
        // Reached the moon!
        return {
            ...state,
            phase: 'victory',
            currentLocationIndex: MOONBASE_ORDER.length - 1
        };
    }
    
    return {
        ...state,
        currentLocationIndex: nextIndex,
        isTransitioning: true
    };
};

export const startGame = (state: GameState): GameState => ({
    ...state,
    phase: 'trivia',
    currentLocationIndex: 0
});

export const finishTransition = (state: GameState): GameState => ({
    ...state,
    isTransitioning: false
});

export const isAtFinalDestination = (state: GameState): boolean => {
    return isFinalDestination(getCurrentLocation(state));
};
