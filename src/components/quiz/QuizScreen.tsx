import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Quiz, Question } from '@/data/quizData';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, Trophy, BookOpen } from 'lucide-react';

interface QuizScreenProps {
  quiz: Quiz;
  onFinish: (score: number, totalQuestions: number) => void;
  onBack: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ quiz, onFinish, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(quiz.questions.length).fill(false)
  );
  
  const { updateScore } = useAuth();
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnsweredQuestions);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalScore = selectedAnswer === currentQuestion.correctAnswer ? score + 1 : score;
      const pointsEarned = Math.round((finalScore / quiz.questions.length) * quiz.totalPoints);
      updateScore(pointsEarned);
      onFinish(finalScore, quiz.questions.length);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Voltar
        </Button>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{quiz.title}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{currentQuestionIndex + 1} de {quiz.questions.length}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="bg-gradient-card border-border shadow-academic">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full text-left p-4 border-2 transition-all duration-200 ";
              
              if (showFeedback) {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass += "border-academic-success bg-academic-success/10 text-academic-success";
                } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                  buttonClass += "border-destructive bg-destructive/10 text-destructive";
                } else {
                  buttonClass += "border-border bg-muted/30 text-muted-foreground";
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass += "border-primary bg-primary/10 text-primary";
                } else {
                  buttonClass += "border-border hover:border-primary/50 hover:bg-primary/5";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={buttonClass}
                  disabled={showFeedback}
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {showFeedback && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="ml-auto h-5 w-5 text-academic-success" />
                    )}
                    {showFeedback && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                      <XCircle className="ml-auto h-5 w-5 text-destructive" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && currentQuestion.explanation && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">Explicação:</h4>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            {!showFeedback ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Trophy className="h-4 w-4 text-academic-gold" />
          <span>Pontuação: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;