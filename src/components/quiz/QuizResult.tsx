import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, BookOpen, Target, TrendingUp } from 'lucide-react';

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  totalPoints: number;
  quizTitle: string;
  onPlayAgain: () => void;
  onBackToDashboard: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  score,
  totalQuestions,
  totalPoints,
  quizTitle,
  onPlayAgain,
  onBackToDashboard
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const pointsEarned = Math.round((score / totalQuestions) * totalPoints);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Excelente! 🎉", color: "text-academic-success" };
    if (percentage >= 70) return { message: "Muito bem! 👏", color: "text-academic-gold" };
    if (percentage >= 50) return { message: "Bom trabalho! 👍", color: "text-primary" };
    return { message: "Continue praticando! 💪", color: "text-muted-foreground" };
  };

  const getRecommendations = () => {
    if (percentage < 70) {
      return [
        "Revise os conceitos fundamentais",
        "Pratique mais exercícios similares",
        "Considere estudar o material novamente"
      ];
    } else if (percentage < 90) {
      return [
        "Você está indo bem!",
        "Tente quizzes mais desafiadores",
        "Revise apenas os tópicos em que errou"
      ];
    } else {
      return [
        "Parabéns pelo excelente desempenho!",
        "Experimente quizzes de nível avançado",
        "Compartilhe seu conhecimento com outros"
      ];
    }
  };

  const performance = getPerformanceMessage();
  const recommendations = getRecommendations();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card className="bg-gradient-card border-border shadow-academic">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-full">
              <Trophy className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Quiz Finalizado!
          </CardTitle>
          <p className="text-muted-foreground">{quizTitle}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Score Overview */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-foreground">{score}/{totalQuestions}</h3>
              <p className={`text-xl font-semibold ${performance.color}`}>
                {percentage}% {performance.message}
              </p>
            </div>
            
            <Progress value={percentage} className="h-3" />
            
            <div className="flex justify-center items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Acertos: <span className="font-medium text-foreground">{score}</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-academic-gold" />
                <span className="text-muted-foreground">
                  Pontos: <span className="font-medium text-foreground">{pointsEarned}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Sugestões para melhorar:</h4>
            </div>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onPlayAgain}
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Jogar Novamente
            </Button>
            <Button
              onClick={onBackToDashboard}
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResult;