'use client';

import { useState, useEffect } from 'react';
import { UserAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Select, SelectItem } from '../../components/ui/Select';
import { Users, Search, Filter, Eye } from 'lucide-react';

import type { User as ApiUser } from '../../lib/api';

interface User extends ApiUser {
  user_type?: string;
}

export default function AdminUsersPart1() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<{ search: string; user_type: string }>({
    search: '',
    user_type: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await UserAPI.list('-created_date', 500);
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users.filter(user => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = filters.user_type === 'all' || user.user_type === filters.user_type;

      return matchesSearch && matchesType;
    });

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getUserTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      customer: 'bg-green-500 hover:bg-green-600',
      business_owner: 'bg-blue-500 hover:bg-blue-600',
      admin: 'bg-purple-500 hover:bg-purple-600',
    };
    const labels: Record<string, string> = {
      customer: 'Cliente',
      business_owner: 'Proprietário',
      admin: 'Administrador',
    };
    return <Badge className={types[type] || 'bg-gray-400'}>{labels[type] || type}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return null; // Conteúdo principal será na próxima parte
}
