import { useRouter } from 'next/router';

const QuestionTypePage = () => {
  const router = useRouter();
  const { type } = router.query;

  const renderQuestionType = () => {
    switch (type) {
      case 'multiple-choice':
        return <div>Multiple Choice Question</div>;
      case 'true-false':
        return <div>True/False Question</div>;
      case 'short-answer':
        return <div>Short Answer Question</div>;
      default:
        return <div>Invalid Question Type</div>;
    }
  };

  return (
    <div>
      <h1>Question Type: {type}</h1>
      {renderQuestionType()}
    </div>
  );
};

export default QuestionTypePage;
