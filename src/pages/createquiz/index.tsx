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
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h1 className="text-3xl font-bold text-white">Create New Quiz</h1>
          </div>
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            <div>
              <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700">
                Quiz Title
              </label>
              <input
                type="text"
                id="quizTitle"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="number"
                    placeholder="Hours"
                    value={duration.hours}
                    onChange={(e) => setDuration({ ...duration, hours: e.target.value })}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                  />
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={duration.minutes}
                    onChange={(e) => setDuration({ ...duration, minutes: e.target.value })}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                  Max. Participants
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="maxParticipants"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700">
                  Release Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
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

              <div>
                <label htmlFor="releaseTime" className="block text-sm font-medium text-gray-700">
                  Release Time
                </label>
                <input
                  type="time"
                  id="releaseTime"
                  value={releaseTime}
                  onChange={(e) => setReleaseTime(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <input
                  id="strictMode"
                  type="checkbox"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="strictMode" className="ml-2 block text-sm text-gray-900">
                  <ShieldCheck className="h-5 w-5 text-gray-400 inline mr-1" />
                  Strict Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="randomizeArrangement"
                  type="checkbox"
                  checked={randomizeArrangement}
                  onChange={(e) => setRandomizeArrangement(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="randomizeArrangement" className="ml-2 block text-sm text-gray-900">
                  <Shuffle className="h-5 w-5 text-gray-400 inline mr-1" />
                  Randomize Arrangement
                </label>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Quiz and Add Questions'}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </TeacherLayout>
  );
};

export default CreateQuiz;