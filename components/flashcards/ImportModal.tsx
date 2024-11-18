// components/flashcards/ImportModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Alert, AlertDescription } from '@/ui/alert';
import { importFromCSV, importFromJSON, createFlashcardSet } from '../../utils/flashcard-importers';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onSuccess: (setId: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ 
  isOpen, 
  onClose, 
  studentId,
  onSuccess 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Set default title from filename if not set
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setLoading(true);
    setError(null);

    try {
      // Parse the file based on its extension
      const cards = file.name.toLowerCase().endsWith('.json')
        ? await importFromJSON(file)
        : await importFromCSV(file);

      if (cards.length === 0) {
        throw new Error('No valid flashcards found in file');
      }

      // Create the flashcard set with parsed cards
      const setId = await createFlashcardSet(
        studentId,
        title,
        description,
        cards
      );

      onSuccess(setId);
      onClose();
    } catch (err) {
      console.error('Error importing flashcards:', err);
      setError(err instanceof Error ? err.message : 'Failed to import flashcards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Flashcards</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Choose File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".csv,.json"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a CSV or JSON file containing your flashcards
            </p>
          </div>

          <div>
            <Label htmlFor="title">Set Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your flashcard set"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for your flashcard set"
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file || !title}>
              {loading ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;