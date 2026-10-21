
import { useMemo, useState } from 'react';

export function useSearch<T>(items: T[], searchKey: keyof T, extraFilter?: (item: T) => boolean) {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = useMemo(() => {
        if (!Array.isArray(items)) return [];  // ← guard
        
        const normalized = searchTerm.trim().toLowerCase();
        return items.filter((item) => {
            const matchesSearch = !normalized || String(item[searchKey]).toLowerCase().includes(normalized);
            const matchesExtra = extraFilter ? extraFilter(item) : true;
            return matchesSearch && matchesExtra;
        });
    }, [items, searchTerm, searchKey, extraFilter]);

    return { searchTerm, setSearchTerm, filtered };
}