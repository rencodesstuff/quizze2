import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { toast } from '../../src/hooks/use-toast';
import { Search, Share2, Copy, X } from "lucide-react";
import { createClient } from "../../utils/supabase/component";

// Base teacher interface
interface Teacher {
  id: string;
  name: string;
  email: string;
}

// Interface for shared quiz data
interface SharedQuiz {
  id: string;
  access_code: string;
  teacher: Teacher;
}

// Props interface
interface ShareQuizProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

// Type for database response
interface DatabaseResponse {
  id: string;
  access_code: string;
  teachers: Teacher;  // Changed from DatabaseTeacher to match the foreign key relationship
}

export const ShareQuizDialog = ({ isOpen, onClose, quizId, quizTitle }: ShareQuizProps) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharedWith, setSharedWith] = useState<SharedQuiz[]>([]);
  
  const supabase = createClient();

  // Fetch teachers who already have access to the quiz
  const fetchSharedTeachers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shared_quizzes')
        .select(`
          id,
          access_code,
          teachers!shared_quizzes_shared_with_fkey (
            id,
            name,
            email
          )
        `)
        .eq('quiz_id', quizId);

      if (error) throw error;

      if (data) {
        // Properly type the response data
        const transformedData: SharedQuiz[] = (data as unknown as DatabaseResponse[]).map(share => ({
          id: share.id,
          access_code: share.access_code,
          teacher: share.teachers
        }));
        setSharedWith(transformedData);
      }
    } catch (error) {
      console.error('Error fetching shared teachers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shared teachers"
      });
    }
  };

  // Search for teachers to share with
  const searchTeachers = async (search: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('teachers')
        .select('id, name, email')
        .neq('id', user.id)
        .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
        .limit(5);

      if (error) throw error;

      // Filter out already shared teachers
      const alreadySharedIds = new Set(sharedWith.map(s => s.teacher.id));
      setTeachers(
        (data as Teacher[])?.filter(t => !alreadySharedIds.has(t.id)) || []
      );
    } catch (error) {
      console.error('Error searching teachers:', error);
    }
  };

  // Effect hooks for initialization and search
  useEffect(() => {
    if (isOpen) {
      fetchSharedTeachers();
    } else {
      setSearchTerm('');
      setSelectedTeacher(null);
    }
  }, [isOpen, quizId]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        searchTeachers(searchTerm);
      } else {
        setTeachers([]);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Share quiz with selected teacher
  const handleShare = async () => {
    if (!selectedTeacher) return;
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shared_quizzes')
        .insert({
          quiz_id: quizId,
          shared_by: user.id,
          shared_with: selectedTeacher.id
        })
        .select(`
          id,
          access_code,
          teachers!shared_quizzes_shared_with_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        const responseData = data as unknown as DatabaseResponse;
        const newShare: SharedQuiz = {
          id: responseData.id,
          access_code: responseData.access_code,
          teacher: responseData.teachers
        };

        setSharedWith(prev => [...prev, newShare]);
        setSelectedTeacher(null);
        setSearchTerm('');

        toast({
          title: "Success",
          description: "Quiz shared successfully"
        });
      }
    } catch (error) {
      console.error('Error sharing quiz:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share quiz"
      });
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for copying and removing access
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied!",
        description: "Access code copied to clipboard"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy access code"
      });
    }
  };

  const removeAccess = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('shared_quizzes')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      setSharedWith(prev => prev.filter(share => share.id !== shareId));
      toast({
        title: "Success",
        description: "Access removed successfully"
      });
    } catch (error) {
      console.error('Error removing access:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove access"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Share Quiz</DialogTitle>
          <DialogDescription>
            Share "{quizTitle}" with other teachers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Add a teacher</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {teachers.length > 0 && (
              <div className="border rounded-md mt-2">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTeacher(teacher)}
                  >
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-gray-500">{teacher.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTeacher && (
            <div className="border rounded-md p-3 bg-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{selectedTeacher.name}</p>
                  <p className="text-sm text-gray-600">{selectedTeacher.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTeacher(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleShare}
                disabled={loading}
                className="w-full mt-2"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Quiz
              </Button>
            </div>
          )}

          {sharedWith.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Shared with</h4>
              <div className="space-y-2">
                {sharedWith.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{share.teacher.name}</p>
                      <p className="text-sm text-gray-500">{share.teacher.email}</p>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                          {share.access_code}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(share.access_code)}
                          className="ml-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccess(share.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};