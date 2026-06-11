import { useState, useEffect } from 'react';
import api from '../api/client';

export const useAutosave = (resourceId, currentData) => {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Don't autosave if no ID (new resource) or no data
    if (!resourceId || !currentData.title) return;

    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await api.put(`/resources/${resourceId}/autosave`, currentData);
      } catch (err) {
        console.error('Autosave failed:', err);
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentData, resourceId]);

  return { saving };
};
