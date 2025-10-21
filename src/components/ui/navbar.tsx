import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Trophy, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

interface NavbarProps {
  onShowAuth: (type: 'login' | 'register') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onShowAuth }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b border-border shadow-card-academic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-12 md:h-16 md:w-16 object-contain"
              loading="lazy"
            />
            <span className="text-xl md:text-2xl font-bold text-foreground">Project Code Academic</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <Trophy className="h-4 w-4 text-academic-gold" />
                  <span className="font-medium text-foreground">{user.score} pontos</span>
                </div>
                <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{user.name}</span>
                </Link>
                <Link to="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Meu Perfil
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShowAuth('login')}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  onClick={() => onShowAuth('register')}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;