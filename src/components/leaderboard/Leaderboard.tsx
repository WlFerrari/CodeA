import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    // Get users from localStorage and sort by score
    const storedUsers = JSON.parse(localStorage.getItem('academic_users') || '[]');
    const sortedUsers = storedUsers
      .filter((user: any) => user.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10)
      .map((user: any, index: number) => ({
        id: user.id,
        name: user.name,
        score: user.score,
        rank: index + 1
      }));
    
    setUsers(sortedUsers);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-academic-gold" />;
      case 2:
        return <Trophy className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Medal className="h-6 w-6 text-academic-gold" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-academic-gold text-academic-navy">1º Lugar</Badge>;
      case 2:
        return <Badge className="bg-muted text-muted-foreground">2º Lugar</Badge>;
      case 3:
        return <Badge className="bg-academic-gold/70 text-academic-navy">3º Lugar</Badge>;
      default:
        return <Badge variant="outline">{rank}º</Badge>;
    }
  };

  if (users.length === 0) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-academic-gold" />
            <span>Ranking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum usuário no ranking ainda.</p>
            <p className="text-sm">Complete alguns quizzes para aparecer aqui!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border shadow-academic">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-academic-gold" />
          <span>Ranking - Top 10</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                user.rank <= 3
                  ? 'border-academic-gold/30 bg-academic-gold/5 shadow-md'
                  : 'border-border bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(user.rank)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.score} pontos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getRankBadge(user.rank)}
              </div>
            </div>
          ))}
        </div>
        
        {users.length < 10 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Complete mais quizzes e suba no ranking! 🚀
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;