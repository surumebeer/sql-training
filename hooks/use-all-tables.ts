import { useState, useEffect } from 'react';
import { getAllTables } from '@/lib/database';

export function useAllTables(refreshTrigger: number, activeTab: string, setActiveTab: (tab: string) => void) {
  const [allTables, setAllTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const tables = await getAllTables();
        setAllTables(tables);
        // If current active tab doesn't exist anymore, switch to first available table
        if (tables.length > 0 && !tables.includes(activeTab) && activeTab !== "query-results") {
          setActiveTab(tables[0]);
        }
      } catch (error) {
        console.error("Failed to load tables:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTables();
  }, [refreshTrigger, activeTab, setActiveTab]);

  return { allTables, loading };
}