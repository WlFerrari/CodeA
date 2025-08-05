import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  score: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
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
    const savedUser = localStorage.getItem('academic_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('academic_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        score: foundUser.score || 0
      };
      setUser(userSession);
      localStorage.setItem('academic_user', JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('academic_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return false; // Email already exists
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      score: 0
    };

    users.push(newUser);
    localStorage.setItem('academic_users', JSON.stringify(users));

    const userSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      score: newUser.score
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
      const updatedUser = { ...user, score: user.score + points };
      setUser(updatedUser);
      localStorage.setItem('academic_user', JSON.stringify(updatedUser));
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('academic_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].score = updatedUser.score;
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