import React from 'react';
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import {
  Filter,
  GridIcon,
  LayoutList,
  ChevronDown,
} from "lucide-react";

const QuestionTypes = [
  "multiple-choice",
  "true-false",
  "short-answer",
  "multiple-selection",
  "drag-drop",
] as const;

export interface QuestionFilters {
  searchTerm: string;
  types: string[];
  quiz_id?: string | null;
  sort: 'newest' | 'oldest';
  inBank: boolean; // New filter
}

interface QuestionsFilterSectionProps {
  filters: QuestionFilters;
  onFilterChange: (key: keyof QuestionFilters, value: any) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function QuestionsFilterSection({ 
  filters, 
  onFilterChange, 
  viewMode, 
  onViewModeChange 
}: QuestionsFilterSectionProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Question Types Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white border-gray-200 hover:bg-gray-100"
          >
            <Filter className="w-4 h-4 mr-2" />
            Question Types
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 bg-white border border-gray-200 shadow-lg"
        >
          {QuestionTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={filters.types.includes(type)}
              onCheckedChange={(checked) => {
                const newTypes = checked
                  ? [...filters.types, type]
                  : filters.types.filter((t) => t !== type);
                onFilterChange('types', newTypes);
              }}
              className="hover:bg-gray-100"
            >
              {type.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Order */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white border-gray-200 hover:bg-gray-100"
          >
            {filters.sort === 'newest' ? "Newest First" : "Oldest First"}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-white border border-gray-200 shadow-lg"
        >
          <DropdownMenuItem 
            onClick={() => onFilterChange('sort', 'newest')}
            className={cn(
              "hover:bg-gray-100",
              filters.sort === 'newest' && "bg-gray-100"
            )}
          >
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onFilterChange('sort', 'oldest')}
            className={cn(
              "hover:bg-gray-100",
              filters.sort === 'oldest' && "bg-gray-100"
            )}
          >
            Oldest First
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Mode Toggle */}
      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className={cn(
            "bg-white border-gray-200 hover:bg-gray-100 p-2 h-9 w-9",
            viewMode === 'grid' && "bg-gray-100"
          )}
        >
          <GridIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={cn(
            "bg-white border-gray-200 hover:bg-gray-100 ml-1 p-2 h-9 w-9",
            viewMode === 'list' && "bg-gray-100"
          )}
        >
          <LayoutList className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}