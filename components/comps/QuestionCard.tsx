// components/QuestionCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import {
  Star,
  Pencil,
  Trash,
  MoreHorizontal,
  Tag,
  GraduationCap,
  Clock,
} from "lucide-react";
import { QuestionBankItem } from '../../types/question-bank';

interface QuestionCardProps {
  question: QuestionBankItem;
  viewMode: 'grid' | 'list';
  onEdit: (question: QuestionBankItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onSelect: (id: string, selected: boolean) => void;
  isSelected: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  viewMode,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelect,
  isSelected,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hard':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    const types: Record<string, string> = {
      'multiple-choice': 'bg-blue-100 text-blue-800 border-blue-200',
      'true-false': 'bg-purple-100 text-purple-800 border-purple-200',
      'short-answer': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'multiple-selection': 'bg-teal-100 text-teal-800 border-teal-200',
      'drag-drop': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return types[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const cardClassName = viewMode === 'grid' 
    ? 'h-full' 
    : 'w-full';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-white p-6 hover:shadow-md transition-shadow duration-200 ${cardClassName}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(question.id, e.target.checked)}
              className="mt-1"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {question.question_text}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Badge>
                <Badge className={getTypeColor(question.type)}>
                  {question.type.replace(/-/g, ' ')}
                </Badge>
                {question.is_favorite && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="w-3 h-3 mr-1" />
                    Favorite
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleFavorite(question.id, !question.is_favorite)}>
                <Star className="w-4 h-4 mr-2" />
                {question.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(question)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(question.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
          <div className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>{question.subject}</span>
          </div>
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>{question.topic}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>
              {new Date(question.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {question.tags && question.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};