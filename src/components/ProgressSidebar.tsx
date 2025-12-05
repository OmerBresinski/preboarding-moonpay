import type React from 'react';
import { MOONBASE_ORDER, MOONBASE_NAMES } from '../utils/gameState';
import { MOONBASE_DATA } from '../utils/moonbases';

interface ProgressSidebarProps {
    currentIndex: number;
    isFlying: boolean;
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ currentIndex, isFlying }) => {
    // Reverse the order so NYC is at top, London at bottom
    const reversedLocations = [...MOONBASE_ORDER].reverse();
    
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.headerIcon}>🗺️</span>
                <span style={styles.headerText}>Journey Map</span>
            </div>
            
            <div style={styles.roadmap}>
                {reversedLocations.map((location, reversedIndex) => {
                    // Convert back to original index (0 = london, 4 = new-york)
                    const originalIndex = MOONBASE_ORDER.indexOf(location);
                    const moonbase = MOONBASE_DATA[location];
                    const isCompleted = originalIndex < currentIndex;
                    const isCurrent = originalIndex === currentIndex;
                    const isNext = originalIndex === currentIndex + 1 && isFlying;
                    
                    return (
                        <div key={location} style={styles.locationRow}>
                            {/* Connection line to previous */}
                            {reversedIndex < reversedLocations.length - 1 && (
                                <div 
                                    style={{
                                        ...styles.connectionLine,
                                        background: isCompleted || isCurrent
                                            ? 'linear-gradient(180deg, #7D00FF 0%, #5a0099 100%)'
                                            : 'rgba(125, 0, 255, 0.2)'
                                    }}
                                />
                            )}
                            
                            {/* Location node */}
                            <div 
                                style={{
                                    ...styles.nodeContainer,
                                    transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                <div 
                                    style={{
                                        ...styles.node,
                                        background: isCompleted 
                                            ? 'linear-gradient(135deg, #7D00FF 0%, #5a0099 100%)'
                                            : isCurrent
                                                ? 'linear-gradient(135deg, #9933FF 0%, #7D00FF 100%)'
                                                : 'rgba(125, 0, 255, 0.1)',
                                        border: isCurrent 
                                            ? '2px solid #B366FF' 
                                            : isCompleted 
                                                ? '2px solid #7D00FF'
                                                : '2px solid rgba(125, 0, 255, 0.3)',
                                        boxShadow: isCurrent 
                                            ? '0 0 20px rgba(125, 0, 255, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.1)'
                                            : isNext
                                                ? '0 0 15px rgba(125, 0, 255, 0.4)'
                                                : 'none'
                                    }}
                                >
                                    {isCompleted ? (
                                        <span style={styles.checkmark}>✓</span>
                                    ) : location === 'moon' ? (
                                        <span style={styles.moonIcon}>🌙</span>
                                    ) : (
                                        <span style={styles.nodeNumber}>{originalIndex + 1}</span>
                                    )}
                                </div>
                                
                                {/* Pulse animation for current */}
                                {isCurrent && (
                                    <div style={styles.pulseRing} />
                                )}
                            </div>
                            
                            {/* Location info */}
                            <div style={styles.locationInfo}>
                                <span 
                                    style={{
                                        ...styles.locationName,
                                        color: isCurrent 
                                            ? '#FFF' 
                                            : isCompleted 
                                                ? '#B366FF'
                                                : 'rgba(255, 255, 255, 0.5)',
                                        fontWeight: isCurrent ? 700 : 500
                                    }}
                                >
                                    {MOONBASE_NAMES[location]}
                                </span>
                                <span 
                                    style={{
                                        ...styles.officeName,
                                        color: isCurrent 
                                            ? 'rgba(255, 255, 255, 0.7)' 
                                            : isCompleted 
                                                ? 'rgba(179, 102, 255, 0.6)'
                                                : 'rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    {moonbase.officeName}
                                </span>
                            </div>
                            
                            {/* Status indicator */}
                            {isCurrent && !isFlying && (
                                <div style={styles.currentIndicator}>
                                    <span style={styles.youAreHere}>You are here</span>
                                </div>
                            )}
                            {isNext && (
                                <div style={styles.nextIndicator}>
                                    <span style={styles.nextUp}>Next stop</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Progress indicator */}
            <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                    <div 
                        style={{
                            ...styles.progressFill,
                            height: `${(currentIndex / (MOONBASE_ORDER.length - 1)) * 100}%`
                        }}
                    />
                </div>
                <span style={styles.progressText}>
                    {currentIndex}/{MOONBASE_ORDER.length - 1} stops
                </span>
            </div>
        </div>
    );
};

const FONT_FAMILY = "'Space Grotesk', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: 'absolute',
        left: 20,
        top: 20,
        background: 'rgba(13, 11, 26, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(125, 0, 255, 0.3)',
        borderRadius: 16,
        padding: '16px 14px',
        minWidth: 180,
        maxHeight: 'calc(100vh - 180px)',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(125, 0, 255, 0.15)',
        zIndex: 50,
        fontFamily: FONT_FAMILY
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(125, 0, 255, 0.2)'
    },
    headerIcon: {
        fontSize: 18
    },
    headerText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 0.5
    },
    roadmap: {
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative'
    },
    locationRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
        paddingLeft: 8,
        minHeight: 48
    },
    connectionLine: {
        position: 'absolute',
        left: 22,
        top: 34,
        width: 3,
        height: 28,
        borderRadius: 2
    },
    nodeContainer: {
        position: 'relative',
        transition: 'transform 0.3s ease'
    },
    node: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: 2
    },
    checkmark: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 700
    },
    moonIcon: {
        fontSize: 16
    },
    nodeNumber: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: 600
    },
    pulseRing: {
        position: 'absolute',
        top: -4,
        left: -4,
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '2px solid rgba(125, 0, 255, 0.5)',
        animation: 'pulse 2s ease-in-out infinite'
    },
    locationInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
    },
    locationName: {
        fontSize: 13,
        transition: 'color 0.3s ease'
    },
    officeName: {
        fontSize: 10,
        transition: 'color 0.3s ease'
    },
    currentIndicator: {
        position: 'absolute',
        right: -8,
        top: '50%',
        transform: 'translateY(-50%)'
    },
    youAreHere: {
        background: 'linear-gradient(135deg, #7D00FF 0%, #5a0099 100%)',
        color: '#FFF',
        fontSize: 8,
        fontWeight: 700,
        padding: '3px 6px',
        borderRadius: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    nextIndicator: {
        position: 'absolute',
        right: -8,
        top: '50%',
        transform: 'translateY(-50%)'
    },
    nextUp: {
        background: 'rgba(125, 0, 255, 0.3)',
        color: '#B366FF',
        fontSize: 8,
        fontWeight: 600,
        padding: '3px 6px',
        borderRadius: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    progressContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid rgba(125, 0, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
    },
    progressBar: {
        width: 6,
        height: 40,
        background: 'rgba(125, 0, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative'
    },
    progressFill: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'linear-gradient(0deg, #7D00FF 0%, #B366FF 100%)',
        borderRadius: 3,
        transition: 'height 0.5s ease-out'
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        fontWeight: 500
    }
};

// Add keyframes for pulse animation via a style tag
const PulseStyles = () => (
    <style>{`
        @keyframes pulse {
            0%, 100% { 
                transform: scale(1);
                opacity: 1;
            }
            50% { 
                transform: scale(1.2);
                opacity: 0.5;
            }
        }
    `}</style>
);

// Export with styles
const ProgressSidebarWithStyles: React.FC<ProgressSidebarProps> = (props) => (
    <>
        <PulseStyles />
        <ProgressSidebar {...props} />
    </>
);

export default ProgressSidebarWithStyles;

