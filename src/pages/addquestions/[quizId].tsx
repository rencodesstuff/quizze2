import { useRouter } from 'next/router';
import AddQuestions from './index'; // Import your existing AddQuestions component

const AddQuestionsPage = () => {
  const router = useRouter();
  const { quizId } = router.query;

  // Ensure quizId is available before rendering AddQuestions
  if (!quizId) {
    return <div>Loading...</div>;
  }

  return <AddQuestions />;
};

export default AddQuestionsPage;