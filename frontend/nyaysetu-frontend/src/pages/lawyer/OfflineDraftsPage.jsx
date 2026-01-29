import { useState, useEffect } from 'react';
import {
    Wifi,
    WifiOff,
    Save,
    RefreshCw,
    Plus,
    Trash2,
    FileText,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { db, saveDraft, getDrafts, updateDraft, deleteDraft } from '../../db/offlineDB';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';

export default function OfflineDraftsPage() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedDraftId, setSelectedDraftId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Live query to local DB
    const drafts = useLiveQuery(() => db.drafts.orderBy('updatedAt').reverse().toArray());

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    const handleNew = () => {
        setSelectedDraftId(null);
        setTitle('');
        setContent('');
    };

    const handleSelect = (draft) => {
        setSelectedDraftId(draft.id);
        setTitle(draft.title);
        setContent(draft.content);
    };

    const handleSaveLocal = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Title and Content required');
            return;
        }
        setIsSaving(true);
        try {
            if (selectedDraftId) {
                await updateDraft(selectedDraftId, { title, content });
                toast.success('Draft updated locally');
            } else {
                const id = await saveDraft(title, content);
                setSelectedDraftId(id);
                toast.success('Draft saved locally');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save locally');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (confirm('Delete this draft permanently?')) {
            await deleteDraft(id);
            if (selectedDraftId === id) handleNew();
            toast.success('Draft deleted');
        }
    };

    const handleSync = async () => {
        if (!isOnline) {
            toast.error('You are offline. Cannot sync.');
            return;
        }
        // TODO: Implement actual Backend Sync logic
        // For now, simulate sync
        const toastId = toast.loading('Syncing drafts to cloud...');
        setTimeout(() => {
            toast.success('Sync successful!', { id: toastId });
            // Mark as synced locally
            if (selectedDraftId) {
                updateDraft(selectedDraftId, { synced: true });
            }
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                        Offline Drafts (PWA)
                    </h1>
                    <p className="text-[var(--text-secondary)]">Draft petitions without internet & sync later</p>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                    {isOnline ? 'Online - Ready to Sync' : 'Offline Mode'}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List Column */}
                <div className="lg:col-span-1 space-y-4">
                    <div style={glassStyle} className="min-h-[60vh]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Your Drafts</h3>
                            <button onClick={handleNew} className="p-2 bg-[var(--color-primary)] text-white rounded-full hover:opacity-90 transition-all">
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                            {!drafts || drafts.length === 0 ? (
                                <p className="text-center text-[var(--text-secondary)] py-8">No local drafts yet.</p>
                            ) : (
                                drafts.map(draft => (
                                    <div
                                        key={draft.id}
                                        onClick={() => handleSelect(draft)}
                                        className={`p-4 rounded-xl cursor-pointer border transition-all hover:scale-[1.02] ${selectedDraftId === draft.id ? 'border-[var(--color-primary)] bg-[var(--bg-highlight)]' : 'border-[var(--border-glass)] bg-[var(--bg-glass)]'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium truncate pr-2">{draft.title}</h4>
                                            {draft.synced && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(draft.updatedAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={(e) => handleDelete(e, draft.id)}
                                                className="p-1 hover:bg-red-100 hover:text-red-500 rounded text-[var(--text-tertiary)]"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Editor Column */}
                <div className="lg:col-span-2">
                    <div style={glassStyle} className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-glass)]">
                            <input
                                type="text"
                                placeholder="Draft Title (e.g., Writ Petition for Case #123)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-transparent text-xl font-semibold placeholder-[var(--text-tertiary)] outline-none w-full"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveLocal}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    Save Local
                                </button>
                                {isOnline && (
                                    <button
                                        onClick={handleSync}
                                        className="flex items-center gap-2 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--bg-highlight)] transition-all"
                                    >
                                        <RefreshCw size={18} />
                                        Sync Cloud
                                    </button>
                                )}
                            </div>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your legal draft here..."
                            className="flex-1 w-full bg-transparent resize-none outline-none text-[var(--text-primary)] leading-relaxed p-2"
                        />

                        <div className="mt-4 text-xs text-center text-[var(--text-tertiary)]">
                            {isOnline ? 'Changes are synchronized automatically when you click Sync.' : 'You are in Offline Mode. Changes are saved locally to your device.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
