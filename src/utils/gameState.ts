// Game State Management

export type GamePhase = 'character-creation' | 'trivia' | 'victory';

export type Landmark = 'yacht' | 'statue-of-liberty' | 'eiffel-tower' | 'burj-khalifa' | 'iss' | 'moon';

export const LANDMARKS: Landmark[] = [
    'yacht',
    'statue-of-liberty', 
    'eiffel-tower',
    'burj-khalifa',
    'iss',
    'moon'
];

export const LANDMARK_NAMES: Record<Landmark, string> = {
    'yacht': 'The Yacht',
    'statue-of-liberty': 'Statue of Liberty',
    'eiffel-tower': 'Eiffel Tower',
    'burj-khalifa': 'Burj Khalifa',
    'iss': 'International Space Station',
    'moon': 'The Moon'
};

export interface CharacterConfig {
    headIndex: number;
    torsoIndex: number;
    legsIndex: number;
}

export interface GameState {
    phase: GamePhase;
    playerName: string;
    currentLandmarkIndex: number;
    character: CharacterConfig;
    currentQuestionIndex: number;
    answeredQuestions: number[];
    isTransitioning: boolean;
}

export const createInitialGameState = (playerName: string): GameState => ({
    phase: 'character-creation',
    playerName: playerName || 'Player',
    currentLandmarkIndex: 0,
    character: {
        headIndex: 0,
        torsoIndex: 0,
        legsIndex: 0
    },
    currentQuestionIndex: 0,
    answeredQuestions: [],
    isTransitioning: false
});

export const getCurrentLandmark = (state: GameState): Landmark => {
    return LANDMARKS[state.currentLandmarkIndex];
};

export const getNextLandmark = (state: GameState): Landmark | null => {
    if (state.currentLandmarkIndex >= LANDMARKS.length - 1) return null;
    return LANDMARKS[state.currentLandmarkIndex + 1];
};

export const advanceToNextLandmark = (state: GameState): GameState => {
    const nextIndex = state.currentLandmarkIndex + 1;
    
    if (nextIndex >= LANDMARKS.length) {
        // Reached the moon!
        return {
            ...state,
            phase: 'victory',
            currentLandmarkIndex: LANDMARKS.length - 1
        };
    }
    
    return {
        ...state,
        currentLandmarkIndex: nextIndex,
        isTransitioning: true
    };
};

export const startGame = (state: GameState): GameState => ({
    ...state,
    phase: 'trivia',
    currentLandmarkIndex: 0
});

export const finishTransition = (state: GameState): GameState => ({
    ...state,
    isTransitioning: false
});

