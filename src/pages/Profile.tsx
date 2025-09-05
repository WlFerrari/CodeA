import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Trophy, GraduationCap } from 'lucide-react';
import { universities } from '@/data/universities';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  if (!user) {
    navigate('/');
    return null;
  }

  const university = universities.find(u => u.name === user.university);
  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSave = () => {
    if (editedName.trim()) {
      // Update user data in localStorage
      const users = JSON.parse(localStorage.getItem('academic_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].name = editedName.trim();
        localStorage.setItem('academic_users', JSON.stringify(users));
        
        const updatedUser = { ...user, name: editedName.trim() };
        localStorage.setItem('academic_user', JSON.stringify(updatedUser));
        
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });
        
        setIsEditing(false);
        // Force page reload to update context
        window.location.reload();
      }
    }
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setIsEditing(false);
  };

  const getScoreLevel = (score: number) => {
    if (score >= 1000) return { level: 'Expert', color: 'bg-gradient-to-r from-academic-primary to-academic-accent' };
    if (score >= 500) return { level: 'Avançado', color: 'bg-gradient-to-r from-academic-secondary to-academic-primary' };
    if (score >= 200) return { level: 'Intermediário', color: 'bg-gradient-to-r from-academic-accent to-academic-secondary' };
    return { level: 'Iniciante', color: 'bg-gradient-to-r from-muted to-academic-accent' };
  };

  const scoreLevel = getScoreLevel(user.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-academic-soft to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-academic-primary to-academic-secondary text-white border-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white/20">
                  <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                          placeholder="Seu nome"
                        />
                        <Button size="icon" variant="ghost" onClick={handleSave}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={handleCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      <span>{university?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      <span>{user.score} pontos</span>
                    </div>
                  </div>

                  <Badge className={`mt-3 ${scoreLevel.color} text-white border-0`}>
                    {scoreLevel.level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-academic-primary" />
                  Informações Acadêmicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-foreground">{user.email}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Universidade</Label>
                  <p className="text-foreground">{university?.name}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Domínio Institucional</Label>
                  <p className="text-foreground">{university?.domain}</p>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-academic-accent" />
                  Estatísticas de Desempenho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-academic-soft rounded-lg">
                    <div className="text-2xl font-bold text-academic-primary">{user.score}</div>
                    <div className="text-sm text-muted-foreground">Pontos Totais</div>
                  </div>
                  
                  <div className="text-center p-4 bg-academic-soft rounded-lg">
                    <div className="text-2xl font-bold text-academic-secondary">{scoreLevel.level}</div>
                    <div className="text-sm text-muted-foreground">Nível Atual</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Progresso para o próximo nível</Label>
                  <div className="mt-2">
                    {user.score < 200 ? (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Iniciante</span>
                          <span>{user.score}/200</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-academic-accent to-academic-secondary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(user.score / 200) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : user.score < 500 ? (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Intermediário</span>
                          <span>{user.score}/500</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-academic-secondary to-academic-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(user.score / 500) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : user.score < 1000 ? (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Avançado</span>
                          <span>{user.score}/1000</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-academic-primary to-academic-accent h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(user.score / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Badge className="bg-gradient-to-r from-academic-primary to-academic-accent text-white">
                          Nível Máximo Alcançado! 🎉
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-foreground">Configurações da Conta</h3>
                  <p className="text-sm text-muted-foreground">Gerencie suas preferências e configurações</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Sair da Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;