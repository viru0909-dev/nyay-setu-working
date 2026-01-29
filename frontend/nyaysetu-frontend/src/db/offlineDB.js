import Dexie from 'dexie';

export const db = new Dexie('NyaySetuOfflineDB');

db.version(2).stores({
    drafts: '++id, title, type, createdAt, updatedAt, synced', // Primary key and indexed props
    outbox: '++id, url, method, payload, createdAt' // For storing requests to sync later
});

export const saveDraft = async (title, content, type = 'petition') => {
    return await db.drafts.add({
        title,
        content,
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
        synced: false
    });
};

export const getDrafts = async () => {
    return await db.drafts.orderBy('createdAt').reverse().toArray();
};

export const updateDraft = async (id, updates) => {
    return await db.drafts.update(id, {
        ...updates,
        updatedAt: new Date(),
        synced: false
    });
};

export const deleteDraft = async (id) => {
    return await db.drafts.delete(id);
};
