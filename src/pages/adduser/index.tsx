import React, { useState } from "react";
import AdminLayout from "@/comps/admin-layout";
import { createClient } from "@supabase/supabase-js";
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
} from "@/ui/dialog";
import { Badge } from "@/ui/badge";
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
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Password generator function remains the same
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
  id: string;
  password: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  userType,
  name,
  email,
  id,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            User Created Successfully
          </DialogTitle>
          <DialogDescription>
            New {userType} account has been created. Please save these
            credentials:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            {[
              { label: "Name", value: name, icon: User },
              { label: "Email", value: email, icon: Mail },
              { label: "ID", value: id, icon: IdCard },
              { label: "Temporary Password", value: password, icon: Copy },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {item.value}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className={copiedField === item.label ? "text-green-500" : ""}
                >
                  {copiedField === item.label ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          <Alert className="bg-yellow-100 border-yellow-200">
            {" "}
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Please make sure to save or share these credentials securely. The
              password cannot be retrieved later.
            </AlertDescription>
          </Alert>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddUserPage: React.FC = () => {
  // State declarations remain the same
  const [userType, setUserType] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [course, setCourse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState("");
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setEmail("");
    setId("");
    setCourse("");
    setNewUserPassword("");
  };

  // handleSubmit function remains the same
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Check if email already exists
      const { data: existingAuthUser, error: authCheckError } = await supabase
        .from("auth.users")
        .select("email")
        .eq("email", email)
        .single();

      if (authCheckError && authCheckError.code !== "PGRST116") {
        throw authCheckError;
      }

      if (existingAuthUser) {
        throw new Error("A user with this email already exists");
      }

      // Check if ID already exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from(userType === "student" ? "students" : "teachers")
        .select("id")
        .eq(userType === "student" ? "student_id" : "id", id)
        .single();

      if (userCheckError && userCheckError.code !== "PGRST116") {
        throw userCheckError;
      }

      if (existingUser) {
        throw new Error(`A ${userType} with this ID already exists`);
      }

      // Generate password and create auth user
      const password = generateRandomPassword();
      setNewUserPassword(password);

      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userType,
          },
        },
      });

      if (authError) throw authError;
      if (!authUser.user) throw new Error("Failed to create user account");

      const userId = authUser.user.id;

      // Add user details to the appropriate table
      if (userType === "student") {
        const { error: studentError } = await supabase.from("students").insert({
          id: userId,
          name,
          student_id: id,
          email,
        });

        if (studentError) throw studentError;
      } else {
        const { error: teacherError } = await supabase.from("teachers").insert({
          id: userId,
          name,
          email,
          course,
        });

        if (teacherError) throw teacherError;
      }

      // Add user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        id: userId,
        role: userType,
      });

      if (roleError) throw roleError;

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
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create user. Please try again.",
        duration: 5000,
      });
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
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="student"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger
                  value="teacher"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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

                  <div className="grid gap-2">
                    <Label htmlFor="id" className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      {userType === "student" ? "Student ID" : "Teacher ID"}
                    </Label>
                    <Input
                      id="id"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder={userType === "student" ? "S12345" : "T67890"}
                      className="focus-visible:ring-2"
                      required
                    />
                  </div>

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
                      Create {userType === "student"
                        ? "Student"
                        : "Teacher"}{" "}
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
          id={id}
          password={newUserPassword}
        />
      </div>
    </AdminLayout>
  );
};

export default AddUserPage;
