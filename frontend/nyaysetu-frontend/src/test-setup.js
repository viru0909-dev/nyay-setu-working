const createMemoryStorage = () => {
    const store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        get length() { return Object.keys(store).length; },
        key: (index) => Object.keys(store)[index] ?? null,
        clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    };
};

const storage = createMemoryStorage();

if (typeof globalThis !== 'undefined') {
    globalThis.localStorage = storage;
    globalThis.CustomEvent = class CustomEvent {
        constructor(type, options = {}) {
            this.type = type;
            this.detail = options.detail ?? null;
            this.bubbles = options.bubbles ?? false;
            this.cancelable = options.cancelable ?? false;
            this.composed = false;
            this.timeStamp = Date.now();
        }
    };
}

if (typeof window !== 'undefined') {
    window.localStorage = storage;
    window.CustomEvent = globalThis.CustomEvent;
}
