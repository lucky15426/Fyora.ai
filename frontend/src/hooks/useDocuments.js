import { useState, useEffect, useCallback } from 'react';
import { fetchDocuments, deleteDocument } from '../api/client';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDocument = async (filename) => {
    try {
      await deleteDocument(filename);
      setDocuments((prev) => prev.filter((doc) => doc.filename !== filename));
      return true;
    } catch (err) {
      console.error('Failed to delete document:', err);
      return false;
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    loading,
    refreshDocuments: loadDocuments,
    removeDocument,
  };
}
