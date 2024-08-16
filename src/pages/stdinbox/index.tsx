import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Title, Text, TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import { SearchIcon, MailIcon, TrashIcon, StarIcon } from "@heroicons/react/outline";
import StudentLayout from "@/comps/student-layout";
import { createClient } from "../../../utils/supabase/component";

type Message = {
  id: number;
  sender: string;
  subject: string;
  date: string;
  content: string;
  unread: boolean;
};

const messages: Message[] = [
  {
    id: 1,
    sender: "Professor Smith",
    subject: "Quiz Reminder",
    date: "2024-07-15",
    content: "Dear student, This is a reminder about the upcoming quiz on Monday. Make sure to review chapters 5-7. Good luck!",
    unread: true
  },
  {
    id: 2,
    sender: "System Notification",
    subject: "New Quiz Available",
    date: "2024-07-14",
    content: "A new quiz has been added to your dashboard. Please complete it by Friday, July 19th.",
    unread: false
  },
  {
    id: 3,
    sender: "Study Group",
    subject: "Study Session",
    date: "2024-07-13",
    content: "Hi everyone, We're organizing a study session for the upcoming exam. It will be held in the library on Thursday at 6 PM. Hope to see you there!",
    unread: false
  }
];

const StudentInbox: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error(`Error fetching user: ${userError.message}`);
        }

        if (user) {
          const { data, error } = await supabase
            .from('students')
            .select('name, student_id')
            .eq('id', user.id)
            .single();

          if (error) {
            throw new Error(`Error fetching student info: ${error.message}`);
          }

          if (data) {
            setStudentName(data.name);
            setStudentId(data.student_id);
          } else {
            throw new Error('No student data found');
          }
        } else {
          throw new Error('No authenticated user found');
        }
      } catch (err) {
        console.error('Error in fetchStudentInfo:', err);
        // You might want to handle this error more gracefully in a production app
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();
  }, []);

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <StudentLayout studentName={studentName} studentId={studentId}>
      <div className="p-6">
        <Title>Student Inbox</Title>
        <Text>Manage your messages and notifications</Text>

        <Card className="mt-6">
          <div className="flex items-center mb-4">
            <SearchIcon className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search messages..."
              className="flex-grow p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <TabGroup>
            <TabList>
              <Tab icon={MailIcon}>Inbox</Tab>
              <Tab icon={StarIcon}>Starred</Tab>
              <Tab icon={TrashIcon}>Trash</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Message List */}
                  <div className="col-span-1 overflow-y-auto max-h-[70vh]">
                    {filteredMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMessage(message)}
                        className={`p-4 mb-2 rounded-lg cursor-pointer ${
                          message.unread ? 'bg-blue-50' : 'bg-white'
                        } ${selectedMessage?.id === message.id ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
                      >
                        <div className="font-semibold">{message.sender}</div>
                        <div className="text-sm text-gray-600 truncate">{message.subject}</div>
                        <div className="text-xs text-gray-400 mt-1">{message.date}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Message Content */}
                  <div className="col-span-2 bg-white rounded-lg p-6 border border-gray-200">
                    {selectedMessage ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h2>
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <span>From: {selectedMessage.sender}</span>
                          <span>{selectedMessage.date}</span>
                        </div>
                        <p className="text-gray-800">{selectedMessage.content}</p>
                        <div className="mt-6">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                            Reply
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Select a message to view its content
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="text-center text-gray-500 py-8">
                  No starred messages
                </div>
              </TabPanel>
              <TabPanel>
                <div className="text-center text-gray-500 py-8">
                  Trash is empty
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentInbox;