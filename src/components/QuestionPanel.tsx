import type React from 'react';
import { useState, useRef, useLayoutEffect } from 'react';
import type { TriviaQuestion } from '../utils/triviaQuestions';
import type { Landmark } from '../utils/gameState';
import { LANDMARK_NAMES } from '../utils/gameState';

interface QuestionPanelProps {
    question: TriviaQuestion;
    currentLandmark: Landmark;
    currentIndex: number;
    totalLandmarks: number;
    onAnswer: (isCorrect: boolean) => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
    question,
    currentLandmark,
    currentIndex,
    totalLandmarks,
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

    const progressPercent = (currentIndex / (totalLandmarks - 1)) * 100;

    return (
        <div style={{
            ...styles.panel,
            animation: isWrong ? 'shake 0.4s ease-in-out' : undefined
        }}>
            {/* Progress Bar */}
            <div style={styles.progressRow}>
                <span style={styles.locationLabel}>📍 {LANDMARK_NAMES[currentLandmark]}</span>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
                </div>
                <span style={styles.progressText}>{currentIndex + 1}/{totalLandmarks}</span>
            </div>
            
            {/* Question */}
            <div style={styles.questionRow}>
                <span style={styles.questionText}>{question.question}</span>
            </div>
            
            {/* Answer Buttons */}
            <div style={styles.answersRow}>
                {question.options.map((option, index) => (
                    <button
                        key={`${question.id}-${index}`}
                        type="button"
                        onClick={() => handleAnswer(index)}
                        disabled={isCorrect}
                        style={{
                            ...styles.answerButton,
                            backgroundColor: 
                                isCorrect && index === question.correctIndex ? '#00AA00' :
                                selectedIndex === index && isWrong ? '#AA0000' :
                                selectedIndex === index ? '#5A00CC' : '#333',
                            cursor: isCorrect ? 'default' : 'pointer',
                            transform: selectedIndex === index && isWrong ? 'translateX(-2px)' : 'none'
                        }}
                    >
                        {option}
                    </button>
                ))}
            </div>
            
            {/* Feedback */}
            {isWrong && <div style={styles.feedback}>❌ Try again!</div>}
            {isCorrect && <div style={{ ...styles.feedback, color: '#00FF00' }}>✅ Correct!</div>}
            
            {/* Shake animation */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-3px); }
                    40%, 80% { transform: translateX(3px); }
                }
            `}</style>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    panel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: '12px 20px',
        borderTop: '3px solid #7D00FF',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    progressRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        marginBottom: 10
    },
    locationLabel: {
        color: '#FFF',
        fontSize: 14,
        whiteSpace: 'nowrap'
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#333',
        borderRadius: 4,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#7D00FF',
        transition: 'width 0.5s ease-out'
    },
    progressText: {
        color: '#888',
        fontSize: 14
    },
    questionRow: {
        marginBottom: 10
    },
    questionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 500
    },
    answersRow: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
    },
    answerButton: {
        flex: '1 1 calc(25% - 10px)',
        minWidth: 120,
        padding: '10px 15px',
        fontSize: 14,
        color: '#FFF',
        border: 'none',
        borderRadius: 6,
        transition: 'all 0.15s ease'
    },
    feedback: {
        position: 'absolute',
        top: -30,
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#FF4444',
        fontSize: 16,
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
    }
};

export default QuestionPanel;
