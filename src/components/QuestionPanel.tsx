import type React from 'react';
import { useState, useRef, useLayoutEffect } from 'react';
import type { TriviaQuestion } from '../utils/triviaQuestions';
import type { MoonBaseLocation } from '../utils/gameState';

interface QuestionPanelProps {
    question: TriviaQuestion;
    currentLocation: MoonBaseLocation;
    currentIndex: number;
    totalLocations: number;
    onAnswer: (isCorrect: boolean) => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
    question,
    currentLocation,
    currentIndex,
    totalLocations,
    onAnswer
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isWrong, setIsWrong] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const prevQuestionId = useRef(question.id);

    // Reset state when question changes using ref comparison
    useLayoutEffect(() => {
        if (prevQuestionId.current !== question.id) {
            setSelectedIndex(null);
            setIsWrong(false);
            setIsCorrect(false);
            setHoveredIndex(null);
            prevQuestionId.current = question.id;
        }
    });

    const handleAnswer = (index: number) => {
        if (isCorrect) return;
        
        // Clear previous wrong state if selecting a new answer
        if (isWrong && selectedIndex !== index) {
            setIsWrong(false);
        }
        
        setSelectedIndex(index);
        
        if (index === question.correctIndex) {
            setIsCorrect(true);
            setIsWrong(false);
            setTimeout(() => {
                onAnswer(true);
            }, 1200); // Slightly longer delay to see the success state
        } else {
            setIsWrong(true);
            // Don't auto-clear wrong state
        }
    };

    return (
        <div style={styles.panel}>
            {/* Top Progress Bar */}
            <div style={styles.topProgressContainer}>
                {Array.from({ length: totalLocations }).map((_, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;
                    return (
                        <div 
                            key={index} 
                            style={{
                                ...styles.progressSegment,
                                backgroundColor: isCompleted || isActive ? '#A252DE' : '#2D264F',
                                opacity: 1 // Removing opacity difference, relying on color
                            }} 
                        />
                    );
                })}
                <span style={styles.progressCounter}>{currentIndex + 1}/{totalLocations}</span>
            </div>

            {/* Question */}
            <div style={styles.questionRow}>
                <span style={styles.questionText}>{question.question}</span>
            </div>
            
            {/* Answer Buttons */}
            <div style={styles.answersRow}>
                {question.options.map((option, index) => {
                    const isSelected = selectedIndex === index;
                    const isCorrectAnswer = isCorrect && index === question.correctIndex;
                    const isWrongAnswer = isSelected && isWrong;
                    const isHovered = hoveredIndex === index && !isCorrect && !isSelected;
                    
                    let borderColor = 'transparent'; // Default border
                    
                    if (isCorrectAnswer) {
                        borderColor = '#18B845';
                    }
                    else if (isWrongAnswer) {
                        borderColor = '#B12525';
                    }
                    else if (isSelected) {
                        borderColor = '#7D00FF';
                    }
                    else if (isHovered) {
                        borderColor = '#9A94AC';
                    }

                    return (
                        <button
                            key={`${question.id}-${index}`}
                            type="button"
                            onClick={() => handleAnswer(index)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            disabled={isCorrect}
                            style={{
                                ...styles.answerButton,
                                borderColor: borderColor,
                                backgroundColor: '#1A162D', // Dark bg
                                transform: isWrongAnswer ? 'translateX(0)' : undefined
                            }}
                        >
                            <span style={styles.answerText}>{option}</span>
                            
                            {/* Icons */}
                            {isCorrectAnswer && (
                                <div style={{...styles.iconContainer}}>
                                    <img src="/src/assets/v-correct.svg" alt="Correct" style={{ width: 20, height: 20 }} />
                                </div>
                            )}
                            
                            {isWrongAnswer && (
                                <div style={{...styles.iconContainer}}>
                                    <img src="/src/assets/x-wrong.svg" alt="Wrong" style={{ width: 20, height: 20 }} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <style>{`
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </div>
    );
};

const FONT_FAMILY = "'Space Grotesk', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const styles: { [key: string]: React.CSSProperties } = {
    panel: {
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 804,
        maxHeight: 234,
        padding: 24,
        borderRadius: 8,
        backgroundColor: '#100B1FE5', 
        border: 'none',
        boxShadow: '0 0 30px 6px rgba(85, 0, 144, 0.5)', // #55009080 = rgba(85, 0, 144, 0.5)
        fontFamily: FONT_FAMILY,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
    },
    questionRow: {
        marginBottom: 12
    },
    questionText: {
        color: '#DADADA',
        fontSize: 15,
        fontWeight: 400,
        lineHeight: 1.5,
        fontFamily: "'Roboto', sans-serif"
    },
    answersRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12
    },
    answerButton: {
        position: 'relative',
        padding: '0 12px',
        height: 50,
        border: '1px solid',
        boxSizing: 'border-box',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left'
    },
    answerText: {
        color: '#DADADA',
        fontSize: 15,
        fontWeight: 400,
        fontFamily: "'Roboto', sans-serif"
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    topProgressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
        position: 'relative',
        height: 20
    },
    progressSegment: {
        flex: 1,
        height: 4
    },
    progressCounter: {
        color: '#DADADA',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "'Roboto', sans-serif",
        marginLeft: 8
    }
};

export default QuestionPanel;
