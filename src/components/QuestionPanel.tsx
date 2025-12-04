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
                            background: 
                                isCorrect && index === question.correctIndex ? 'linear-gradient(135deg, #00AA00 0%, #00CC44 100%)' :
                                selectedIndex === index && isWrong ? 'linear-gradient(135deg, #AA0000 0%, #CC2222 100%)' :
                                selectedIndex === index ? 'linear-gradient(135deg, #7D00FF 0%, #9933FF 100%)' : 
                                'rgba(255, 255, 255, 0.05)',
                            cursor: isCorrect ? 'default' : 'pointer',
                            transform: selectedIndex === index && isWrong ? 'translateX(-2px)' : 'none',
                            borderColor: selectedIndex === index ? 'rgba(125, 0, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        {option}
                    </button>
                ))}
            </div>
            
            {/* Feedback */}
            {isWrong && <div style={{...styles.feedback, color: '#FF6666'}}>❌ Try again!</div>}
            {isCorrect && <div style={{ ...styles.feedback, color: '#66FF66', borderColor: 'rgba(0, 200, 0, 0.3)' }}>✅ Correct!</div>}
            
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
        bottom: 20,
        left: 20,
        right: 20,
        background: 'rgba(20, 10, 40, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: '16px 24px',
        borderRadius: 16,
        border: '1px solid rgba(125, 0, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)',
        fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif"
    },
    progressRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        marginBottom: 12
    },
    locationLabel: {
        color: '#FFF',
        fontSize: 14,
        whiteSpace: 'nowrap',
        fontWeight: 500
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #7D00FF 0%, #A855F7 100%)',
        transition: 'width 0.5s ease-out',
        borderRadius: 3
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        fontWeight: 500
    },
    questionRow: {
        marginBottom: 14
    },
    questionText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.4
    },
    answersRow: {
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap'
    },
    answerButton: {
        flex: '1 1 calc(25% - 10px)',
        minWidth: 120,
        padding: '12px 16px',
        fontSize: 14,
        color: '#FFF',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        transition: 'all 0.15s ease',
        fontWeight: 500
    },
    feedback: {
        position: 'absolute',
        top: -40,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        background: 'rgba(20, 10, 40, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 68, 68, 0.3)'
    }
};

export default QuestionPanel;
