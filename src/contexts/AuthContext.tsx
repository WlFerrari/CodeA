import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  score: number;
  university: string;
  avatarUrl?: string;
  bannerUrl?: string;
  role: 'user' | 'admin';
}

// Representa o formato salvo em localStorage
interface StoredUser extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, university: string) => Promise<boolean>;
  logout: () => void;
  updateScore: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Normaliza usuários existentes e garante admin padrão
    const ADMIN_EMAIL = 'admin@gmail.com';
    const ADMIN_PASSWORD = '123456';

    let users: StoredUser[] = [];
    try {
      users = JSON.parse(localStorage.getItem('academic_users') || '[]');
      if (!Array.isArray(users)) users = [];
    } catch {
      users = [];
    }

    // Garante role para todos
    let changed = false;
    users = users.map((u) => {
      if (!u.role) {
        changed = true;
        return { ...u, role: 'user' } as StoredUser;
      }
      return u;
    });

    // Garante a existência do admin com email/senha configurados
    const adminIdx = users.findIndex((u) => u.email === ADMIN_EMAIL);
    if (adminIdx === -1) {
      users.push({
        id: 'admin-1',
        name: 'Administrador',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        score: 0,
        university: 'N/A',
        role: 'admin',
        avatarUrl: undefined,
        bannerUrl: undefined,
      });
      changed = true;
    } else {
      // Garante que é admin e atualiza a senha caso necessário
      const admin = users[adminIdx];
      const updated = {
        ...admin,
        role: 'admin',
        password: admin.password ?? ADMIN_PASSWORD,
      } as StoredUser;
      if (JSON.stringify(updated) !== JSON.stringify(admin)) {
        users[adminIdx] = updated;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem('academic_users', JSON.stringify(users));
    }

    const savedUserRaw = localStorage.getItem('academic_user');
    if (savedUserRaw) {
      const saved = JSON.parse(savedUserRaw);
      // Compatibilidade com sessões antigas sem role
      const session: User = {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        score: saved.score || 0,
        university: saved.university,
        avatarUrl: saved.avatarUrl,
        bannerUrl: saved.bannerUrl,
        role: saved.role === 'admin' ? 'admin' : 'user',
      };
      setUser(session);
      // Normaliza o storage
      localStorage.setItem('academic_user', JSON.stringify(session));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem('academic_users') || '[]');
    const foundUser = users.find((u) => u.email === email && u.password === password);

    if (foundUser) {
      const userSession: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        score: foundUser.score || 0,
        university: foundUser.university,
        avatarUrl: foundUser.avatarUrl,
        bannerUrl: foundUser.bannerUrl,
        role: foundUser.role || 'user',
      };
      setUser(userSession);
      localStorage.setItem('academic_user', JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, university: string): Promise<boolean> => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem('academic_users') || '[]');

    if (users.find((u) => u.email === email)) {
      return false; // Email já existe
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      score: 0,
      university,
      avatarUrl: undefined,
      bannerUrl: undefined,
      role: 'user',
    };

    users.push(newUser);
    localStorage.setItem('academic_users', JSON.stringify(users));

    const userSession: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      score: newUser.score,
      university: newUser.university,
      avatarUrl: newUser.avatarUrl,
      bannerUrl: newUser.bannerUrl,
      role: 'user',
    };
    setUser(userSession);
    localStorage.setItem('academic_user', JSON.stringify(userSession));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('academic_user');
  };

  const updateScore = (points: number) => {
    if (user) {
      const updatedUser: User = { ...user, score: user.score + points };
      setUser(updatedUser);
      localStorage.setItem('academic_user', JSON.stringify(updatedUser));
      
      // Atualiza no array de usuários
      const users: StoredUser[] = JSON.parse(localStorage.getItem('academic_users') || '[]');
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], score: updatedUser.score } as StoredUser;
        localStorage.setItem('academic_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateScore }}>
      {children}
    </AuthContext.Provider>
  );
};