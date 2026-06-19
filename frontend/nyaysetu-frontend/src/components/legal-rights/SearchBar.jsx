import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ searchQuery, setSearchQuery }) {
    const { t } = useTranslation('common');

    return (
        <div style={{ position: 'relative' }}>
            <Search size={24} style={{
                position: 'absolute',
                left: '1.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-primary)'
            }} />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search', { defaultValue: 'Search legal topics, keywords...' })}
                style={{
                    width: '100%',
                    padding: '1.5rem 1.5rem 1.5rem 4.5rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '1.5rem',
                    color: 'var(--text-main)',
                    fontSize: '1.125rem',
                    outline: 'none',
                    transition: 'all 0.3s',
                    boxShadow: 'var(--shadow-sm)'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(63,93,204,0.12)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-light)';
                    e.target.style.boxShadow = 'var(--shadow-sm)';
                }}
            />
        </div>
    );
}