'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';

enum Destination {
    MAIS = 'MAIS',
    FOZAN = 'FOZAN',
}

interface FormData {
    itemName: string;
    batch: string;
    quantity: number;
    reject: number;
    destination: Destination | '';
    category?: string;
    notes?: string;
}

interface FormErrors {
    [key: string]: string;
}

const AUTOSAVE_KEY = 'inventory-draft';
const AUTOSAVE_INTERVAL = 2000;
const RECENT_ITEMS_KEY = 'recent-items';
const LAST_DESTINATION_KEY = 'last-destination';

const formSchema = z.object({
    itemName: z.string().min(2, 'Item name must be at least 2 characters').max(100, 'Item name too long'),
    batch: z.string().min(3, 'Batch must be at least 3 characters').max(50, 'Batch too long').regex(/^[A-Z0-9]+$/, 'Batch must be alphanumeric'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(1000000, 'Quantity too large'),
    reject: z.number().int().min(0, 'Reject cannot be negative'),
    destination: z.nativeEnum(Destination),
    category: z.string().max(50).optional(),
    notes: z.string().max(500, 'Notes too long').optional(),
}).refine(data => data.reject <= data.quantity, {
    message: 'Reject quantity cannot exceed total quantity',
    path: ['reject'],
});

const initialFormData: FormData = {
    itemName: '',
    batch: '',
    quantity: 0,
    reject: 0,
    destination: '',
    category: '',
    notes: '',
};

export function useDataEntryForm() {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState<string>('');
    const [recentItems, setRecentItems] = useState<string[]>([]);
    const [existingBatches, setExistingBatches] = useState<string[]>([]);
    const autosaveTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const fetchExistingBatches = useCallback(async () => {
        try {
            const response = await fetch('/api/inventory?limit=100&sortBy=createdAt&sortOrder=desc');
            if (response.ok) {
                const data = await response.json();
                const batches = data.data.items.map((item: { batch: string }) => item.batch);
                setExistingBatches(batches);
            }
        } catch (error) {
            console.error('Failed to fetch existing batches', error);
        }
    }, []);

    // Load draft and recent items on mount
    useEffect(() => {
        const draft = localStorage.getItem(AUTOSAVE_KEY);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setFormData(parsed);
                setIsDirty(true);
                setLastSaved('on page load');
            } catch (e) {
                console.error('Failed to parse draft', e);
            }
        }

        const recent = localStorage.getItem(RECENT_ITEMS_KEY);
        if (recent) {
            try {
                setRecentItems(JSON.parse(recent));
            } catch (e) {
                console.error('Failed to parse recent items', e);
            }
        }

        const lastDest = localStorage.getItem(LAST_DESTINATION_KEY);
        if (lastDest && !draft) {
            setFormData(prev => ({ ...prev, destination: lastDest as Destination }));
        }

        fetchExistingBatches();
    }, [fetchExistingBatches]);

    // Autosave functionality
    useEffect(() => {
        if (isDirty) {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }

            autosaveTimerRef.current = setTimeout(() => {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
                const now = new Date();
                setLastSaved(now.toLocaleTimeString());
            }, AUTOSAVE_INTERVAL);
        }

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [formData, isDirty]);

    const updateField = useCallback((field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);

        // Clear error for this field
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const validateField = useCallback((field: keyof FormData) => {
        try {
            formSchema.parse(formData);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldError = error.issues.find((e: z.ZodIssue) => e.path[0] === field);
                if (fieldError) {
                    setErrors(prev => ({ ...prev, [field]: fieldError.message }));
                }
            }
        }
    }, [formData]);

    const validateForm = useCallback((): boolean => {
        try {
            formSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: FormErrors = {};
                error.issues.forEach((err: z.ZodIssue) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    }, [formData]);

    const handleSubmit = useCallback(async (): Promise<boolean> => {
        if (!validateForm()) {
            return false;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemName: formData.itemName.trim(),
                    batch: formData.batch.toUpperCase(),
                    quantity: formData.quantity,
                    reject: formData.reject,
                    destination: formData.destination,
                    category: formData.category?.trim() || undefined,
                    notes: formData.notes?.trim() || undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save entry');
            }

            // Update recent items
            const updatedRecent = [
                formData.itemName,
                ...recentItems.filter(item => item !== formData.itemName),
            ].slice(0, 10);
            setRecentItems(updatedRecent);
            localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updatedRecent));

            // Save last destination
            if (formData.destination) {
                localStorage.setItem(LAST_DESTINATION_KEY, formData.destination);
            }

            // Clear draft
            localStorage.removeItem(AUTOSAVE_KEY);
            setIsDirty(false);
            setLastSaved('');

            // Reset form but keep destination
            const lastDestination = formData.destination;
            setFormData({ ...initialFormData, destination: lastDestination });

            return true;
        } catch (error) {
            console.error('Submit error:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, recentItems, validateForm]);

    const clearForm = useCallback(() => {
        const lastDest = localStorage.getItem(LAST_DESTINATION_KEY);
        setFormData({ ...initialFormData, destination: (lastDest as Destination) || '' });
        setErrors({});
        setIsDirty(false);
        localStorage.removeItem(AUTOSAVE_KEY);
        setLastSaved('');
    }, []);

    const rejectPercentage = formData.quantity > 0
        ? (formData.reject / formData.quantity) * 100
        : 0;

    const rejectStatus = rejectPercentage < 5
        ? 'good'
        : rejectPercentage <= 10
            ? 'warning'
            : 'critical';

    return {
        formData,
        errors,
        isSubmitting,
        isDirty,
        lastSaved,
        recentItems,
        existingBatches,
        updateField,
        validateField,
        handleSubmit,
        clearForm,
        rejectPercentage,
        rejectStatus,
    };
}
