import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Trophy, Users } from 'lucide-react';

interface UniversityRanking {
  university: string;
  totalScore: number;
  userCount: number;
  averageScore: number;
  rank: number;
}

const UniversityLeaderboard: React.FC = () => {
  const [universityRankings, setUniversityRankings] = useState<UniversityRanking[]>([]);

  useEffect(() => {
    // Get users from localStorage and group by university
    const storedUsers = JSON.parse(localStorage.getItem('academic_users') || '[]');
    
    // Group users by university
    const universityData: { [key: string]: { totalScore: number; users: any[] } } = {};
    
    storedUsers.forEach((user: any) => {
      if (user.university && user.score > 0) {
        if (!universityData[user.university]) {
          universityData[user.university] = { totalScore: 0, users: [] };
        }
        universityData[user.university].totalScore += user.score;
        universityData[user.university].users.push(user);
      }
    });

    // Convert to array and calculate rankings
    const rankingData: UniversityRanking[] = Object.entries(universityData)
      .map(([university, data]) => ({
        university,
        totalScore: data.totalScore,
        userCount: data.users.length,
        averageScore: Math.round(data.totalScore / data.users.length),
        rank: 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    
    setUniversityRankings(rankingData);
  }, []);

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

  if (universityRankings.length === 0) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-academic-gold" />
            <span>Ranking por Faculdades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma faculdade no ranking ainda.</p>
            <p className="text-sm">Complete alguns quizzes para sua faculdade aparecer aqui!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border shadow-academic">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-academic-gold" />
          <span>Ranking por Faculdades</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {universityRankings.map((uni) => (
            <div
              key={uni.university}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                uni.rank <= 3
                  ? 'border-academic-gold/30 bg-academic-gold/5 shadow-md'
                  : 'border-border bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <GraduationCap className="h-5 w-5 text-academic-gold" />
                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                      {uni.university}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium text-foreground">{uni.totalScore}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Alunos:</span>
                      <span className="font-medium text-foreground">{uni.userCount}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground">Média:</span>
                      <span className="font-medium text-foreground">{uni.averageScore}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {getRankBadge(uni.rank)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            Sua faculdade pode subir no ranking! Complete mais quizzes! 🏆
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UniversityLeaderboard;