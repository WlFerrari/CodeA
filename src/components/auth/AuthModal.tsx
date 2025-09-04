import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { universities, University } from '@/data/universities';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setEmail('');
    setEmailPrefix('');
    setPassword('');
    setName('');
    setSelectedUniversity(null);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;
      let fullEmail = email;
      
      
      if (mode === 'register' && selectedUniversity) {
        fullEmail = `${emailPrefix}@${selectedUniversity.domain}`;
      }
      
      if (mode === 'login') {
        success = await login(fullEmail, password);
        if (!success) {
          toast({
            title: "Erro no login",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
        }
      } else {
        if (!name.trim()) {
          toast({
            title: "Campo obrigatório",
            description: "Por favor, insira seu nome.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (!selectedUniversity) {
          toast({
            title: "Campo obrigatório",
            description: "Por favor, selecione sua faculdade.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        if (!emailPrefix.trim()) {
          toast({
            title: "Campo obrigatório",
            description: "Por favor, insira seu email institucional.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        success = await register(name, fullEmail, password, selectedUniversity.name);
        if (!success) {
          toast({
            title: "Erro no cadastro",
            description: "Este email já está em uso.",
            variant: "destructive",
          });
        }
      }

      if (success) {
        toast({
          title: mode === 'login' ? "Login realizado!" : "Cadastro realizado!",
          description: `Bem-vindo${mode === 'register' ? ' ao' : ' de volta ao'} Project Code Academic!`,
        });
        handleClose();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Fazer Login' : 'Criar Conta'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>
          )}
          
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="university" className="text-foreground">Faculdade</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                <Select value={selectedUniversity?.name || ''} onValueChange={(value) => {
                  const university = universities.find(u => u.name === value);
                  setSelectedUniversity(university || null);
                  setEmailPrefix('');
                }} required>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecione sua faculdade" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.name} value={uni.name}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email {mode === 'register' ? 'Institucional' : ''}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              {mode === 'register' && selectedUniversity ? (
                <div className="flex">
                  <Input
                    id="emailPrefix"
                    type="text"
                    value={emailPrefix}
                    onChange={(e) => setEmailPrefix(e.target.value)}
                    className="pl-10 rounded-r-none border-r-0"
                    placeholder="seu.nome"
                    required
                  />
                  <div className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm flex items-center">
                    @{selectedUniversity.domain}
                  </div>
                </div>
              ) : (
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  required
                />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                placeholder="Sua senha"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
          </Button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            {' '}
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              className="text-primary hover:underline font-medium"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;