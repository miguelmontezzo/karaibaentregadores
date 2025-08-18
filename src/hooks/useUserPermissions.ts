import { useState, useEffect } from 'react';

interface User {
  id: number;
  usuario: string;
  senha: string;
  cargo: string;
  nome: string;
  created_at: string;
}

export const useUserPermissions = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("karaiba_user");
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
        setIsAdmin(userData.cargo === 'admin');
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        setUser(null);
        setIsAdmin(false);
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    
    setLoading(false);
  }, []);

  return {
    user,
    isAdmin,
    loading,
    userCargo: user?.cargo || null,
    userName: user?.nome || user?.usuario || null,
  };
};