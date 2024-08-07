import React, { useState } from "react";
import TeacherLayout from "@/comps/teacher-layout";

interface ClassType {
  id: number;
  name: string;
  students: number;
  averageScore: number;
}

const TeacherStudentScores = () => {
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const classes: ClassType[] = [
    { id: 1, name: 'STT 2263', students: 30, averageScore: 85 },
    { id: 2, name: 'CIT 0163', students: 25, averageScore: 78 },
    { id: 3, name: 'STT 0519', students: 35, averageScore: 92 },
    { id: 4, name: 'CIT 0112', students: 28, averageScore: 80 },
  ];

  const students = [
    { id: 1, name: 'Zabir', score: 95, date: '2024-07-15' },
    { id: 2, name: 'Shahmi', score: 88, date: '2024-07-15' },
    { id: 3, name: 'Syasya', score: 92, date: '2024-07-15' },
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TeacherLayout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Scores</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className={`p-4 rounded-lg shadow-md cursor-pointer transition duration-300 ${
                selectedClass?.id === classItem.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedClass(classItem)}
            >
              <h3 className="text-lg font-semibold mb-2">{classItem.name}</h3>
              <p className="text-sm text-gray-600">Students: {classItem.students}</p>
              <p className="text-sm text-gray-600">Avg. Score: {classItem.averageScore}%</p>
            </div>
          ))}
        </div>

        {selectedClass && (
          <div>
            <h2 className="text-xl font-semibold mb-4">{selectedClass.name} - Student Scores</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search students..."
                className="w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Score</th>
                  <th className="py-3 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{student.name}</td>
                    <td className="py-4 px-4">{student.score}%</td>
                    <td className="py-4 px-4">{student.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherStudentScores;