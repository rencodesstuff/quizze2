import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from "@/comps/admin-layout";
import { Card, Title, Text } from "@tremor/react";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { createClient } from '../../../utils/supabase/component';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";

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
        ...(studentsData?.map((student) => ({
          id: student.id,
          name: student.name,
          role: 'student',
          status: 'Active'
        })) || []),
        ...(teachersData?.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          role: 'teacher',
          status: 'Active'
        })) || [])
      ];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
    setIsDropdownOpen(false);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/usermanagement/edit/${userId}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
    if (type === 'role') {
      return value === 'student' 
        ? 'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20'
        : 'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20';
    }
    return 'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20';
  };

  return (
    <AdminLayout>
      <Card className="mt-6">
        <Title>User Management</Title>
        <Text>Manage and overview all users</Text>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2"
                >
                  {roleFilter === 'all' ? 'All Roles' : roleFilter === 'student' ? 'Students' : 'Teachers'}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 rounded-md border bg-popover shadow-md z-10">
                    <div className="p-1">
                      {['all', 'student', 'teacher'].map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleFilterChange(role)}
                          className="relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          {role === 'all' ? 'All Roles' : role === 'student' ? 'Students' : 'Teachers'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
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
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between space-x-2 py-4">
            <Text>
              Showing {((currentPage - 1) * USERS_PER_PAGE) + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </Text>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default UserManagement;