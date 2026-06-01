import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GuestInlineCTA from '../guest/GuestInlineCTA';
import gsap from 'gsap';

export default function QuickCard({ card, i, isSubmitCase, handleSubmitCaseClick, inlineMessage, goToSignup }) {
    const cardRef = useRef(null);
    const innerRef = useRef(null);
    const glowRef = useRef(null);
    const contentRefs = useRef([]);
    const iconRef = useRef(null);
    const buttonRef = useRef(null);
    const tiltWrapperRef = useRef(null);
    const rotatingBorderRef = useRef(null);
    const borderContainerRef = useRef(null);
    // Keep track of elements for staggered 3D popup
    const addToRefs = (el) => {
        if (el && !contentRefs.current.includes(el)) {
            contentRefs.current.push(el);
        }
    };

    useEffect(() => {
        const cardEl = cardRef.current;
        const inner = innerRef.current;
        const glow = glowRef.current;
        const elements = contentRefs.current;
        const icon = iconRef.current;
        const button = buttonRef.current;

        if (!cardEl || !inner) return;

        // 1. HARD GSAP Entrance Animation (Staggered elastic spring)
        gsap.fromTo(cardEl,
            { opacity: 0, y: 150, rotateX: 45, scale: 0.7, z: -200 },
            {
                opacity: 1, y: 0, rotateX: 0, scale: 1, z: 0,
                duration: 1.5,
                delay: 0.2 + (i * 0.15),
                ease: 'elastic.out(1, 0.6)',
                clearProps: 'transform' // clean up to prevent conflicts with 3D hover
            }
        );

        // 2. Continuous Floating Animation for Icon (Smooth sine wave)
        const floatTween = gsap.to(icon, {
            y: "-12px",
            rotateZ: "6deg",
            rotateX: "10deg",
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // 3. Continuous Rotating Border Light
        const borderRotator = gsap.to(rotatingBorderRef.current, {
            rotation: 360,
            duration: 4,
            repeat: -1,
            ease: "none"
        });

        // 4. Fast Mouse Followers (Zero-latency quickTo)
        const xTo = gsap.quickTo(tiltWrapperRef.current, "rotateY", { duration: 0.6, ease: "power4.out" });
        const yTo = gsap.quickTo(tiltWrapperRef.current, "rotateX", { duration: 0.6, ease: "power4.out" });
        const glowX = gsap.quickTo(glow, "left", { duration: 0.3, ease: "power2.out" });
        const glowY = gsap.quickTo(glow, "top", { duration: 0.3, ease: "power2.out" });

        // Z-axis parallax followers for layers (XY movement based on mouse)
        const zLayers = elements.map((el, index) => {
            const factor = (index + 1) * 25; // Much deeper parallax factor (was 12)
            return {
                x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
                y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
                factor
            };
        });

        let bounds;

        const handleMouseMove = (e) => {
            if (!bounds) bounds = cardEl.getBoundingClientRect();

            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height / 2;

            // Normalize mouse position (-1 to 1)
            const mouseX = (e.clientX - centerX) / (bounds.width / 2);
            const mouseY = (e.clientY - centerY) / (bounds.height / 2);

            // Intense 3D Tilt (Cranked up to 35)
            xTo(mouseX * 35);
            yTo(-mouseY * 35);

            // Move spotlight
            glowX(e.clientX - bounds.left);
            glowY(e.clientY - bounds.top);

            // Extreme Parallax shift for inner text/icons
            zLayers.forEach(layer => {
                layer.x(mouseX * layer.factor);
                layer.y(mouseY * layer.factor);
            });
        };

        const handleMouseEnter = () => {
            bounds = cardEl.getBoundingClientRect();

            // Card pops up and gets a glowing border
            gsap.to(tiltWrapperRef.current, {
                scale: 1.1,
                z: 60, // pop out
                duration: 0.6,
                ease: "back.out(1.8)"
            });

            gsap.to(inner, {
                boxShadow: `0 50px 100px -20px ${card.color}50, inset 0 0 20px rgba(255,255,255,0.15)`,
                duration: 0.6,
                ease: "back.out(1.8)"
            });

            // Brighten the rotating border heavily
            gsap.to(borderContainerRef.current, { opacity: 1, filter: 'brightness(1.5)', duration: 0.4 });

            // Spotlight turns on
            gsap.to(glow, { opacity: 1, scale: 1.2, duration: 0.4 });

            // EXPLOSION 3D EFFECT: Elements fly forward on Z axis
            gsap.to(elements, {
                z: (index) => (index + 1) * 50, // Huge 50px depth per layer
                duration: 0.7,
                ease: "back.out(2)",
                stagger: 0.05
            });

            // Button arrow slides over
            if (button) gsap.to(button, { gap: '1.2rem', duration: 0.4, ease: "power3.out" });

            // Speed up the floating icon
            gsap.to(floatTween, { timeScale: 2.5, duration: 0.5 });
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);

            // Card snaps back
            gsap.to(tiltWrapperRef.current, {
                scale: 1,
                z: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.4)"
            });

            gsap.to(inner, {
                boxShadow: `0 10px 30px -10px rgba(0,0,0,0.2)`,
                duration: 0.8,
                ease: "elastic.out(1, 0.4)"
            });

            // Dim the rotating border back slightly but keep it highly visible
            gsap.to(borderContainerRef.current, { opacity: 0.8, filter: 'brightness(1)', duration: 0.6 });

            gsap.to(glow, { opacity: 0, scale: 1, duration: 0.6 });

            // Elements retract back into the card
            gsap.to(elements, {
                x: 0, y: 0, z: 0,
                duration: 0.9,
                ease: "elastic.out(1.2, 0.4)" // Bouncy retract
            });

            if (button) gsap.to(button, { gap: '0.4rem', duration: 0.5 });
            gsap.to(floatTween, { timeScale: 1, duration: 0.5 });
        };

        cardEl.addEventListener('mousemove', handleMouseMove);
        cardEl.addEventListener('mouseenter', handleMouseEnter);
        cardEl.addEventListener('mouseleave', handleMouseLeave);

        // Recalculate bounds on scroll to prevent offset bugs
        const handleScroll = () => { bounds = cardEl.getBoundingClientRect(); };
        window.addEventListener('scroll', handleScroll);

        return () => {
            cardEl.removeEventListener('mousemove', handleMouseMove);
            cardEl.removeEventListener('mouseenter', handleMouseEnter);
            cardEl.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('scroll', handleScroll);
            floatTween.kill();
            borderRotator.kill();
        };
    }, [i, card.color]);

    return (
        <div
            ref={cardRef}
            style={{
                perspective: 1200, // Reduced perspective makes Z-axis pop out way more dramatically
                position: 'relative',
                height: '100%',
                display: 'block',
                cursor: 'pointer',
                zIndex: 1
            }}
        >
            {/* 3D Tilt Wrapper */}
            <div ref={tiltWrapperRef} style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center'
            }}>

                {/* Rotating Border Layer */}
                <div ref={borderContainerRef} style={{
                    position: 'absolute',
                    top: '-2px', left: '-2px', right: '-2px', bottom: '-2px',
                    borderRadius: '26px', // slightly larger to match outside radius
                    overflow: 'hidden',
                    zIndex: 0,
                    opacity: 0.8, // Bright glow even when not hovered
                    transition: 'opacity 0.4s ease, filter 0.4s ease'
                }}>
                    <div ref={rotatingBorderRef} style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '200%',
                        height: '200%',
                        // Sharp glowing beam
                        background: `conic-gradient(from 0deg, transparent 70%, ${card.color}80 85%, ${card.color} 100%)`,
                        transform: 'translate(-50%, -50%)',
                        filter: 'blur(2px)'
                    }} />
                </div>

                {/* Inner Glass Layer */}
                <div
                    ref={innerRef}
                    style={{
                        position: 'relative',
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        border: '1px solid var(--border-light)', // Subtle inner border
                        borderRadius: '24px',
                        padding: '2rem 1.75rem',
                        boxShadow: 'var(--shadow-glass)',
                        transformStyle: 'preserve-3d',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}
                >
                    {/* Advanced GSAP Spotlight */}
                    <div
                        ref={glowRef}
                        style={{
                            position: 'absolute',
                            width: '500px',
                            height: '500px',
                            background: `radial-gradient(circle closest-side, ${card.color}50, transparent 100%)`,
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            opacity: 0,
                            zIndex: 0,
                            mixBlendMode: 'plus-lighter', // Gives a very bright, vibrant glow
                            filter: 'blur(50px)'
                        }}
                    />

                    <div style={{ position: 'relative', zIndex: 1, transformStyle: 'preserve-3d', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Icon */}
                        <div
                            ref={addToRefs}
                            style={{ transformStyle: 'preserve-3d', width: 'fit-content' }}
                        >
                            <div
                                ref={iconRef}
                                style={{
                                    width: '56px', height: '56px', borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${card.bg}, transparent)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.25rem',
                                    border: `1px solid ${card.color}50`,
                                    boxShadow: `0 15px 35px ${card.color}40, inset 0 2px 15px rgba(255,255,255,0.3)`,
                                }}
                            >
                                <card.icon size={26} style={{ color: card.color, filter: `drop-shadow(0 0 12px ${card.color}90)` }} />
                            </div>
                        </div>

                        {/* Title */}
                        <h3
                            ref={addToRefs}
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: '900',
                                color: 'var(--text-main)',
                                marginBottom: '0.75rem',
                                letterSpacing: '-0.03em',
                                textShadow: `0 10px 30px rgba(0,0,0,0.3)`
                            }}
                        >
                            {card.title}
                        </h3>

                        {/* Description */}
                        <p
                            ref={addToRefs}
                            style={{
                                fontSize: '0.92rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                marginBottom: '1.75rem',
                                flexGrow: 1,
                                fontWeight: '500'
                            }}
                        >
                            {card.desc}
                        </p>

                        {/* Action Button */}
                        <div ref={addToRefs} style={{ marginTop: 'auto', transformStyle: 'preserve-3d' }}>
                            {isSubmitCase ? (
                                <button
                                    type="button"
                                    ref={buttonRef}
                                    onClick={handleSubmitCaseClick}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        color: card.color, fontSize: '0.9rem', fontWeight: '800',
                                        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                        textShadow: `0 2px 10px ${card.color}40`
                                    }}
                                >
                                    {card.cta} <ArrowRight size={18} />
                                </button>
                            ) : (
                                <Link
                                    to="/signup"
                                    ref={buttonRef}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        color: card.color, fontSize: '0.9rem', fontWeight: '800',
                                        textDecoration: 'none',
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                        textShadow: `0 2px 10px ${card.color}40`
                                    }}
                                >
                                    {card.cta} <ArrowRight size={18} />
                                </Link>
                            )}
                        </div>

                        {inlineMessage && isSubmitCase && (
                            <div ref={addToRefs} style={{ marginTop: '1.5rem', transformStyle: 'preserve-3d' }}>
                                <GuestInlineCTA message={inlineMessage} onSignUp={goToSignup} compact />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
