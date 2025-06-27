
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Product } from "@/api/entities";
import { PriceUpdate } from "@/api/entities";
// ProductCostHistory import is no longer needed as cost history tab is removed
// import { ProductCostHistory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Button import is no longer needed as export button is removed
// import { Button } from "@/components/ui/button";
// Input import is no longer needed
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Tabs imports are no longer needed as tabs are removed
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, PRODUCT_CATEGORIES } from "@/components/lib";
import {
  // TrendingUp, // No longer used for analysis cards
  // TrendingDown, // No longer used
  // Package, // No longer used
  // Calendar, // No longer used
  // BarChart3, // No longer used
  // LineChart, // No longer used for analysis or cost history
  // AlertCircle, // No longer used
  // Info, // Not used previously
  // Download, // No longer used for export button
  Filter,
  History // New import for the History icon
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PriceHistory() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [products, setProducts] = useState([]);
  const [priceUpdates, setPriceUpdates] = useState([]);
  // costHistory state is no longer needed
  // const [costHistory, setCostHistory] = useState([]);
  
  // New filter states
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Old states no longer needed
  // const [selectedProduct, setSelectedProduct] = useState('all');
  // const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  const [isLoading, setIsLoading] = useState(true);
  
  // priceAnalysis state is no longer needed
  // const [priceAnalysis, setPriceAnalysis] = useState({
  //   totalUpdates: 0,
  //   averageInflation: 0,
  //   highestInflation: 0,
  //   productsWithIncreases: 0,
  //   recentUpdates: []
  // });
  const { toast } = useToast();

  useEffect(() => {
    loadPriceHistoryData();
  }, []);

  // This useEffect that calculated price analysis is no longer needed
  // useEffect(() => {
  //   if (products.length > 0 && priceUpdates.length > 0) {
  //     calculatePriceAnalysis();
  //   }
  // }, [products, priceUpdates, costHistory, selectedProduct, selectedPeriod]);

  const loadPriceHistoryData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.user_type !== 'business_owner') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        return;
      }

      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);
        
        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar os dados desta empresa.",
            variant: "destructive"
          });
          return;
        }
        
        setTeam(teamData);

        // Carregar dados em paralelo
        const [teamProducts, teamPriceUpdates] = await Promise.all([
          Product.filter({ team_id: teamData.id }),
          PriceUpdate.filter({ team_id: teamData.id }, '-created_date')
        ]);

        setProducts(teamProducts);
        setPriceUpdates(teamPriceUpdates);

        // Carregar histórico de custos is no longer needed
        // const allCostHistory = [];
        // for (const product of teamProducts) {
        //   const productCostHistory = await ProductCostHistory.filter({ 
        //     product_id: product.id 
        //   }, '-effective_date');
        //   allCostHistory.push(...productCostHistory);
        // }
        // setCostHistory(allCostHistory);

      } else {
        toast({
          title: "Nenhuma empresa associada",
          description: "Sua conta não está associada a nenhuma empresa.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de preços:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de preços.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // calculatePriceAnalysis function is no longer needed
  // const calculatePriceAnalysis = () => { /* ... */ };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto não encontrado';
  };

  // getCategoryLabel function is no longer needed
  // const getCategoryLabel = (category) => { /* ... */ };

  // calculateInflationRate function is no longer needed
  // const calculateInflationRate = (oldPrice, newPrice) => { /* ... */ };

  // getInflationBadgeColor function is no longer needed
  // const getInflationBadgeColor = (rate) => { /* ... */ };

  // exportPriceHistory function is no longer needed
  // const exportPriceHistory = () => { /* ... */ };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Aplicado</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredUpdates = useMemo(() => {
    let currentUpdates = priceUpdates;

    if (selectedProductFilter !== 'all') {
      currentUpdates = currentUpdates.filter(update => update.product_id === selectedProductFilter);
    }

    if (statusFilter !== 'all') {
      currentUpdates = currentUpdates.filter(update => update.status === statusFilter);
    }
    // Sort by effective_date descending
    return currentUpdates.sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date));
  }, [priceUpdates, selectedProductFilter, statusFilter]);

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

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Histórico de Preços</h1>
        <p className="text-slate-600">Acompanhe as atualizações de preços dos seus produtos.</p>
      </div>
      
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select onValueChange={setSelectedProductFilter} value={selectedProductFilter}>
                <SelectTrigger><SelectValue placeholder="Todos os Produtos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Produtos</SelectItem>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger><SelectValue placeholder="Todos os Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="applied">Aplicado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <History className="w-5 h-5" />
            Atualizações Agendadas e Passadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUpdates.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhuma atualização de preço encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço Antigo</TableHead>
                    <TableHead>Preço Novo</TableHead>
                    <TableHead>Data Efetiva</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUpdates.map(update => (
                    <TableRow key={update.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {getProductName(update.product_id)}
                      </TableCell>
                      <TableCell className="text-red-600">{formatCurrency(update.old_price)}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{formatCurrency(update.new_price)}</TableCell>
                      <TableCell>{format(new Date(update.effective_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(update.status)}</TableCell>
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
