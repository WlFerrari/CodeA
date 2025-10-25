import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';

interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatarUrl?: string;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    api.getLeaderboard(10)
      .then((res) => {
        if (!cancelled) {
          const withRank = res.users.map((u, i) => ({ id: u.id, name: u.name, score: u.score, avatarUrl: u.avatarUrl, rank: u.rank ?? i + 1 }));
          setUsers(withRank);
        }
      })
      .catch(() => {
        // Fallback: localStorage
        const storedUsers = JSON.parse(localStorage.getItem('academic_users') || '[]');
        const sortedUsers: LeaderboardUser[] = storedUsers
          .filter((user: any) => user.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 10)
          .map((user: any, index: number) => ({
            id: user.id,
            name: user.name,
            score: user.score,
            rank: index + 1,
            avatarUrl: user.avatarUrl,
          }));
        if (!cancelled) setUsers(sortedUsers);
      });
    return () => { cancelled = true; };
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

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase();

  const getAvatarSizeClass = (rank: number) => {
    if (rank === 1) return 'h-16 w-16';
    if (rank === 2 || rank === 3) return 'h-12 w-12';
    return 'h-10 w-10';
  };

  const getAvatarRingClass = (rank: number) => {
    if (rank === 1) return 'ring-2 ring-[#D4AF37]'; // ouro
    if (rank === 2) return 'ring-2 ring-[#C0C0C0]'; // prata
    if (rank === 3) return 'ring-2 ring-[#CD7F32]'; // bronze
    return '';
  };

  const getContainerClasses = (rank: number) =>
    rank <= 3
      ? 'border-academic-gold/30 bg-academic-gold/5 shadow-md'
      : 'border-border bg-muted/30 hover:bg-muted/50';

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
              className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${getContainerClasses(user.rank)}`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(user.rank)}
                </div>
                <div className={`relative ${getAvatarSizeClass(user.rank)}`}>
                  <Avatar className={`h-full w-full ${getAvatarRingClass(user.rank)}`}>
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-xs font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {user.rank === 1 && (
                    <Crown className="absolute -top-2 -right-2 h-5 w-5 text-academic-gold drop-shadow" />
                  )}
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