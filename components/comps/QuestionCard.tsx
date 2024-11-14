import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/ui/card';
import { cn } from '../../lib/utils';
import { Checkbox } from '@/ui/checkbox';

export interface Question {
  id: string;
  type: string;
  text: string;
  options: any;
  correct_answer: string;
  image_url?: string;
  explanation?: string;
  multiple_correct_answers?: string[];
  drag_drop_text?: string[];
  drag_drop_answers?: string[];
  quiz_id: string;
}

interface QuestionCardProps {
  question: Question;
  viewMode: 'grid' | 'list';
  onSelect?: (id: string, selected: boolean) => void;
  isSelected?: boolean;
}

export function QuestionCard({
  question,
  viewMode,
  onSelect,
  isSelected = false,
}: QuestionCardProps) {
  const cardContent = (
    <>
      <div className="flex items-start gap-3">
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(question.id, checked as boolean)}
            className="mt-1"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {question.type.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          </div>
          <p className="text-gray-900 font-medium mb-2">{question.text}</p>
          {question.explanation && (
            <p className="text-sm text-gray-500 mb-2">{question.explanation}</p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "p-4 hover:shadow-md transition-shadow duration-200",
        viewMode === 'list' ? 'mb-4' : ''
      )}>
        {cardContent}
      </Card>
    </motion.div>
  );
}