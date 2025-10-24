import React, { useEffect, useState } from 'react';
import AdminRoute from '@/components/admin/AdminRoute';
import { getQuizzes, addQuiz, updateQuiz, deleteQuiz } from '@/lib/quizStore';
import { Quiz, Question } from '@/data/quizData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Save, Users as UsersIcon, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  university: string;
  score: number;
  role?: 'admin' | 'user';
}

const emptyQuestion = (): Question => ({
  id: `q-${Date.now()}`,
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  subject: '',
  difficulty: 'easy',
});

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Users list
  const [activeTab, setActiveTab] = useState<'quizzes' | 'users'>('quizzes');
  const [prevTab, setPrevTab] = useState<'quizzes' | 'users' | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Dialog state
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Editable fields for quiz
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [questions, setQuestions] = useState<Question[]>([]);

  const reload = () => {
    setQuizzes(getQuizzes());
    const storedUsers = JSON.parse(localStorage.getItem('academic_users') || '[]') as User[];
    // Deduplicate users to prevent "duplicate key" warnings
    const uniqueUsers = Array.from(new Map(storedUsers.map(user => [user.id, user])).values());
    setUsers(uniqueUsers);
  };

  useEffect(() => {
    reload();
  }, []);

  const openCreate = () => {
    setEditingQuiz(null);
    setTitle('');
    setSubject('');
    setDifficulty('easy');
    setQuestions([]);
    setIsQuizDialogOpen(true);
  };

  const openEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setSubject(quiz.subject);
    setDifficulty(quiz.difficulty);
    setQuestions(quiz.questions.map((q) => ({ ...q })));
    setIsQuizDialogOpen(true);
  };

  const resetDialog = () => {
    setIsQuizDialogOpen(false);
    setEditingQuiz(null);
    setQuestions([]);
  };

  const handleSaveQuiz = () => {
    const payload = {
      title: title.trim() || 'Sem título',
      subject: subject.trim() || 'Geral',
      difficulty,
      questions,
    };
    if (editingQuiz) {
      updateQuiz({ ...editingQuiz, ...payload });
    } else {
      addQuiz(payload);
    }
    resetDialog();
    reload();
  };

  const handleDeleteQuiz = (id: string) => {
    if (confirm('Excluir este quiz?')) {
      deleteQuiz(id);
      reload();
    }
  };

  const addNewQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (qid: string) => setQuestions((prev) => prev.filter((q) => q.id !== qid));

  const updateQuestionField = (qid: string, field: keyof Question, value: string | number) => {
    setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, [field]: value } : q)));
  };

  const updateQuestionOption = (qid: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qid ? { ...q, options: q.options.map((opt, i) => (i === idx ? value : opt)) } : q))
    );
  };

  const promoteToAdmin = (uid: string) => {
    const all: User[] = JSON.parse(localStorage.getItem('academic_users') || '[]');
    const idx = all.findIndex((u) => u.id === uid);
    if (idx !== -1) {
      all[idx] = { ...all[idx], role: 'admin' };
      localStorage.setItem('academic_users', JSON.stringify(all));
      reload();
    }
  };

  const demoteToUser = (uid: string) => {
    const all: User[] = JSON.parse(localStorage.getItem('academic_users') || '[]');
    const idx = all.findIndex((u) => u.id === uid);
    if (idx !== -1) {
      all[idx] = { ...all[idx], role: 'user' };
      localStorage.setItem('academic_users', JSON.stringify(all));
      reload();
    }
  };

  const deleteUser = (uid: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) {
      const all: User[] = JSON.parse(localStorage.getItem('academic_users') || '[]');
      const updatedUsers = all.filter((u) => u.id !== uid);
      localStorage.setItem('academic_users', JSON.stringify(updatedUsers));
      reload();
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (prevTab) {
                  setActiveTab(prevTab);
                  setPrevTab(null);
                } else {
                  navigate(-1);
                }
              }}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Painel do Administrador</h1>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setPrevTab(activeTab);
              setActiveTab(v as 'quizzes' | 'users');
            }}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="quizzes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Quizzes
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4" /> Usuários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quizzes" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Gerenciar Quizzes</h2>
                <Button onClick={openCreate} className="bg-gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" /> Novo Quiz
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((q) => (
                  <Card key={q.id} className="bg-gradient-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">{q.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-muted-foreground">{q.subject}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{q.difficulty}</Badge>
                        <Badge variant="secondary">{q.questions.length} questões</Badge>
                        <Badge variant="secondary">{q.totalPoints} pts</Badge>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(q)}>
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteQuiz(q.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Usuários Cadastrados</h2>
              <Card className="bg-gradient-card border-border">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {users.map((u) => (
                      <div key={u.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{u.name} ({u.email})</div>
                          <div className="text-sm text-muted-foreground">Faculdade: {u.university} • Pontos: {u.score} • Role: {u.role || 'user'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(u.role || 'user') === 'user' ? (
                            <Button size="sm" onClick={() => promoteToAdmin(u.id)}>Promover a Admin</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => demoteToUser(u.id)}>Rebaixar para User</Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog de criação/edição de Quiz */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Editar Quiz' : 'Novo Quiz'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do quiz" />
              </div>
              <div>
                <Label>Dificuldade</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Disciplina/Assunto</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Algoritmos" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Questões ({questions.length})</h3>
              <Button size="sm" variant="outline" onClick={addNewQuestion}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar Questão
              </Button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-auto pr-1">
              {questions.map((q) => (
                <Card key={q.id} className="border-border">
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Enunciado</Label>
                      <Button size="icon" variant="ghost" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input value={q.question} onChange={(e) => updateQuestionField(q.id, 'question', e.target.value)} placeholder="Digite a pergunta" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, idx) => (
                        <div key={idx}>
                          <Label className="text-xs">Opção {idx + 1}</Label>
                          <Input value={opt} onChange={(e) => updateQuestionOption(q.id, idx, e.target.value)} placeholder={`Opção ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Resposta correta (índice)</Label>
                        <Input type="number" min={0} max={q.options.length - 1} value={q.correctAnswer} onChange={(e) => updateQuestionField(q.id, 'correctAnswer', Number(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-xs">Assunto</Label>
                        <Input value={q.subject} onChange={(e) => updateQuestionField(q.id, 'subject', e.target.value)} placeholder="Ex: Algoritmos" />
                      </div>
                      <div>
                        <Label className="text-xs">Dificuldade</Label>
                        <Select value={q.difficulty} onValueChange={(v) => updateQuestionField(q.id, 'difficulty', v as 'easy' | 'medium' | 'hard')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Fácil</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="hard">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {questions.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhuma questão adicionada ainda.</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsQuizDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveQuiz}>
              <Save className="h-4 w-4 mr-1" /> Salvar Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminRoute>
  );
};

export default AdminPanel;
