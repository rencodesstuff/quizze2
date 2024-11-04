// pages/joinquiz/index.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StudentLayout from "@/comps/student-layout";
import { createClient } from "../../../utils/supabase/component";
import { Camera, Loader } from "lucide-react";
import { Card, Title, Text } from "@tremor/react";
import Modal from "@/comps/Modal";
import dynamic from "next/dynamic";
import JoinQuizForm from "@/comps/JoinQuizForm";

// Dynamically import QR Scanner
const QRCodeScanner = dynamic(() => import("@/comps/QRCodeScanner"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-center mt-4">Loading camera...</p>
      </div>
    </div>
  ),
});

const JoinQuiz = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ name: "", studentId: "" });
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);
  const [isJoiningQuiz, setIsJoiningQuiz] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const supabase = createClient();

  // Fetch student information
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          const currentUrl = encodeURIComponent(window.location.pathname);
          router.push(`/signin?redirect=${currentUrl}`);
          return;
        }

        const { data: studentData, error } = await supabase
          .from("students")
          .select("name, student_id")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        setStudentInfo({
          name: studentData.name,
          studentId: studentData.student_id,
        });
      } catch (error) {
        console.error("Error fetching student info:", error);
        setErrorMessage(
          "Failed to load student information. Please try again or contact support."
        );
        setShowErrorModal(true);
      } finally {
        setIsLoadingStudent(false);
      }
    };

    fetchStudentInfo();
  }, []);

  const validateQuizCode = (code: string) => {
    if (!code) throw new Error("Please enter a quiz code");
    if (code.length !== 6)
      throw new Error("Quiz code must be 6 characters long");
    if (!/^[A-Z0-9]+$/.test(code))
      throw new Error("Quiz code can only contain letters and numbers");
  };

  const handleJoinQuiz = async (code: string) => {
    try {
      setIsJoiningQuiz(true);
      validateQuizCode(code.toUpperCase());

      // Check authentication
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      if (authError || !session) {
        const currentUrl = encodeURIComponent(window.location.pathname);
        router.push(`/signin?redirect=${currentUrl}`);
        return;
      }

      // Get quiz details
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("id, title, max_participants, release_date")
        .eq("code", code.toUpperCase())
        .single();

      if (quizError || !quiz) {
        throw new Error("Invalid quiz code or quiz not found");
      }

      // Check release date
      if (quiz.release_date) {
        const releaseDate = new Date(quiz.release_date);
        const now = new Date();
        if (releaseDate > now) {
          throw new Error(
            `This quiz is not available yet. It will be released on ${releaseDate.toLocaleString()}`
          );
        }
      }

      // Check if already joined
      const { data: existingJoin } = await supabase
        .from("student_quizzes")
        .select("id")
        .eq("student_id", session.user.id)
        .eq("quiz_id", quiz.id)
        .single();

      if (existingJoin) {
        setSuccessMessage(
          "You have already joined this quiz. Redirecting to quiz page..."
        );
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push(`/stdquiz/${quiz.id}`);
        }, 2000);
        return;
      }

      // Check participant limit
      if (quiz.max_participants) {
        const { count, error: countError } = await supabase
          .from("student_quizzes")
          .select("*", { count: "exact" })
          .eq("quiz_id", quiz.id);

        if (countError) throw countError;

        if (count && count >= quiz.max_participants) {
          throw new Error(
            "This quiz has reached its maximum number of participants"
          );
        }
      }

      // Join quiz
      const { error: joinError } = await supabase
        .from("student_quizzes")
        .insert([
          {
            student_id: session.user.id,
            quiz_id: quiz.id,
          },
        ]);

      if (joinError) throw joinError;

      setSuccessMessage("Successfully joined quiz! Redirecting...");
      setShowSuccessModal(true);
      setTimeout(() => {
        router.push(`/stdquiz/${quiz.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error joining quiz:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setShowErrorModal(true);
    } finally {
      setIsJoiningQuiz(false);
    }
  };

  const handleQRScan = async (scannedCode: string) => {
    try {
      setIsJoiningQuiz(true);
      let code = scannedCode.trim();

      // Try to extract code from URL
      try {
        if (code.includes("http")) {
          const url = new URL(scannedCode);
          const urlCode = url.searchParams.get("code");
          if (urlCode) {
            code = urlCode.trim();
          }
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }

      // Validate code format
      if (!code || code.length !== 6) {
        throw new Error(
          "Invalid QR code format. Code must be 6 characters long."
        );
      }

      await handleJoinQuiz(code);
      setShowScanner(false);
    } catch (error) {
      console.error("Error processing QR code:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Invalid QR code"
      );
      setShowErrorModal(true);
    } finally {
      setIsJoiningQuiz(false);
    }
  };


  const handleOpenScanner = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      try {
        // Try to get camera permission first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        stream.getTracks().forEach((track) => track.stop());
        setShowScanner(true);
      } catch (err) {
        // Show instructions if permission is denied
        setErrorMessage(
          "Camera Access Required\n\n" +
            "Please follow these steps:\n\n" +
            "1. Go to Settings\n" +
            "2. Scroll down to Safari\n" +
            "3. Tap on Camera\n" +
            "4. Select Allow\n" +
            "5. Return to this page\n" +
            "6. Try again"
        );
        setShowErrorModal(true);
      }
    } else {
      setShowScanner(true);
    }
  };

  if (isLoadingStudent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading student information...</p>
      </div>
    );
  }

  return (
    <StudentLayout
      studentName={studentInfo.name}
      studentId={studentInfo.studentId}
    >
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Title className="text-2xl sm:text-3xl font-bold text-gray-800">
            Join Quiz
          </Title>
          <Text className="text-gray-600 mt-2">
            Enter a quiz code or scan a QR code to join
          </Text>
        </div>

        {/* Join Quiz Section */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col gap-4">
              <JoinQuizForm
                onSubmit={handleJoinQuiz}
                isLoading={isJoiningQuiz}
              />

              <button
                onClick={handleOpenScanner}
                disabled={isJoiningQuiz}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoiningQuiz ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Scan QR Code
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Error Modal */}
        <Modal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error"
          message={errorMessage}
          isError
        />

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Success"
          message={successMessage}
        />

        {/* QR Scanner */}
        {showScanner && (
          <QRCodeScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default JoinQuiz;
