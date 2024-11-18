// pages/flashcards/index.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StudentLayout from "@/comps/student-layout";
import { createClient } from "../../../utils/supabase/component";
import { Button } from "@/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { toast } from "../../hooks/use-toast";
import {
  PlusIcon,
  DownloadIcon,
  UploadIcon,
  PlayIcon,
  ShareIcon,
  CollectionIcon,
  DocumentTextIcon,
  ArrowSmRightIcon,
} from "@heroicons/react/outline";

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  total_cards: number;
  mastery_level: number;
}

interface NewSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => Promise<void>;
}

interface ShareSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (studentId: string) => Promise<void>;
  setTitle: string;
}

const NewSetModal: React.FC<NewSetModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(title, description);
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flashcard set",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create New Flashcard Set
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter set title"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter set description"
              className="w-full min-h-[100px]"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Set"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ShareSetModal: React.FC<ShareSetModalProps> = ({
  isOpen,
  onClose,
  onShare,
  setTitle,
}) => {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onShare(studentId);
      setStudentId("");
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share flashcard set",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Share "{setTitle}"
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-sm font-medium">
              Friend's Student ID
            </Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID"
              className="w-full"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Sharing..." : "Share Set"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EmptyState = ({
  onCreateNew,
  onImport,
}: {
  onCreateNew: () => void;
  onImport: () => void;
}) => (
  <div className="text-center py-12">
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-dashed border-gray-200">
        <CollectionIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No flashcard sets yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating a new set or importing existing flashcards
        </p>
        <div className="mt-6 space-y-3">
          <Button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Set
          </Button>
          <Button
            variant="outline"
            onClick={onImport}
            className="w-full flex items-center justify-center gap-2 bg-white"
          >
            <UploadIcon className="w-5 h-5" />
            Import Flashcards
          </Button>
        </div>
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900">
            Quick Start Guide
          </h4>
          <ul className="mt-4 space-y-3">
            {[
              {
                text: "Create your first set of flashcards",
                icon: DocumentTextIcon,
              },
              { text: "Import from CSV or JSON files", icon: UploadIcon },
              {
                text: "Start studying and track progress",
                icon: ArrowSmRightIcon,
              },
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center text-sm text-gray-500"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const FlashcardsPage = () => {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSetModal, setShowNewSetModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchStudentInfo();
    fetchFlashcardSets();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("students")
          .select("name, student_id")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setStudentName(data.name);
          setStudentId(data.student_id);
        }
      }
    } catch (error) {
      console.error("Error fetching student info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student information",
        variant: "destructive",
      });
    }
  };

  const fetchFlashcardSets = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("flashcard_sets")
          .select(
            `
            *,
            flashcards:flashcards(count),
            mastery:flashcards(mastery_level)
          `
          )
          .eq("student_id", user.id);

        if (error) throw error;

        const transformedSets = data.map((set) => ({
          ...set,
          total_cards: set.flashcards[0]?.count || 0,
          mastery_level: set.flashcards[0]?.count
            ? set.mastery.reduce(
                (acc: number, card: any) => acc + card.mastery_level,
                0
              ) / set.flashcards[0].count
            : 0,
        }));

        setSets(transformedSets);
      }
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch flashcard sets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (title: string, description: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: set, error: setError } = await supabase
        .from("flashcard_sets")
        .insert({
          student_id: user.id,
          title,
          description,
        })
        .select()
        .single();

      if (setError) throw setError;

      toast({
        title: "Success",
        description: "Flashcard set created successfully",
      });

      await fetchFlashcardSets();
      router.push(`/flashcards/${set.id}`);
    } catch (error) {
      console.error("Error creating set:", error);
      throw error;
    }
  };

  const handleShare = async (recipientStudentId: string) => {
    if (!selectedSet) return;

    try {
      // First, get the recipient's user ID
      const { data: recipientData, error: recipientError } = await supabase
        .from("students")
        .select("id")
        .eq("student_id", recipientStudentId)
        .single();

      if (recipientError) throw new Error("Student not found");

      // Get all flashcards from the original set
      const { data: flashcards, error: flashcardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("set_id", selectedSet.id);

      if (flashcardsError) throw flashcardsError;

      // Create a new set for the recipient
      const { data: newSet, error: setError } = await supabase
        .from("flashcard_sets")
        .insert({
          student_id: recipientData.id,
          title: `${selectedSet.title} (Shared)`,
          description: selectedSet.description,
          is_public: false,
        })
        .select()
        .single();

      if (setError) throw setError;

      // Copy all flashcards to the new set
      const { error: copyError } = await supabase.from("flashcards").insert(
        flashcards.map((card) => ({
          set_id: newSet.id,
          front_content: card.front_content,
          back_content: card.back_content,
          mastery_level: 0,
          last_reviewed: null,
        }))
      );

      if (copyError) throw copyError;

      // Record the import
      const { error: importError } = await supabase
        .from("flashcard_imports")
        .insert({
          set_id: newSet.id,
          source: "shared",
          source_url: `original_set_${selectedSet.id}`,
        });

      if (importError) throw importError;

      toast({
        title: "Success",
        description: "Flashcard set shared successfully",
      });
    } catch (error) {
      console.error("Error sharing flashcards:", error);
      throw error;
    }
  };

  const handleExport = async (setId: string) => {
    try {
      // Fetch all flashcards for the set
      const { data: flashcards, error: flashcardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("set_id", setId);

      if (flashcardsError) throw flashcardsError;

      // Get set details
      const { data: setData, error: setError } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("id", setId)
        .single();

      if (setError) throw setError;

      // Create export data structure
      const exportData = {
        set: {
          title: setData.title,
          description: setData.description,
          tags: setData.tags,
        },
        cards: flashcards.map((card) => ({
          front: card.front_content,
          back: card.back_content,
        })),
      };

      // Create the export file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${setData.title.toLowerCase().replace(/\s+/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Flashcard set exported successfully",
      });
    } catch (error) {
      console.error("Error exporting flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to export flashcards",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    document.getElementById("import-file")?.click();
  };

  const handleImport = async (files: FileList | null) => {
    if (!files?.length) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Create new set
        const { data: newSet, error: setError } = await supabase
          .from("flashcard_sets")
          .insert({
            student_id: user.id,
            title: `${importData.set.title} (Imported)`,
            description: importData.set.description,
            tags: importData.set.tags || [],
            is_public: false,
          })
          .select()
          .single();

        if (setError) throw setError;

        // Insert cards
        const { error: cardsError } = await supabase.from("flashcards").insert(
          importData.cards.map((card: any) => ({
            set_id: newSet.id,
            front_content: card.front,
            back_content: card.back,
            mastery_level: 0,
            last_reviewed: null,
          }))
        );

        if (cardsError) throw cardsError;

        // Record the import
        const { error: importError } = await supabase
          .from("flashcard_imports")
          .insert({
            set_id: newSet.id,
            source: "file",
            source_url: file.name,
          });

        if (importError) throw importError;

        toast({
          title: "Success",
          description: "Flashcard set imported successfully",
        });

        await fetchFlashcardSets();
        router.push(`/flashcards/${newSet.id}`);
      } catch (error) {
        console.error("Error importing flashcards:", error);
        toast({
          title: "Error",
          description:
            "Failed to import flashcards. Please check the file format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  const handleCreateNew = () => {
    setShowNewSetModal(true);
  };

  const renderCard = (set: FlashcardSet) => (
    <Card key={set.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{set.title}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/flashcards/${set.id}`)}
            className="hover:bg-gray-100"
          >
            <PlayIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport(set.id)}
            className="hover:bg-gray-100"
          >
            <DownloadIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSet(set);
              setShowShareModal(true);
            }}
            className="hover:bg-gray-100"
          >
            <ShareIcon className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{set.description}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{set.total_cards} cards</span>
          <span>Mastery: {Math.round(set.mastery_level * 20)}%</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Flashcards</h1>
            <p className="text-gray-600">
              Create and manage your flashcard sets
            </p>
          </div>
          {sets.length > 0 && (
            <div className="flex gap-4">
              <Button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5" />
                New Set
              </Button>
              <Button
                variant="outline"
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-white"
              >
                <UploadIcon className="w-5 h-5" />
                Import
              </Button>
            </div>
          )}
          <input
            type="file"
            id="import-file"
            className="hidden"
            accept=".json"
            onChange={(e) => handleImport(e.target.files)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : sets.length === 0 ? (
          <EmptyState
            onCreateNew={handleCreateNew}
            onImport={handleImportClick}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map(renderCard)}
          </div>
        )}

        <NewSetModal
          isOpen={showNewSetModal}
          onClose={() => setShowNewSetModal(false)}
          onCreate={handleCreateSet}
        />

        {selectedSet && (
          <ShareSetModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setSelectedSet(null);
            }}
            onShare={handleShare}
            setTitle={selectedSet.title}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default FlashcardsPage;
