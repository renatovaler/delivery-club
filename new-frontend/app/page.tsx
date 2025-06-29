'use client';

import { useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';

interface Team {
  id: string;
  name: string;
  category: string;
}

export default function HomePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await apiClient.get('/teams');
        setTeams(response.data);
      } catch (err) {
        setError('Erro ao carregar equipes');
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  if (loading) return <p>Carregando equipes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Equipes</h1>
      <ul className="space-y-2">
        {teams.map((team) => (
          <li key={team.id} className="rounded border p-4 shadow-sm transition hover:shadow-md">
            <h2 className="text-xl font-semibold">{team.name}</h2>
            <p className="text-gray-600">Categoria: {team.category}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
