import Link from 'next/link';
import { useState } from 'react';

interface ClassType {
  id: number;
  name: string;
  students: number;
  averageScore: number;
}

const TeacherStudentScores = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);

  // Mock data for classes
  const classes: ClassType[] = [
    { id: 1, name: 'STT 2263', students: 30, averageScore: 85 },
    { id: 2, name: 'CIT 0163', students: 25, averageScore: 78 },
    { id: 3, name: 'STT 0519', students: 35, averageScore: 92 },
    { id: 4, name: 'CIT 0112', students: 28, averageScore: 80 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out bg-gray-800 text-white w-64 z-30`}>
        <div className="p-6 text-2xl font-bold border-b border-gray-700">Quizze</div>
        <nav className="flex-1 p-4 space-y-2">
        <ul className="space-y-2">
            <li>
              <Link href="/teachdash" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/createquiz" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Create Quiz</a>
              </Link>
            </li>
            <li>
              <Link href="/myquizzes" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">My Quizzes</a>
              </Link>
            </li>
            <li>
              <Link href="/stdscores" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Student Scores</a>
              </Link>
            </li>
            <li>
              <Link href="/teacherprofile" legacyBehavior>
                <a className="block p-2 rounded hover:bg-gray-700">Profile</a>
              </Link>
            </li>
            <li>
              <Link href="/teachsettings" legacyBehavior>
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
          <h1 className="text-2xl font-bold">Student Scores</h1>
          <div className="flex items-center">
            <img src="/TeacherAvatar.png" alt="Teacher profile" className="w-10 h-10 rounded-full mr-4" />
            <div>
              <div className="font-bold">Dr. Smith</div>
              <div className="text-gray-600">Software Engineering</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 space-y-4">
          <h2 className="text-2xl font-bold">Your Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <div 
                key={classItem.id} 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedClass(classItem)}
              >
                <h3 className="text-xl font-semibold mb-2">{classItem.name}</h3>
                <p className="text-gray-600">Students: {classItem.students}</p>
                <p className="text-gray-600">Average Score: {classItem.averageScore}%</p>
              </div>
            ))}
          </div>

          {selectedClass && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">{selectedClass.name} - Student Scores</h3>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <select className="border rounded-md px-2 py-1">
                      <option>Sort by Name</option>
                      <option>Sort by Score</option>
                      <option>Sort by Date</option>
                    </select>
                    <button className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-colors">
                      Sort
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    className="border rounded-md px-4 py-1 w-64"
                  />
                </div>
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Score</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-t px-4 py-2">Zabir</td>
                      <td className="border-t px-4 py-2">95%</td>
                      <td className="border-t px-4 py-2">2024-07-15</td>
                    </tr>
                    <tr>
                      <td className="border-t px-4 py-2">Shahmi</td>
                      <td className="border-t px-4 py-2">88%</td>
                      <td className="border-t px-4 py-2">2024-07-15</td>
                    </tr>
                    <tr>
                      <td className="border-t px-4 py-2">Syasya</td>
                      <td className="border-t px-4 py-2">92%</td>
                      <td className="border-t px-4 py-2">2024-07-15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentScores;