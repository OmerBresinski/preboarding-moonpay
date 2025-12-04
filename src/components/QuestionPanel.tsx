import type React from 'react';
import { useState, useRef, useLayoutEffect } from 'react';
import type { TriviaQuestion } from '../utils/triviaQuestions';
import type { MoonBaseLocation } from '../utils/gameState';
import { MOONBASE_NAMES } from '../utils/gameState';

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
    const prevQuestionId = useRef(question.id);

    // Reset state when question changes using ref comparison
    useLayoutEffect(() => {
        if (prevQuestionId.current !== question.id) {
            setSelectedIndex(null);
            setIsWrong(false);
            setIsCorrect(false);
            prevQuestionId.current = question.id;
        }
    });

    const handleAnswer = (index: number) => {
        if (isCorrect) return;
        
        setSelectedIndex(index);
        
        if (index === question.correctIndex) {
            setIsCorrect(true);
            setIsWrong(false);
            setTimeout(() => {
                onAnswer(true);
            }, 800);
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 400);
        }
    };

    const progressPercent = (currentIndex / (totalLocations - 1)) * 100;

    return (
        <div style={{
            ...styles.panel,
            borderColor: isWrong ? 'rgba(255, 80, 80, 0.6)' : 'rgba(125, 0, 255, 0.3)',
            boxShadow: isWrong 
                ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 80, 80, 0.3)' 
                : '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}>
            {/* Progress Bar */}
            <div style={styles.progressRow}>
                <span style={styles.locationLabel}>📍 {MOONBASE_NAMES[currentLocation]}</span>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
                </div>
                <span style={styles.progressText}>{currentIndex + 1}/{totalLocations}</span>
            </div>
            
            {/* Question */}
            <div style={styles.questionRow}>
                <span style={styles.questionText}>{question.question}</span>
            </div>
            
            {/* Answer Buttons */}
            <div style={styles.answersRow}>
                {question.options.map((option, index) => {
                    const isSelectedWrong = selectedIndex === index && isWrong;
                    const isCorrectAnswer = isCorrect && index === question.correctIndex;
                    
                    return (
                        <button
                            key={`${question.id}-${index}`}
                            type="button"
                            onClick={() => handleAnswer(index)}
                            disabled={isCorrect}
                            style={{
                                ...styles.answerButton,
                                background: 
                                    isCorrectAnswer ? 'linear-gradient(135deg, #00AA00 0%, #00CC44 100%)' :
                                    isSelectedWrong ? 'linear-gradient(135deg, #AA0000 0%, #CC2222 100%)' :
                                    selectedIndex === index ? 'linear-gradient(135deg, #7D00FF 0%, #9933FF 100%)' : 
                                    'rgba(255, 255, 255, 0.05)',
                                cursor: isCorrect ? 'default' : 'pointer',
                                borderColor: 
                                    isSelectedWrong ? 'rgba(255, 80, 80, 0.6)' :
                                    selectedIndex === index ? 'rgba(125, 0, 255, 0.5)' : 
                                    'rgba(255, 255, 255, 0.1)',
                                animation: isSelectedWrong ? 'buttonShake 0.3s ease-in-out' : undefined
                            }}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            
            {/* Feedback */}
            {isWrong && <div style={{...styles.feedback, color: '#FF6666'}}>❌ Try again!</div>}
            {isCorrect && <div style={{ ...styles.feedback, color: '#66FF66', borderColor: 'rgba(0, 200, 0, 0.3)' }}>✅ Correct! Flying to next destination...</div>}
            
            {/* Button shake animation - only moves the wrong button slightly */}
            <style>{`
                @keyframes buttonShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-3px); }
                    50% { transform: translateX(3px); }
                    75% { transform: translateX(-2px); }
                }
            `}</style>
        </div>
    );
};

const FONT_FAMILY = "'Space Grotesk', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const styles: { [key: string]: React.CSSProperties } = {
    panel: {
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 280px)',
        maxWidth: 900,
        background: 'rgba(13, 11, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '20px 28px',
        borderRadius: 16,
        border: '1px solid rgba(125, 0, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)',
        fontFamily: FONT_FAMILY,
        zIndex: 50
    },
    progressRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        marginBottom: 16
    },
    locationLabel: {
        color: '#FFF',
        fontSize: 14,
        whiteSpace: 'nowrap',
        fontWeight: 600,
        letterSpacing: 0.3
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(125, 0, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #7D00FF 0%, #B366FF 100%)',
        transition: 'width 0.5s ease-out',
        borderRadius: 3
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        fontWeight: 600
    },
    questionRow: {
        marginBottom: 18
    },
    questionText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 500,
        lineHeight: 1.5
    },
    answersRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12
    },
    answerButton: {
        padding: '14px 18px',
        fontSize: 14,
        color: '#FFF',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        transition: 'all 0.2s ease',
        fontWeight: 500,
        fontFamily: FONT_FAMILY,
        textAlign: 'left'
    },
    feedback: {
        position: 'absolute',
        top: -48,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        background: 'rgba(13, 11, 26, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 68, 68, 0.3)',
        whiteSpace: 'nowrap'
    }
};

export default QuestionPanel;
