import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quiz } from '@/data/quizData';
import { BookOpen, Clock, Trophy, Star } from 'lucide-react';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quiz: Quiz) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-academic-success text-white';
    case 'medium':
      return 'bg-academic-gold text-academic-navy';
    case 'hard':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'Fácil';
    case 'medium':
      return 'Médio';
    case 'hard':
      return 'Difícil';
    default:
      return difficulty;
  }
};

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart }) => {
  return (
    <Card className="bg-gradient-card border-border hover:shadow-academic transition-all duration-300 hover:scale-105">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-foreground">{quiz.title}</CardTitle>
          </div>
          <Badge className={getDifficultyColor(quiz.difficulty)}>
            {getDifficultyLabel(quiz.difficulty)}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">{quiz.subject}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{quiz.questions.length} questões</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4 text-academic-gold" />
            <span>{quiz.totalPoints} pontos</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-academic-gold" />
          <span>~{quiz.questions.length * 2} minutos</span>
        </div>
        
        <Button
          onClick={() => onStart(quiz)}
          className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          Iniciar Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizCard;