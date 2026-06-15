import { create } from 'zustand';

const useChatStore = create((set) => ({
    documentContext: '',

    setDocumentContext: (text) =>
        set({ documentContext: text }),

    clearDocumentContext: () =>
        set({ documentContext: '' })
}));

export default useChatStore;