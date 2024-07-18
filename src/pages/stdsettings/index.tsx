import Link from 'next/link';
import { useState } from 'react';

const StudentSettings = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Mock API data for user settings
  const [settings, setSettings] = useState({
    emailNotifications: 'Enabled',
    theme: 'Light',
    language: 'English',
    privacyMode: 'Public',
    twoFactorAuth: 'Disabled'
  });

  const handleSave = () => {
    // Placeholder for save logic
    console.log('Settings saved:', settings);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out bg-gray-800 text-white w-64 z-30`}>
        <div className="p-6 text-2xl font-bold border-b border-gray-700">Quizze</div>
        <nav className="flex-1 p-4 space-y-2">
          <ul className="space-y-2">
            <li>
              <Link href="/studentdash" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/studentprofile" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Profile</a>
              </Link>
            </li>
            <li>
              <Link href="/stdinbox" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Inbox</a>
              </Link>
            </li>
            <li>
              <Link href="/stdsettings" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Settings</a>
              </Link>
            </li>
            <li className="mt-auto">
              <Link href="/signin" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Logout</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Navbar */}
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          <button className="md:hidden text-black" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="flex items-center">
            <img src="/ZabirHD.png" alt="User profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">SWE22070001</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">User Settings</h2>

          {/* General Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-700">Email Notifications</label>
                <select 
                  id="emailNotifications"
                  value={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </form>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="privacyMode" className="block text-sm font-medium text-gray-700">Profile Visibility</label>
                <select 
                  id="privacyMode"
                  value={settings.privacyMode}
                  onChange={(e) => setSettings({ ...settings, privacyMode: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Public</option>
                  <option>Friends Only</option>
                  <option>Private</option>
                </select>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="twoFactorAuth" className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <select 
                  id="twoFactorAuth"
                  value={settings.twoFactorAuth}
                  onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
              <div>
                <button
                  type="button"
                  className="mt-2 py-2 px-4 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleSave}
              className="py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;