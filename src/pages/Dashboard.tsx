import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { quizzes, Quiz } from '@/data/quizData';
import QuizCard from '@/components/quiz/QuizCard';
import QuizScreen from '@/components/quiz/QuizScreen';
import QuizResult from '@/components/quiz/QuizResult';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import UniversityLeaderboard from '@/components/leaderboard/UniversityLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, BookOpen, Target, Play, Users, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type ViewState = 'dashboard' | 'quiz' | 'result';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentView('quiz');
  };

  const handleQuizFinish = (score: number, total: number) => {
    setQuizScore(score);
    setTotalQuestions(total);
    setCurrentView('result');
  };

  const handlePlayAgain = () => {
    setCurrentView('quiz');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedQuiz(null);
  };

  if (currentView === 'quiz' && selectedQuiz) {
    return (
      <QuizScreen
        quiz={selectedQuiz}
        onFinish={handleQuizFinish}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'result' && selectedQuiz) {
    return (
      <QuizResult
        score={quizScore}
        totalQuestions={totalQuestions}
        totalPoints={selectedQuiz.totalPoints}
        quizTitle={selectedQuiz.title}
        onPlayAgain={handlePlayAgain}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
              <Button variant="outline" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Bem-vindo, {user?.name}! 🎓
          </h1>
          <p className="text-lg text-muted-foreground">
            Aprenda brincando, evolua jogando!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-border shadow-card-academic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontuação Total</CardTitle>
              <Trophy className="h-4 w-4 text-academic-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{user?.score || 0}</div>
              <p className="text-xs text-muted-foreground">
                pontos acumulados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card-academic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Disponíveis</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{quizzes.length}</div>
              <p className="text-xs text-muted-foreground">
                prontos para jogar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card-academic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              <Target className="h-4 w-4 text-academic-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {Math.min(Math.round((user?.score || 0) / 100), 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                do seu objetivo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="quizzes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quizzes" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Ranking</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Escolha um Quiz</h2>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Continuar de onde parei
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStart={handleStartQuiz}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="grid gap-6 lg:grid-cols-2">
              <Leaderboard />
              <UniversityLeaderboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;