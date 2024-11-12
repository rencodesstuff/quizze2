// components/FilterSection.tsx

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import {
  Filter,
  CalendarDays,
  GridIcon,
  LayoutList,
  ChevronDown,
} from "lucide-react";
import { QuestionType, DifficultyLevel } from '../../types/question-bank';

const QuestionTypes: QuestionType[] = [
  "multiple-choice",
  "true-false",
  "short-answer",
  "multiple-selection",
  "drag-drop",
];

const DifficultyLevels: DifficultyLevel[] = ["Easy", "Medium", "Hard"];

interface FilterSectionProps {
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function FilterSection({ 
  filters, 
  onFilterChange, 
  viewMode, 
  onViewModeChange 
}: FilterSectionProps) {
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
                  : filters.types.filter((t: string) => t !== type);
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

      {/* Difficulty Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white border-gray-200 hover:bg-gray-100"
          >
            All Difficulties
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 bg-white border border-gray-200 shadow-lg"
        >
          <DropdownMenuItem 
            onClick={() => onFilterChange('difficulty', null)}
            className="hover:bg-gray-100"
          >
            All Difficulties
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {DifficultyLevels.map((level) => (
            <DropdownMenuItem
              key={level}
              onClick={() => onFilterChange('difficulty', level)}
              className={cn(
                "hover:bg-gray-100",
                filters.difficulty === level && "bg-gray-100"
              )}
            >
              {level}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white border-gray-200 hover:bg-gray-100"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            {filters.dateRange.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              "Date Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white border border-gray-200 shadow-lg" 
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange.from}
            selected={{
              from: filters.dateRange.from,
              to: filters.dateRange.to,
            }}
            onSelect={(range) => onFilterChange('dateRange', {
              from: range?.from || null,
              to: range?.to || null,
            })}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Sort Order */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white border-gray-200 hover:bg-gray-100"
          >
            Newest First
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
          <DropdownMenuItem 
            onClick={() => onFilterChange('sort', 'difficulty')}
            className={cn(
              "hover:bg-gray-100",
              filters.sort === 'difficulty' && "bg-gray-100"
            )}
          >
            By Difficulty
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onFilterChange('sort', 'alphabetical')}
            className={cn(
              "hover:bg-gray-100",
              filters.sort === 'alphabetical' && "bg-gray-100"
            )}
          >
            Alphabetical
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