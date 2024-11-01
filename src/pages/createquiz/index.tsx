import React, { useState } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";
import { motion } from "framer-motion";
import { Clock, Calendar, Users, ShieldCheck, Shuffle } from "lucide-react";

const CreateQuiz: React.FC = () => {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState("");
  const [duration, setDuration] = useState({ hours: "", minutes: "" });
  const [releaseDate, setReleaseDate] = useState("");
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const totalMinutes = 
        (parseInt(duration.hours) || 0) * 60 + 
        (parseInt(duration.minutes) || 0);

      const releaseDateTime = releaseDate && releaseTime 
        ? new Date(`${releaseDate}T${releaseTime}`).toISOString()
        : null;

      const { data, error } = await supabase
        .from('quizzes')
        .insert([
          {
            title: quizTitle,
            duration_minutes: totalMinutes > 0 ? totalMinutes : null,
            release_date: releaseDateTime,
            max_participants: maxParticipants ? parseInt(maxParticipants) : null,
            strict_mode: strictMode,
            randomize_arrangement: randomizeArrangement,
            teacher_id: user.id,
          }
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        router.push(`/addquestions/${data[0].id}`);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create New Quiz
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Quiz Title */}
            <div className="space-y-1">
              <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700">
                Quiz Title
              </label>
              <input
                type="text"
                id="quizTitle"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Duration and Participants */}
            <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              {/* Duration */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      placeholder="Hours"
                      min="0"
                      value={duration.hours}
                      onChange={(e) => setDuration({ ...duration, hours: e.target.value })}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      placeholder="Minutes"
                      min="0"
                      max="59"
                      value={duration.minutes}
                      onChange={(e) => setDuration({ ...duration, minutes: e.target.value })}
                      className="block w-full px-3 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Max Participants */}
              <div className="space-y-1">
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                  Max. Participants
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="maxParticipants"
                    min="0"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Release Date and Time */}
            <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              {/* Release Date */}
              <div className="space-y-1">
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700">
                  Release Date
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="releaseDate"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Release Time */}
              <div className="space-y-1">
                <label htmlFor="releaseTime" className="block text-sm font-medium text-gray-700">
                  Release Time
                </label>
                <input
                  type="time"
                  id="releaseTime"
                  value={releaseTime}
                  onChange={(e) => setReleaseTime(e.target.value)}
                  className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between border-t border-gray-200 pt-4">
              {/* Strict Mode */}
              <div className="flex items-center">
                <input
                  id="strictMode"
                  type="checkbox"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="strictMode" className="ml-2 flex items-center text-sm text-gray-700">
                  <ShieldCheck className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="hidden sm:inline">Strict Mode</span>
                  <span className="sm:hidden">Strict</span>
                </label>
              </div>

              {/* Randomize Arrangement */}
              <div className="flex items-center">
                <input
                  id="randomizeArrangement"
                  type="checkbox"
                  checked={randomizeArrangement}
                  onChange={(e) => setRandomizeArrangement(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="randomizeArrangement" className="ml-2 flex items-center text-sm text-gray-700">
                  <Shuffle className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="hidden sm:inline">Randomize Arrangement</span>
                  <span className="sm:hidden">Randomize</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Quiz and Add Questions'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </TeacherLayout>
  );
};

export default CreateQuiz;