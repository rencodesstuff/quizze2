// components/QuestionCard.tsx
import { motion } from "framer-motion";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Checkbox } from "@/ui/checkbox";
import {
  Star,
  MoreVertical,
  Pencil,
  Trash,
  GraduationCap,
  Tag,
  Clock,
} from "lucide-react";
import { QuestionBankItem } from "../../types/question-bank";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../../utils/cn";

interface QuestionCardProps {
  question: QuestionBankItem;
  viewMode: 'grid' | 'list';
  onEdit: (question: QuestionBankItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onSelect: (id: string, selected: boolean) => void;
  isSelected: boolean;
}

export function QuestionCard({
  question,
  viewMode,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelect,
  isSelected
}: QuestionCardProps) {
  const cardClassName = viewMode === 'grid' 
    ? 'h-full'
    : 'flex flex-row items-start space-x-4';

  const contentClassName = viewMode === 'grid'
    ? ''
    : 'flex-1';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        cardClassName,
        "hover:shadow-md transition-shadow duration-200",
        isSelected && "ring-2 ring-primary"
      )}>
        <div className={contentClassName}>
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelect(question.id, checked as boolean)}
                  className="mt-1"
                />
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {question.question_text}
                  </CardTitle>
                  <CardDescription className="mt-2 space-x-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        question.type === 'multiple-choice' && 'bg-blue-100 text-blue-800 border-blue-200',
                        question.type === 'true-false' && 'bg-green-100 text-green-800 border-green-200',
                        question.type === 'short-answer' && 'bg-purple-100 text-purple-800 border-purple-200',
                        question.type === 'multiple-selection' && 'bg-orange-100 text-orange-800 border-orange-200',
                        question.type === 'drag-drop' && 'bg-pink-100 text-pink-800 border-pink-200'
                      )}
                    >
                      {question.type.replace(/-/g, ' ')}
                    </Badge>
                    {question.is_favorite && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        Favorite
                      </Badge>
                    )}
                    <Badge 
                      className={cn(
                        'ml-2',
                        question.difficulty === 'Easy' && 'bg-green-100 text-green-800 border-green-200',
                        question.difficulty === 'Medium' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
                        question.difficulty === 'Hard' && 'bg-red-100 text-red-800 border-red-200'
                      )}
                    >
                      {question.difficulty}
                    </Badge>
                  </CardDescription>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(question)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onToggleFavorite(question.id, !question.is_favorite)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {question.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(question.id)}
                    className="text-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-1.5 text-gray-500" />
                <span>{question.category} - {question.subcategory}</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-1.5 text-gray-500" />
                <div className="flex flex-wrap gap-1">
                  {question.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs bg-gray-50"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {(!question.tags || question.tags.length === 0) && (
                    <span className="text-gray-400">No tags</span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                <span>
                  {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}