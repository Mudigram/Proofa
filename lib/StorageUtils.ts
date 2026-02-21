import { SavedDocument, DocumentType, TemplateName } from "./types";

const STORAGE_KEY = "proofa_history";
const USER_NAME_KEY = "proofa_user_name";
const MAX_ITEMS = 20;

/**
 * Saves the user's name to localStorage.
 */
export const saveUserName = (name: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(USER_NAME_KEY, name.trim());
    }
};

/**
 * Retrieves the user's name from localStorage.
 */
export const getUserName = (): string => {
    if (typeof window === "undefined") return "User";
    return localStorage.getItem(USER_NAME_KEY) || "User";
};

/**
 * Saves a document to localStorage.
 */
export const saveDocument = (
    data: any,
    type: DocumentType,
    template: TemplateName,
    imageDataUrl?: string
): SavedDocument => {
    const history = getHistory();

    const newDoc: SavedDocument = {
        id: Math.random().toString(36).substring(2, 11),
        type,
        template,
        data,
        createdAt: new Date().toISOString(),
        imageDataUrl
    };

    // Add to start of array
    const newHistory = [newDoc, ...history].slice(0, MAX_ITEMS);

    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }

    return newDoc;
};

/**
 * Retrieves all saved documents from localStorage.
 */
export const getHistory = (): SavedDocument[] => {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Error parsing history from storage:", e);
        return [];
    }
};

/**
 * Deletes a document by ID.
 */
export const deleteDocument = (id: string) => {
    const history = getHistory();
    const newHistory = history.filter(doc => doc.id !== id);

    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }
};

/**
 * Gets a specific document by ID.
 */
export const getDocumentById = (id: string): SavedDocument | undefined => {
    const history = getHistory();
    return history.find(doc => doc.id === id);
};
