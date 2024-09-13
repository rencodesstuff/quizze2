import React, { useState } from "react";
import { useRouter } from "next/router";
import TeacherLayout from "@/comps/teacher-layout";
import { createClient } from "../../../utils/supabase/component";

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
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Create New Quiz</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700">
              Quiz Title
            </label>
            <input
              type="text"
              id="quizTitle"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (Optional)</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  placeholder="Hours"
                  value={duration.hours}
                  onChange={(e) => setDuration({ ...duration, hours: e.target.value })}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
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
                Max. Participants (Optional)
              </label>
              <input
                type="number"
                id="maxParticipants"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700">
                Release Date (Optional)
              </label>
              <input
                type="date"
                id="releaseDate"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="releaseTime" className="block text-sm font-medium text-gray-700">
                Release Time (Optional)
              </label>
              <input
                type="time"
                id="releaseTime"
                value={releaseTime}
                onChange={(e) => setReleaseTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center">
              <input
                id="strictMode"
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="strictMode" className="ml-2 block text-sm text-gray-900">
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
                Randomize Arrangement
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Quiz and Add Questions'}
            </button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  );
};

export default CreateQuiz;