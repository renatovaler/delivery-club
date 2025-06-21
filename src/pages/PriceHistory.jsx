import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Product } from "@/api/entities";
import { PriceUpdate } from "@/api/entities";
import { ProductCostHistory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, PRODUCT_CATEGORIES } from "@/components/lib";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  BarChart3,
  LineChart,
  AlertCircle,
  Info,
  Download,
  Filter
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PriceHistory() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [products, setProducts] = useState([]);
  const [priceUpdates, setPriceUpdates] = useState([]);
  const [costHistory, setCostHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [priceAnalysis, setPriceAnalysis] = useState({
    totalUpdates: 0,
    averageInflation: 0,
    highestInflation: 0,
    productsWithIncreases: 0,
    recentUpdates: []
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPriceHistoryData();
  }, []);

  useEffect(() => {
    if (products.length > 0 && priceUpdates.length > 0) {
      calculatePriceAnalysis();
    }
  }, [products, priceUpdates, costHistory, selectedProduct, selectedPeriod]);

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

        // Carregar histórico de custos
        const allCostHistory = [];
        for (const product of teamProducts) {
          const productCostHistory = await ProductCostHistory.filter({ 
            product_id: product.id 
          }, '-effective_date');
          allCostHistory.push(...productCostHistory);
        }
        setCostHistory(allCostHistory);

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

  const calculatePriceAnalysis = () => {
    let filteredUpdates = priceUpdates;

    // Filtrar por produto
    if (selectedProduct !== 'all') {
      filteredUpdates = filteredUpdates.filter(update => update.product_id === selectedProduct);
    }

    // Filtrar por período
    if (selectedPeriod !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (selectedPeriod) {
        case '30days':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '6months':
          cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }

      if (cutoffDate) {
        filteredUpdates = filteredUpdates.filter(update => 
          new Date(update.effective_date) >= cutoffDate
        );
      }
    }

    // Calcular análises
    const totalUpdates = filteredUpdates.length;
    let totalInflationRate = 0;
    let highestInflation = 0;
    let productsWithIncreases = 0;
    const productInflationRates = {};

    filteredUpdates.forEach(update => {
      const oldPrice = parseFloat(update.old_price) || 0;
      const newPrice = parseFloat(update.new_price) || 0;
      
      if (oldPrice > 0) {
        const inflationRate = ((newPrice - oldPrice) / oldPrice) * 100;
        totalInflationRate += inflationRate;
        
        if (inflationRate > highestInflation) {
          highestInflation = inflationRate;
        }
        
        if (inflationRate > 0) {
          productsWithIncreases++;
        }

        // Agrupar por produto para análise mais detalhada
        if (!productInflationRates[update.product_id]) {
          productInflationRates[update.product_id] = [];
        }
        productInflationRates[update.product_id].push(inflationRate);
      }
    });

    const averageInflation = totalUpdates > 0 ? totalInflationRate / totalUpdates : 0;
    const recentUpdates = filteredUpdates.slice(0, 5);

    setPriceAnalysis({
      totalUpdates,
      averageInflation,
      highestInflation,
      productsWithIncreases,
      recentUpdates,
      productInflationRates
    });
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto não encontrado';
  };

  const getCategoryLabel = (category) => {
    return PRODUCT_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const calculateInflationRate = (oldPrice, newPrice) => {
    if (!oldPrice || oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };

  const getInflationBadgeColor = (rate) => {
    if (rate > 20) return "bg-red-500 hover:bg-red-600";
    if (rate > 10) return "bg-orange-500 hover:bg-orange-600";
    if (rate > 5) return "bg-yellow-500 hover:bg-yellow-600";
    if (rate > 0) return "bg-green-500 hover:bg-green-600";
    return "bg-blue-500 hover:bg-blue-600";
  };

  const exportPriceHistory = () => {
    const reportData = [
      [`Histórico de Preços - ${team?.name || 'Sua Empresa'}`],
      [`Relatório gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
      [''],
      ['=== RESUMO GERAL ==='],
      ['Total de Atualizações de Preço', priceAnalysis.totalUpdates],
      ['Inflação Média (%)', priceAnalysis.averageInflation.toFixed(2)],
      ['Maior Inflação Registrada (%)', priceAnalysis.highestInflation.toFixed(2)],
      ['Produtos com Aumentos', priceAnalysis.productsWithIncreases],
      [''],
      ['=== HISTÓRICO DETALHADO ==='],
      ['Data Efetiva', 'Produto', 'Preço Anterior (R$)', 'Novo Preço (R$)', 'Inflação (%)', 'Motivo', 'Status'],
      ...priceUpdates.map(update => [
        format(new Date(update.effective_date), 'dd/MM/yyyy'),
        getProductName(update.product_id),
        update.old_price.toFixed(2).replace('.', ','),
        update.new_price.toFixed(2).replace('.', ','),
        calculateInflationRate(update.old_price, update.new_price).toFixed(2),
        update.reason || 'Não informado',
        update.status === 'applied' ? 'Aplicado' : update.status === 'pending' ? 'Pendente' : 'Cancelado'
      ])
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_precos_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-amber-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Histórico de Preços</h1>
          <p className="text-amber-600">Acompanhe a evolução dos preços e análise de inflação dos seus produtos</p>
        </div>
        <Button onClick={exportPriceHistory} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Produtos</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo o Período</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="90days">Últimos 90 dias</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BarChart3 className="w-5 h-5" />
              Total de Atualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">{priceAnalysis.totalUpdates}</p>
            <p className="text-sm text-gray-500 mt-2">Mudanças de preço registradas</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="w-5 h-5" />
              Inflação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {priceAnalysis.averageInflation.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Taxa média de aumento</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              Maior Inflação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-700">
              {priceAnalysis.highestInflation.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Maior aumento registrado</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Package className="w-5 h-5" />
              Produtos com Aumentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700">{priceAnalysis.productsWithIncreases}</p>
            <p className="text-sm text-gray-500 mt-2">De {priceAnalysis.totalUpdates} atualizações</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas Detalhadas */}
      <Tabs defaultValue="price-updates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="price-updates" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Atualizações de Preço
          </TabsTrigger>
          <TabsTrigger value="cost-history" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Histórico de Custos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="price-updates" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico de Atualizações de Preço
              </CardTitle>
            </CardHeader>
            <CardContent>
              {priceUpdates.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">
                    Nenhuma atualização de preço registrada
                  </h3>
                  <p className="text-amber-600">
                    As atualizações de preços aparecerão aqui quando você alterar os preços dos produtos.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Efetiva</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço Anterior</TableHead>
                        <TableHead>Novo Preço</TableHead>
                        <TableHead>Inflação</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceUpdates.map((update) => {
                        const inflationRate = calculateInflationRate(update.old_price, update.new_price);
                        
                        return (
                          <TableRow key={update.id}>
                            <TableCell>
                              {format(new Date(update.effective_date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {getProductName(update.product_id)}
                            </TableCell>
                            <TableCell>{formatCurrency(update.old_price)}</TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(update.new_price)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getInflationBadgeColor(inflationRate)}>
                                {inflationRate > 0 ? '+' : ''}{inflationRate.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600 max-w-xs truncate block" title={update.reason}>
                                {update.reason || 'Não informado'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                update.status === 'applied' ? 'default' : 
                                update.status === 'pending' ? 'secondary' : 
                                'destructive'
                              }>
                                {update.status === 'applied' ? 'Aplicado' : 
                                 update.status === 'pending' ? 'Pendente' : 
                                 'Cancelado'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-history" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Histórico de Custos dos Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costHistory.length === 0 ? (
                <div className="text-center py-12">
                  <LineChart className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">
                    Nenhum histórico de custo encontrado
                  </h3>
                  <p className="text-amber-600">
                    O histórico de custos dos produtos aparecerá aqui quando você alterar os custos.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Efetiva</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Custo por Unidade</TableHead>
                        <TableHead>Variação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costHistory.map((cost, index) => {
                        const product = products.find(p => p.id === cost.product_id);
                        // Calcular variação em relação ao custo anterior do mesmo produto
                        const previousCost = costHistory
                          .filter(c => c.product_id === cost.product_id)
                          .find((c, i, arr) => new Date(c.effective_date) < new Date(cost.effective_date));
                        
                        let variation = null;
                        if (previousCost) {
                          variation = ((cost.cost_per_unit - previousCost.cost_per_unit) / previousCost.cost_per_unit) * 100;
                        }
                        
                        return (
                          <TableRow key={`${cost.product_id}-${cost.effective_date}-${index}`}>
                            <TableCell>
                              {format(new Date(cost.effective_date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {product?.name || 'Produto não encontrado'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(cost.cost_per_unit)}
                            </TableCell>
                            <TableCell>
                              {variation !== null ? (
                                <Badge className={variation > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>
                                  {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}