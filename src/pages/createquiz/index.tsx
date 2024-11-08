import React, { useState } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import { motion } from "framer-motion";
import { Clock, Calendar, Users, ShieldCheck, Shuffle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Separator } from "@/ui/separator";
import { Calendar as CalendarComponent } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { format } from "date-fns";
import { cn } from "../../../utils/cn";

const CreateQuiz: React.FC = () => {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState("");
  const [duration, setDuration] = useState({ hours: "", minutes: "" });
  const [date, setDate] = useState<Date>();
  const [releaseTime, setReleaseTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [strictMode, setStrictMode] = useState(false);
  const [randomizeArrangement, setRandomizeArrangement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user found");
      }

      const totalMinutes =
        (parseInt(duration.hours) || 0) * 60 +
        (parseInt(duration.minutes) || 0);

      const releaseDateTime =
        date && releaseTime
          ? new Date(
              `${format(date, "yyyy-MM-dd")}T${releaseTime}`
            ).toISOString()
          : null;

      const { data, error } = await supabase
        .from("quizzes")
        .insert([
          {
            title: quizTitle,
            duration_minutes: totalMinutes > 0 ? totalMinutes : null,
            release_date: releaseDateTime,
            max_participants: maxParticipants
              ? parseInt(maxParticipants)
              : null,
            strict_mode: strictMode,
            randomize_arrangement: randomizeArrangement,
            teacher_id: user.id,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        router.push(`/addquestions/${data[0].id}`);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="space-y-1 bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Create New Quiz</CardTitle>
              <CardDescription className="text-gray-100">
                Configure your quiz settings below
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quiz Title */}
                <div className="space-y-2">
                  <Label htmlFor="quizTitle">Quiz Title</Label>
                  <Input
                    id="quizTitle"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                    required
                  />
                </div>

                {/* Duration and Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          placeholder="Hours"
                          min="0"
                          value={duration.hours}
                          onChange={(e) =>
                            setDuration({ ...duration, hours: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Minutes"
                          min="0"
                          max="59"
                          value={duration.minutes}
                          onChange={(e) =>
                            setDuration({
                              ...duration,
                              minutes: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Max Participants */}
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max. Participants</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="0"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        placeholder="Optional"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Release Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Release Date */}
                  <div className="space-y-2">
                    <Label>Release Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-white border rounded-md shadow-lg"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={
                            (date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                          }
                          className={cn(
                            "rounded-md border",
                            "bg-white",
                            "[&_.rdp-day]:h-9 [&_.rdp-day]:w-9", // Make day cells larger
                            "[&_.rdp-day_span]:rounded-md", // Round the day indicators
                            "[&_.rdp-day_span]:text-center", // Center the day text
                            "[&_.rdp-day_span]:text-sm", // Adjust text size
                            "[&_.rdp-day]:hover:bg-blue-50", // Hover effect
                            "[&_.rdp-day.rdp-day_selected]:bg-blue-600", // Selected date
                            "[&_.rdp-day.rdp-day_selected]:text-white",
                            "[&_.rdp-day.rdp-day_selected]:hover:bg-blue-700",
                            "[&_.rdp-day.rdp-day_disabled]:text-gray-300", // Disabled dates
                            "[&_.rdp-day.rdp-day_disabled]:hover:bg-transparent",
                            "[&_.rdp-head_cell]:font-normal", // Header styling
                            "[&_.rdp-head_cell]:text-gray-500",
                            "[&_.rdp-nav_button]:hover:bg-blue-50", // Navigation buttons
                            "[&_.rdp-nav_button]:rounded-md",
                            "[&_.rdp-nav_button]:p-1"
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Release Time */}
                  <div className="space-y-2">
                    <Label htmlFor="releaseTime">Release Time</Label>
                    <Input
                      type="time"
                      id="releaseTime"
                      value={releaseTime}
                      onChange={(e) => setReleaseTime(e.target.value)}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Quiz Settings */}
                <div className="space-y-4">
                  <Label className="text-base">Quiz Settings</Label>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="strictMode"
                        checked={strictMode}
                        onCheckedChange={(checked) =>
                          setStrictMode(checked as boolean)
                        }
                        className="h-5 w-5 border-2"
                      />
                      <Label
                        htmlFor="strictMode"
                        className="cursor-pointer flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <ShieldCheck className="h-4 w-4 text-gray-500 mr-2" />
                        Strict Mode
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="randomizeArrangement"
                        checked={randomizeArrangement}
                        onCheckedChange={(checked) =>
                          setRandomizeArrangement(checked as boolean)
                        }
                        className="h-5 w-5 border-2"
                      />
                      <Label
                        htmlFor="randomizeArrangement"
                        className="cursor-pointer flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Shuffle className="h-4 w-4 text-gray-500 mr-2" />
                        Randomize Arrangement
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 h-11"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Quiz and Add Questions"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TeacherLayout>
  );
};

export default CreateQuiz;
