export interface FlashcardData {
    front_content: string;
    back_content: string;
    set_id?: string;
    mastery_level?: number;
    last_reviewed?: Date | null;
  }
  
  export interface FlashcardSet {
    id?: string;
    student_id: string;
    title: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
  }