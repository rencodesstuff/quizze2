import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from "@/comps/admin-layout";
import { Card, Title, Text } from "@tremor/react";
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/solid';
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
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger, 
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction 
} from "@/ui/alert-dialog";

// Define interfaces for type safety
interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  email?: string;
}

const USERS_PER_PAGE = 10;

const UserManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from database
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch students with email
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, email, student_id');
      
      // Fetch teachers with email
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, name, email');

      if (studentsError || teachersError) throw studentsError || teachersError;

      const formattedUsers: User[] = [
        ...(studentsData?.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'student',
          status: 'Active'
        })) || []),
        ...(teachersData?.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
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

  // Handle user deletion
  const handleDeleteUsers = async () => {
    try {
      const studentIds = selectedUsers.filter(id => 
        users.find(u => u.id === id)?.role === 'student'
      );
      const teacherIds = selectedUsers.filter(id => 
        users.find(u => u.id === id)?.role === 'teacher'
      );

      if (studentIds.length) {
        await supabase
          .from('students')
          .delete()
          .in('id', studentIds);
      }

      if (teacherIds.length) {
        await supabase
          .from('teachers')
          .delete()
          .in('id', teacherIds);
      }

      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  // Handle checkbox selection
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
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

  // Filter users based on search and role
  const filteredUsers = users.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
              {selectedUsers.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <TrashIcon className="h-4 w-4" />
                      Delete Selected ({selectedUsers.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedUsers.length} selected users? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteUsers}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
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
              {selectedUsers.length > 0 ? (
                <span>{selectedUsers.length} of {filteredUsers.length} selected</span>
              ) : (
                <span>Showing {((currentPage - 1) * USERS_PER_PAGE) + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users</span>
              )}
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