import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AdminRouteComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <div className="p-6">Faça login.</div>;
  if (user.role !== 'admin') return <div className="p-6">Acesso negado.</div>;
  return <>{children}</>;
};

export default AdminRouteComponent;
export const AdminRoute = AdminRouteComponent;

