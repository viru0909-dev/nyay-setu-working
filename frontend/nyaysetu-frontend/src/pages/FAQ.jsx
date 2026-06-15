import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, X, HelpCircle, ListFilter } from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import ScrollTopButton from '../components/landing/ScrollTopButton';
import AccordionItem from '../components/common/AccordionItem';
import faqCategories from '../data/faqData';
import '../styles/faq.css';

const ALL_CATEGORY_ID = 'all';

export default function FAQ() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);
    const [openFaqId, setOpenFaqId] = useState(null);

    // Toggle accordion — only one open at a time
    const handleToggle = useCallback((faqId) => {
        setOpenFaqId((prev) => (prev === faqId ? null : faqId));
    }, []);

    // Clear search
    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    // Reset all filters
    const handleResetFilters = useCallback(() => {
        setSearchQuery('');
        setActiveCategory(ALL_CATEGORY_ID);
        setOpenFaqId(null);
    }, []);

    // Filter categories and FAQs based on search + active category
    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        return faqCategories
            .filter((cat) => activeCategory === ALL_CATEGORY_ID || cat.id === activeCategory)
            .map((cat) => ({
                ...cat,
                faqs: cat.faqs.filter((faq) => {
                    if (!query) return true;
                    return (
                        faq.question.toLowerCase().includes(query) ||
                        faq.answer.toLowerCase().includes(query)
                    );
                }),
            }))
            .filter((cat) => cat.faqs.length > 0);
    }, [searchQuery, activeCategory]);

    // Count total matching FAQs
    const totalFaqs = faqCategories.reduce((acc, cat) => acc + cat.faqs.length, 0);
    const matchingFaqs = filteredData.reduce((acc, cat) => acc + cat.faqs.length, 0);
    const isFiltered = searchQuery.trim() !== '' || activeCategory !== ALL_CATEGORY_ID;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Header />

            {/* Hero Section */}
            <section
                style={{
                    padding: '10rem 2rem 4rem',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-light)',
                    textAlign: 'center',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    {/* Badge */}
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 1rem',
                            background: 'rgba(63, 93, 204, 0.08)',
                            border: '1px solid rgba(63, 93, 204, 0.15)',
                            borderRadius: '2rem',
                            color: 'var(--color-secondary)',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <HelpCircle size={14} />
                        Legal FAQ
                    </span>

                    {/* Icon */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '72px',
                            height: '72px',
                            background: 'linear-gradient(135deg, #3F5DCC, #7C5CFF)',
                            borderRadius: '20px',
                            marginBottom: '1.5rem',
                            boxShadow: '0 8px 24px rgba(63, 93, 204, 0.25)',
                        }}
                    >
                        <HelpCircle size={36} color="white" />
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
                            fontWeight: '800',
                            color: 'var(--text-main)',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.2',
                            marginBottom: '1.25rem',
                        }}
                    >
                        Frequently Asked{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #7C5CFF 0%, #3F5DCC 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Legal Questions
                        </span>
                    </h1>

                    {/* Description */}
                    <p
                        style={{
                            fontSize: '1.1rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.7',
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}
                    >
                        Quick answers to common legal queries across Indian law. Browse by category
                        or search to find what you need.
                    </p>
                </motion.div>
            </section>

            {/* Main Content */}
            <section style={{ padding: '3rem 2rem 4rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        className="faq-search-wrapper"
                    >
                        <input
                            id="faq-search"
                            type="text"
                            className="faq-search-input"
                            placeholder="Search legal questions… e.g. 'FIR', 'divorce', 'consumer complaint'"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search frequently asked questions"
                        />
                        <Search size={18} className="faq-search-icon" />
                        {searchQuery && (
                            <button
                                className="faq-search-clear"
                                onClick={handleClearSearch}
                                aria-label="Clear search"
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </motion.div>

                    {/* Stats Bar */}
                    {isFiltered && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="faq-stats-bar"
                        >
                            <span>
                                <ListFilter size={14} style={{ marginRight: '0.4rem', verticalAlign: '-2px' }} />
                                Showing <strong>{matchingFaqs}</strong> of <strong>{totalFaqs}</strong> questions
                            </span>
                            {activeCategory !== ALL_CATEGORY_ID && (
                                <span>
                                    Category: <strong>{faqCategories.find(c => c.id === activeCategory)?.name}</strong>
                                </span>
                            )}
                        </motion.div>
                    )}

                    {/* Category Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="faq-categories-container"
                        role="tablist"
                        aria-label="FAQ categories"
                    >
                        {/* "All" tab */}
                        <button
                            role="tab"
                            aria-selected={activeCategory === ALL_CATEGORY_ID}
                            className={`faq-category-tab ${activeCategory === ALL_CATEGORY_ID ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(ALL_CATEGORY_ID);
                                setOpenFaqId(null);
                            }}
                        >
                            All Categories
                        </button>

                        {faqCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    role="tab"
                                    aria-selected={activeCategory === cat.id}
                                    className={`faq-category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setOpenFaqId(null);
                                    }}
                                    title={cat.description}
                                >
                                    <Icon size={15} />
                                    {cat.name}
                                </button>
                            );
                        })}
                    </motion.div>

                    {/* FAQ Accordion Sections */}
                    <div className="faq-content-wrapper" role="tabpanel">
                        {filteredData.length > 0 ? (
                            filteredData.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <div key={category.id} className="faq-category-section">
                                        {/* Category Header — shown when "All" is active or search is active */}
                                        {(activeCategory === ALL_CATEGORY_ID || searchQuery.trim()) && (
                                            <div className="faq-category-header">
                                                <div className="faq-category-icon">
                                                    <Icon size={20} />
                                                </div>
                                                <h2 className="faq-category-title">{category.name}</h2>
                                                <span className="faq-category-count">
                                                    {category.faqs.length} {category.faqs.length === 1 ? 'question' : 'questions'}
                                                </span>
                                            </div>
                                        )}

                                        {/* FAQ Items */}
                                        <div className="faq-accordion-list">
                                            {category.faqs.map((faq, idx) => (
                                                <AccordionItem
                                                    key={faq.id}
                                                    id={faq.id}
                                                    question={faq.question}
                                                    answer={faq.answer}
                                                    isOpen={openFaqId === faq.id}
                                                    onToggle={() => handleToggle(faq.id)}
                                                    index={idx}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            /* Empty State */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="faq-empty-state"
                            >
                                <div className="faq-empty-icon">
                                    <Search size={32} />
                                </div>
                                <h3 className="faq-empty-title">No matching questions found</h3>
                                <p className="faq-empty-description">
                                    We couldn't find any FAQ matching
                                    {searchQuery && <strong> "{searchQuery}"</strong>}
                                    {activeCategory !== ALL_CATEGORY_ID && (
                                        <> in <strong>{faqCategories.find(c => c.id === activeCategory)?.name}</strong></>
                                    )}
                                    . Try adjusting your search or browse all categories.
                                </p>
                                <button
                                    className="faq-empty-clear-btn"
                                    onClick={handleResetFilters}
                                >
                                    <X size={14} />
                                    Clear all filters
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
            <ScrollTopButton />
        </div>
    );
}
