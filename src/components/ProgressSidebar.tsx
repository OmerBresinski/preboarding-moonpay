import type React from 'react';
import { MOONBASE_ORDER } from '../utils/gameState';
import { MOONBASE_DATA } from '../utils/moonbases';

interface ProgressSidebarProps {
    currentIndex: number;
    isFlying: boolean;
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ currentIndex }) => {
    return (
        <div style={styles.container}>
            {/* Location list */}
            <div style={styles.locationList}>
                {MOONBASE_ORDER.map((location, index) => {
                    const moonbase = MOONBASE_DATA[location];
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    return (
                        <div key={location} style={styles.locationRow}>
                            {/* Connection line to next */}
                            {index < MOONBASE_ORDER.length - 1 && (
                                <div 
                                    style={{
                                        ...styles.connectionLine,
                                        background: isCompleted 
                                            ? '#9184B2'
                                            : '#33245D'
                                    }}
                                />
                            )}
                            
                            {/* Node */}
                            <div 
                                style={{
                                    ...styles.node,
                                    background: isCompleted 
                                        ? '#9184B2'
                                        : 'transparent',
                                    border: isCompleted
                                        ? 'none'
                                        : isCurrent
                                            ? '1px solid #9184B2'
                                            : '1px solid #33245D'
                                }}
                            >
                                {isCompleted ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                        <title>Completed</title>
                                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="#21173B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <span 
                                        style={{
                                            ...styles.nodeNumber,
                                            color: isCurrent 
                                                ? '#DADADA' 
                                                : 'rgba(145, 132, 178, 0.5)',
                                            fontWeight: isCurrent ? 700 : 600,
                                            fontFamily: isCurrent ? "'Roboto', sans-serif" : undefined
                                        }}
                                    >
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            
                            {/* Location name */}
                            <span 
                                style={{
                                    ...styles.locationName,
                                    color: isCompleted 
                                        ? '#C3B8E0'
                                        : isCurrent 
                                            ? '#DADADA'
                                            : '#33245D',
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: 400,
                                    fontSize: 15
                                }}
                            >
                                {moonbase.officeName}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '0 20px 20px 20px',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    locationList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 0
    },
    locationRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
        minHeight: 44
    },
    connectionLine: {
        position: 'absolute',
        left: 14.5, // Center of 32px node (16px) minus half of 3px line width (1.5px)
        top: 38, // Bottom of centered 32px node in 44px row (6px offset + 32px height)
        width: 3,
        height: 12,
        zIndex: 0
    },
    node: {
        width: 32,
        height: 32,
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 1
    },
    nodeNumber: {
        fontSize: 18,
        fontWeight: 600
    },
    locationName: {
        fontSize: 16,
        transition: 'color 0.2s ease'
    }
};

export default ProgressSidebar;
