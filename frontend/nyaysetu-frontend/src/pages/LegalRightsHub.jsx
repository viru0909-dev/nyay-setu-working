import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import SearchBar from '../components/legal-rights/SearchBar';
import LegalCard from '../components/legal-rights/LegalCard';
import CategoryDetails from '../components/legal-rights/CategoryDetails';
import { legalRightsData } from '../data/legalRightsData';

export default function LegalRightsHub() {
    const { t } = useTranslation('common');
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');

    const selectedCategory = useMemo(() => {
        if (!categoryId) return null;
        return legalRightsData.find(c => c.id === categoryId);
    }, [categoryId]);

    const filteredCategories = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return legalRightsData;

        return legalRightsData.filter(category => {
            const matchTitle = category.title.toLowerCase().includes(q);
            const matchDesc = category.description.toLowerCase().includes(q);
            const matchKeywords = category.keywords?.some(k => k.toLowerCase().includes(q));
            return matchTitle || matchDesc || matchKeywords;
        });
    }, [searchQuery]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Header />

            {/* Geometric grid pattern from Landing hero */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(124,92,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

            <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '8rem 2rem 4rem', position: 'relative', zIndex: 1, flex: '1 0 auto' }}>

                {/* Hero Section */}
                <div style={{
                    padding: '3.5rem',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '2rem',
                    marginBottom: '3rem',
                    boxShadow: 'var(--shadow-glass)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-100px', right: '-100px',
                        width: '400px', height: '400px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,92,255,0.10) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #7C5CFF 0%, #3F5DCC 100%)',
                            borderRadius: '1.25rem',
                            boxShadow: '0 8px 24px rgba(124,92,255,0.3)'
                        }}>
                            <BookOpen size={48} color="white" />
                        </div>
                        <div>
                            <h1 style={{ color: 'var(--text-main)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                                Legal Rights <span style={{ color: '#7C5CFF' }}>Learning Hub</span>
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                                Empowering citizens with accessible, comprehensive knowledge about fundamental legal rights and essential judicial procedures.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'start' }}>
                    {selectedCategory ? (
                        <CategoryDetails category={selectedCategory} />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Search Bar */}
                            <div style={{ marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
                                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                            </div>

                            {/* Categories Grid */}
                            {filteredCategories.length > 0 ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                    gap: '2rem'
                                }}>
                                    {filteredCategories.map((category, idx) => (
                                        <LegalCard key={category.id} category={category} index={idx} />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                                        No categories found matching "{searchQuery}". Try a different keyword.
                                    </p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        style={{
                                            marginTop: '1.5rem',
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--bg-hover)',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}