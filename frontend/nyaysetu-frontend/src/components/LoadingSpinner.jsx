import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'medium', fullScreen = false, message = 'Loading...' }) {
    const sizes = {
        small: 24,
        medium: 40,
        large: 60
    };

    const spinnerSize = sizes[size] || sizes.medium;

    const content = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <Loader2 size={spinnerSize} style={{ color: '#8b5cf6' }} />
            </motion.div>
            {message && (
                <p style={{
                    color: '#94a3b8',
                    fontSize: size === 'small' ? '0.875rem' : '1rem',
                    fontWeight: '600'
                }}>
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                {content}
            </div>
        );
    }

    return content;
}

// Skeleton loader for content
export function SkeletonLoader({ type = 'card', count = 1 }) {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    const cardSkeleton = (
        <div style={{
            padding: '2rem',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
            {/* Icon placeholder */}
            <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(139, 92, 246, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '1rem',
                marginBottom: '1.5rem'
            }} />

            {/* Title placeholder */}
            <div style={{
                width: '70%',
                height: '24px',
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(139, 92, 246, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
            }} />

            {/* Description placeholder */}
            <div style={{
                width: '100%',
                height: '16px',
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(139, 92, 246, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
            }} />
            <div style={{
                width: '85%',
                height: '16px',
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(139, 92, 246, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '0.5rem'
            }} />

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );

    if (type === 'card') {
        return (
            <>
                {skeletons.map((i) => (
                    <div key={i}>
                        {cardSkeleton}
                    </div>
                ))}
            </>
        );
    }

    return null;
}
