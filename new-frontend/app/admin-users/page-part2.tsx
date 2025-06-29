'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Eye } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type?: string;
}

interface Props {
  filteredUsers: User[];
  filters: { search: string; user_type: string };
  handleFilterChange: (key: keyof typeof filters, value: string) => void;
  getUserTypeBadge: (type: string) => JSX.Element;
}

interface Filters {
  search: string;
  user_type: string;
}


interface Props {
  filteredUsers: User[];
  filters: {
    search: string;
    user_type: string;
  };
  handleFilterChange: (key: string | number | symbol, value: string) => void;
  getUserTypeBadge: (type: string) => JSX.Element;
}

export default function AdminUsersPart2({ filteredUsers, filters, handleFilterChange, getUserTypeBadge }: Props) {
  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="w-5 h-5" />
            Usuários ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-slate-600">
                Tente ajustar os filtros para ver mais resultados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-medium text-slate-900">{user.full_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        {getUserTypeBadge(user.user_type || '')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`Visualizar ${user.full_name}`)}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
