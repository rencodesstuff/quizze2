import React, { useState } from "react";
import TeacherLayout from "@/comps/teacher-layout";

const TeacherSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Mock API data for teacher settings
  const [settings, setSettings] = useState({
    emailNotifications: 'Enabled',
    quizResultVisibility: 'Private',
    theme: 'Light',
    language: 'English',
    gradingPreference: 'Automatic',
  });

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'preferences', label: 'Preferences' },
  ];

  const handleSave = () => {
    // Placeholder for save logic
    console.log('Settings saved:', settings);
  };

  return (
    <TeacherLayout>
      {/* Content area */}
      <div className="flex-1 p-4 space-y-4">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-700">Email Notifications</label>
                  <select 
                    id="emailNotifications"
                    value={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</label>
                  <select 
                    id="theme"
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                  <select 
                    id="language"
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="quizResultVisibility" className="block text-sm font-medium text-gray-700">Quiz Result Visibility</label>
                  <select 
                    id="quizResultVisibility"
                    value={settings.quizResultVisibility}
                    onChange={(e) => setSettings({ ...settings, quizResultVisibility: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="gradingPreference" className="block text-sm font-medium text-gray-700">Grading Preference</label>
                  <select 
                    id="gradingPreference"
                    value={settings.gradingPreference}
                    onChange={(e) => setSettings({ ...settings, gradingPreference: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherSettings;