
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { PlatformReport } from "@/api/entities";
import { Team } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  ShieldAlert,
  History,
  Loader2,
  Send,
  Upload,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UploadFile } from "@/api/integrations";

export default function PlatformReports() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [teams, setTeams] = useState({});
  const [subscriptions, setSubscriptions] = useState([]); // Kept for potential future use or context
  const [isLoading, setIsLoading] = useState(true);
  // isNewReportModalOpen state is removed as the new report form is no longer a modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [newReportData, setNewReportData] = useState({
    reported_team_id: "",
    category: "",
    severity: "medium",
    title: "",
    description: "",
    evidence_urls: []
  });

  const { toast } = useToast();

  const REPORT_CATEGORIES = [
    { value: "fraud", label: "Fraude", icon: "🚨" },
    { value: "poor_service", label: "Serviço Inadequado", icon: "👎" },
    { value: "product_quality", label: "Qualidade do Produto", icon: "📦" },
    { value: "delivery_issues", label: "Problemas de Entrega", icon: "🚚" },
    { value: "overcharging", label: "Cobrança Indevida", icon: "💰" },
    { value: "harassment", label: "Assédio/Tratamento Inadequado", icon: "⚠️" },
    { value: "spam", label: "Spam/Publicidade Indevida", icon: "📧" },
    { value: "other", label: "Outros", icon: "❓" }
  ];

  const SEVERITY_OPTIONS = [
    { value: "low", label: "Baixa", color: "bg-gray-500", description: "Problema menor, sem urgência" },
    { value: "medium", label: "Média", color: "bg-blue-500", description: "Problema que precisa de atenção" },
    { value: "high", label: "Alta", color: "bg-orange-500", description: "Problema sério que afeta múltiplos usuários" },
    { value: "critical", label: "Crítica", color: "bg-red-500", description: "Problema grave que requer ação imediata" }
  ];

  const STATUS_OPTIONS = [
    { value: "pending", label: "Pendente", color: "bg-yellow-500" },
    { value: "investigating", label: "Investigando", color: "bg-blue-500" },
    { value: "resolved", label: "Resolvido", color: "bg-green-500" },
    { value: "dismissed", label: "Arquivado", color: "bg-gray-500" }
  ];

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const userReports = await PlatformReport.filter(
        { reporter_id: userData.id },
        '-created_date'
      );
      setReports(userReports);

      const userSubscriptions = await Subscription.filter(
        { customer_id: userData.id },
        '-created_date'
      );
      setSubscriptions(userSubscriptions);

      // Load teams related to the user's reports
      const teamIds = [...new Set([
        ...userReports.map(r => r.reported_team_id).filter(Boolean),
      ])];
      
      const teamsData = await Promise.all(
        teamIds.map(id => Team.get(id).catch(() => null))
      );
      const teamsMap = teamsData.reduce((acc, team) => {
        if (team) acc[team.id] = team;
        return acc;
      }, {});
      setTeams(teamsMap);

    } catch (error) {
      console.error("Erro ao carregar dados de denúncias:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
    
    if (file.size > maxSize) {
      toast({ title: "Arquivo muito grande", description: "O arquivo deve ter no máximo 10MB.", variant: "destructive" });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Tipo de arquivo inválido", description: "Apenas imagens (JPEG, PNG, WEBP), PDF e TXT são permitidos.", variant: "destructive" });
      return;
    }

    setUploadingFile(true);
    try {
      const { file_url } = await UploadFile({ file });
      setNewReportData(prev => ({
        ...prev,
        evidence_urls: [...prev.evidence_urls, file_url]
      }));
      toast({ title: "Arquivo enviado! ✅" });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!newReportData.title.trim() || !newReportData.description.trim() || !newReportData.category) {
      toast({ title: "Campos obrigatórios", description: "Preencha categoria, título e descrição.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData = {
        ...newReportData,
        reporter_id: user.id,
        reported_team_id: newReportData.reported_team_id || null
      };

      await PlatformReport.create(reportData);
      
      toast({ 
        title: "Denúncia registrada! ✅", 
        description: "Sua denúncia foi enviada aos administradores. Você receberá atualizações sobre a investigação." 
      });
      
      setNewReportData({
        reported_team_id: "",
        category: "",
        severity: "medium",
        title: "",
        description: "",
        evidence_urls: []
      });
      
      await loadReportsData();
    } catch (error) {
      console.error("Erro ao criar denúncia:", error);
      toast({ title: "Erro ao registrar denúncia", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeEvidence = (index) => {
    setNewReportData(prev => ({
      ...prev,
      evidence_urls: prev.evidence_urls.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={`${statusInfo?.color || 'bg-gray-500'} text-white`}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityInfo = SEVERITY_OPTIONS.find(s => s.value === severity);
    return (
      <Badge className={`${severityInfo?.color || 'bg-gray-500'} text-white`}>
        {severityInfo?.label || severity}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 md:p-8 space-y-8">
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Denúncias na Plataforma</h1>
        <p className="text-slate-600">Relate problemas ou comportamentos inadequados para nossa equipe de moderação.</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <ShieldAlert className="w-5 h-5" />
            Nova Denúncia
          </CardTitle>
          <CardDescription>Use este formulário para enviar uma nova denúncia. Seja o mais detalhado possível.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-full">
                <Label>Empresa Relacionada (Opcional)</Label>
                <Select value={newReportData.reported_team_id} onValueChange={(value) => setNewReportData(prev => ({ ...prev, reported_team_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa (se aplicável)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Nenhuma empresa específica</SelectItem>
                    {Object.values(teams).map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria da Denúncia *</Label>
                <Select value={newReportData.category} onValueChange={(value) => setNewReportData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gravidade</Label>
                <Select value={newReportData.severity} onValueChange={(value) => setNewReportData(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map(severity => (
                      <SelectItem key={severity.value} value={severity.value}>
                        <div className="flex flex-col">
                          <span>{severity.label}</span>
                          <span className="text-xs text-gray-500">{severity.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-full">
                <Label>Título da Denúncia *</Label>
                <Input
                  value={newReportData.title}
                  onChange={(e) => setNewReportData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Descreva brevemente o problema"
                />
              </div>

              <div className="space-y-2 col-span-full">
                <Label>Descrição Detalhada *</Label>
                <Textarea
                  value={newReportData.description}
                  onChange={(e) => setNewReportData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o problema com o máximo de detalhes possível. Inclua datas, horários e qualquer informação relevante."
                  rows={6}
                />
              </div>

              <div className="space-y-2 col-span-full">
                <Label>Evidências (Opcional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.txt"
                    className="hidden"
                    id="evidence-upload"
                    disabled={uploadingFile}
                  />
                  <label
                    htmlFor="evidence-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {uploadingFile ? "Enviando..." : "Clique para enviar evidências"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Imagens, PDF ou TXT (máx. 10MB)
                    </span>
                  </label>
                </div>

                {newReportData.evidence_urls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Arquivos anexados:</p>
                    {newReportData.evidence_urls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">Evidência {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvidence(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-slate-800 hover:bg-slate-900 text-white">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar Denúncia
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <History className="w-5 h-5" />
            Minhas Denúncias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-slate-500">Carregando denúncias...</p>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 bg-slate-50 border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900">{report.title}</h4>
                      <p className="text-sm text-slate-600">
                        Empresa: {teams[report.reported_team_id]?.name || 'N/A'}
                      </p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                  <Separator className="my-3" />
                  <p className="text-sm text-slate-700">{report.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500">Você não fez nenhuma denúncia ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
