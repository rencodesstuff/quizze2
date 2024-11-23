import React, { useState } from "react";
import AdminLayout from "@/comps/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import {
  UserPlus,
  Mail,
  IdCard,
  BookOpen,
  Copy,
  CheckCircle,
  Loader2,
  User,
  GraduationCap,
  BookOpen as Course,
  XCircle,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { createClient } from "../../../utils/supabase/component";

const generateRandomPassword = (length: number = 12): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let password =
    lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
    uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
    numbers.charAt(Math.floor(Math.random() * numbers.length)) +
    symbols.charAt(Math.floor(Math.random() * symbols.length));

  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: string;
  name: string;
  email: string;
  password: string;
}

interface FailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  userType,
  name,
  email,
  password,
}) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} has been copied to clipboard`,
        duration: 2000,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="h-8 w-8 text-green-500" />
            User Created Successfully
          </DialogTitle>
          <DialogDescription className="text-base">
            New {userType} account has been created. Please save these credentials:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-gray-200 p-4 space-y-4">
            {[
              { label: "Name", value: name, icon: User },
              { label: "Email", value: email, icon: Mail },
              { label: "Temporary Password", value: password, icon: Copy },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-700">{item.label}</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {item.value}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className={`hover:bg-gray-200 ${
                    copiedField === item.label ? "text-green-600" : ""
                  }`}
                >
                  {copiedField === item.label ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          <Alert className="bg-yellow-50 border-yellow-100 text-yellow-800">
            <AlertTitle className="text-yellow-800 font-semibold">
              Important Notice
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              Please make sure to save or share these credentials securely. The
              password cannot be retrieved later.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FailureModal: React.FC<FailureModalProps> = ({
  isOpen,
  onClose,
  error,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-2xl text-red-600">
            <XCircle className="h-8 w-8 text-red-600" />
            Failed to Create User
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="border-red-600">
            <AlertTitle className="text-lg font-semibold">Error Details</AlertTitle>
            <AlertDescription className="mt-2 text-base">
              {error}
            </AlertDescription>
          </Alert>
          <p className="text-gray-600">
            Please try again or contact support if the issue persists.
          </p>
        </div>
        <DialogFooter>
          <Button 
            onClick={onClose} 
            variant="destructive" 
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddUserPage: React.FC = () => {
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [course, setCourse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const { toast } = useToast();

  const supabase = createClient();

  const resetForm = () => {
    setName("");
    setEmail("");
    setId("");
    setCourse("");
    setNewUserPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Check if email exists in students or teachers table
      const { data: existingStudent } = await supabase
        .from("students")
        .select("email")
        .eq("email", email)
        .single();

      const { data: existingTeacher } = await supabase
        .from("teachers")
        .select("email")
        .eq("email", email)
        .single();

      if (existingStudent || existingTeacher) {
        throw new Error("A user with this email already exists");
      }

      if (userType === "student") {
        // Check if student ID already exists
        const { data: existingUser, error: userCheckError } = await supabase
          .from("students")
          .select("student_id")
          .eq("student_id", id)
          .single();

        if (userCheckError && userCheckError.code !== "PGRST116") {
          throw userCheckError;
        }

        if (existingUser) {
          throw new Error("A student with this ID already exists");
        }
      }

      // Generate password
      const password = generateRandomPassword();
      setNewUserPassword(password);

      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userType,
          name,
          studentId: userType === 'student' ? id : undefined,
          course: userType === 'teacher' ? course : undefined,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create user');
      }

      setIsSuccessModalOpen(true);
      toast({
        title: "Success!",
        description: `${
          userType === "student" ? "Student" : "Teacher"
        } account created successfully`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setIsFailureModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="border-0 shadow-lg w-full max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className="h-6 w-6" />
              Add New User
            </CardTitle>
            <CardDescription>
              Create a new student or teacher account with generated credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="student"
              value={userType}
              onValueChange={(v: any) => setUserType(v)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted rounded-lg">
                <TabsTrigger
                  value="student"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 
                    ${userType === "student" 
                      ? "border-2 border-primary bg-primary text-primary-foreground shadow-sm" 
                      : "border-2 border-transparent hover:border-primary/30 hover:bg-muted"}`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger
                  value="teacher"
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 
                    ${userType === "teacher" 
                      ? "border-2 border-primary bg-primary text-primary-foreground shadow-sm" 
                      : "border-2 border-transparent hover:border-primary/30 hover:bg-muted"}`}
                >
                  <BookOpen className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="focus-visible:ring-2"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="focus-visible:ring-2"
                      required
                    />
                  </div>

                  {userType === "student" && (
                    <div className="grid gap-2">
                      <Label htmlFor="id" className="flex items-center gap-2">
                        <IdCard className="h-4 w-4" />
                        Student ID
                      </Label>
                      <Input
                        id="id"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder="S12345"
                        className="focus-visible:ring-2"
                        required
                      />
                    </div>
                  )}

                  {userType === "teacher" && (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="course"
                        className="flex items-center gap-2"
                      >
                        <Course className="h-4 w-4" />
                        Course
                      </Label>
                      <Input
                        id="course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="Mathematics"
                        className="focus-visible:ring-2"
                        required
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create {userType === "student" ? "Student" : "Teacher"}{" "}
                      Account
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            resetForm();
          }}
          userType={userType}
          name={name}
          email={email}
          password={newUserPassword}
        />

        <FailureModal
          isOpen={isFailureModalOpen}
          onClose={() => {
            setIsFailureModalOpen(false);
          }}
          error={errorMessage}
        />
      </div>
    </AdminLayout>
  );
};

export default AddUserPage;