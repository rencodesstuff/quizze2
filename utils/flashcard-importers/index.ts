import { FlashcardData, FlashcardSet } from './types';
import { createClient } from '../../utils/supabase/component';

export async function importFromCSV(file: File): Promise<FlashcardData[]> {
  const text = await file.text();
  const rows = text.split('\n').map(row => row.split(','));
  
  // Skip header row and convert to flashcard format
  return rows.slice(1)
    .map(row => ({
      front_content: row[0]?.trim() ?? '',
      back_content: row[1]?.trim() ?? '',
      mastery_level: 0,
      last_reviewed: null
    }))
    .filter(card => card.front_content && card.back_content);
}

export async function importFromJSON(file: File): Promise<FlashcardData[]> {
  const text = await file.text();
  const data = JSON.parse(text);
  
  if (!Array.isArray(data)) {
    throw new Error('Invalid JSON format. Expected an array of flashcards.');
  }

  return data.map(item => ({
    front_content: item.front ?? item.question ?? item.front_content ?? '',
    back_content: item.back ?? item.answer ?? item.back_content ?? '',
    mastery_level: 0,
    last_reviewed: null
  })).filter(card => card.front_content && card.back_content);
}

export async function createFlashcardSet(
  studentId: string,
  title: string,
  description: string,
  cards: FlashcardData[]
): Promise<string> {
  const supabase = createClient();

  // Create the flashcard set
  const { data: set, error: setError } = await supabase
    .from('flashcard_sets')
    .insert({
      student_id: studentId,
      title,
      description,
      is_public: false
    })
    .select()
    .single();

  if (setError) throw setError;

  // Add the set_id to each card
  const cardsWithSetId = cards.map(card => ({
    ...card,
    set_id: set.id
  }));

  // Insert all cards
  const { error: cardsError } = await supabase
    .from('flashcards')
    .insert(cardsWithSetId);

  if (cardsError) throw cardsError;

  return set.id;
}