// components/FilterSection.tsx
import React from 'react';
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import { Checkbox } from "@/ui/checkbox";
import { Calendar } from "@/ui/calendar";
import { Badge } from "@/ui/badge";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  X,
  SortAsc,
} from "lucide-react";
import { QuestionType, DifficultyLevel, QuestionBankFilters } from '../../types/question-bank';
import { DateRange } from 'react-day-picker';

interface FilterSectionProps {
  filters: QuestionBankFilters;
  onFilterChange: (key: keyof QuestionBankFilters, value: any) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
}) => {
  const questionTypes: QuestionType[] = [
    'multiple-choice',
    'true-false',
    'short-answer',
    'multiple-selection',
    'drag-drop'
  ];

  const difficulties: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'difficulty-asc', label: 'Difficulty (Easy to Hard)' },
    { value: 'difficulty-desc', label: 'Difficulty (Hard to Easy)' },
    { value: 'type', label: 'Question Type' },
  ];

  const formatTypeName = (type: string) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const clearFilters = () => {
    onFilterChange('searchTerm', '');
    onFilterChange('types', []);
    onFilterChange('difficulty', null);
    onFilterChange('subject', null);
    onFilterChange('topic', null);
    onFilterChange('tags', []);
    onFilterChange('dateRange', { from: null, to: null });
    onFilterChange('favorites', false);
    onFilterChange('sort', 'newest');
  };

  const hasActiveFilters = 
    filters.searchTerm || 
    filters.types.length > 0 || 
    filters.difficulty || 
    filters.dateRange.from || 
    filters.favorites ||
    filters.sort !== 'newest';

  return (
    <Card className="p-4 bg-white shadow-sm">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search questions, subjects, or topics..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Question Types Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Question Types
                {filters.types.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.types.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2 p-2">
                {questionTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={filters.types.includes(type)}
                      onCheckedChange={(checked) => {
                        onFilterChange(
                          'types',
                          checked
                            ? [...filters.types, type]
                            : filters.types.filter(t => t !== type)
                        );
                      }}
                    />
                    <label htmlFor={type} className="text-sm font-medium cursor-pointer">
                      {formatTypeName(type)}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Difficulty Filter */}
          <Select
            value={filters.difficulty || "all"}
            onValueChange={(value) => onFilterChange('difficulty', value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={filters.dateRange.from ? "bg-primary/10" : ""}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {filters.dateRange.from ? (
                  <span>
                    {filters.dateRange.from.toLocaleDateString()} -{" "}
                    {filters.dateRange.to?.toLocaleDateString() || ""}
                  </span>
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from || new Date()}
                selected={{
                  from: filters.dateRange.from || undefined,
                  to: filters.dateRange.to || undefined
                }}
                onSelect={(range) => onFilterChange('dateRange', {
                  from: range?.from || null,
                  to: range?.to || null
                })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Sort Options */}
          <Select
            value={filters.sort}
            onValueChange={(value) => onFilterChange('sort', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Favorites Toggle */}
          <Button
            variant={filters.favorites ? "secondary" : "outline"}
            size="sm"
            onClick={() => onFilterChange('favorites', !filters.favorites)}
          >
            Favorites Only
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};