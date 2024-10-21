import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from "@/comps/admin-layout";
import { 
  Card, 
  Title, 
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  TextInput,
  Flex
} from "@tremor/react";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { createClient } from '../../../utils/supabase/component';

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
}

const USERS_PER_PAGE = 10;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name');
      
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, name');

      if (studentsError || teachersError) throw studentsError || teachersError;

      const formattedUsers: User[] = [
        ...studentsData.map((student: any) => ({
          id: student.id,
          name: student.name,
          role: 'student',
          status: 'Active'
        })),
        ...teachersData.map((teacher: any) => ({
          id: teacher.id,
          name: teacher.name,
          role: 'teacher',
          status: 'Active'
        }))
      ];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter === 'all' || user.role === roleFilter)
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const getBadgeStyle = (type: 'role' | 'status', value: string) => {
    let bgColor = '';
    let textColor = 'text-white';
    
    if (type === 'role') {
      bgColor = value === 'student' ? 'bg-blue-500' : 'bg-green-500';
    } else if (type === 'status') {
      bgColor = 'bg-green-500';
    }

    return `${bgColor} ${textColor} text-xs font-medium mr-2 px-2.5 py-0.5 rounded`;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/usermanagement/edit/${userId}`);
  };

  return (
    <AdminLayout>
      <Card className="mt-6">
        <Title>User Management</Title>
        <Text>Manage and overview all users</Text>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <Flex justifyContent="between" alignItems="center" className="space-x-4">
            <TextInput 
              icon={SearchIcon}
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-40 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
              >
                {roleFilter === 'all' ? 'All Roles' : roleFilter === 'student' ? 'Students' : 'Teachers'}
                <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button
                      onClick={() => handleRoleFilterChange('all')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                      role="menuitem"
                    >
                      All Roles
                    </button>
                    <button
                      onClick={() => handleRoleFilterChange('student')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                      role="menuitem"
                    >
                      Students
                    </button>
                    <button
                      onClick={() => handleRoleFilterChange('teacher')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                      role="menuitem"
                    >
                      Teachers
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Flex>
        </div>

        {isLoading ? (
          <Text>Loading users...</Text>
        ) : (
          <>
            <Table className="mt-6">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span className={getBadgeStyle('role', user.role)}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getBadgeStyle('status', user.status)}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="xs" 
                        variant="secondary" 
                        color="gray"
                        onClick={() => handleEditUser(user.id)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 flex items-center justify-between">
              <Text>
                Showing {((currentPage - 1) * USERS_PER_PAGE) + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </Text>
              <div className="flex items-center space-x-2">
                <Button
                  icon={ChevronLeftIcon}
                  variant="secondary"
                  color="gray"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "primary" : "secondary"}
                    color={currentPage === index + 1 ? "blue" : "gray"}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  icon={ChevronRightIcon}
                  iconPosition="right"
                  variant="secondary"
                  color="gray"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </AdminLayout>
  );
};

export default UserManagement;