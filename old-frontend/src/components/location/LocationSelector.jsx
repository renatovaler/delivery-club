import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { DeliveryArea } from '@/api/entities';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Loader2 } from 'lucide-react';
import { BRAZILIAN_STATES } from '@/components/lib';

export default function LocationSelector({ user, reloadUser, triggerClassName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(user?.default_location?.state || '');
  const [selectedCity, setSelectedCity] = useState(user?.default_location?.city || '');
  const [availableCities, setAvailableCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // NOVO: Abrir automaticamente se não há localização definida
  useEffect(() => {
    if (!user?.default_location?.state || !user?.default_location?.city) {
      setIsOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (selectedState) {
      loadCitiesForState(selectedState);
    } else {
      setAvailableCities([]);
    }
  }, [selectedState]);

  const loadCitiesForState = async (state) => {
    setIsLoading(true);
    try {
      const areasInState = await DeliveryArea.filter({ state: state, status: 'active' });
      const cities = [...new Set(areasInState.map(area => area.city))].sort();
      setAvailableCities(cities);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      toast({ title: "Erro ao buscar cidades", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity('');
  };

  const handleSaveLocation = async () => {
    if (!selectedState || !selectedCity) {
      toast({ title: "Seleção incompleta", description: "Por favor, selecione um estado e uma cidade.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        default_location: {
          state: selectedState,
          city: selectedCity,
        },
      });
      toast({ title: "Localização salva!", description: `Sua localização padrão foi definida para ${selectedCity}, ${selectedState}.` });
      await reloadUser();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao salvar localização:", error);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const locationText = user?.default_location?.city
    ? `${user.default_location.city}, ${user.default_location.state}`
    : "Definir Localização";

  // MODIFICADO: Não permitir fechar se não há localização definida
  const canClose = user?.default_location?.state && user?.default_location?.city;

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? setIsOpen : undefined}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 ${triggerClassName}`}>
          <MapPin className="w-4 h-4" />
          <span className="truncate">{locationText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={canClose ? undefined : (e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {canClose ? "Alterar Localização Padrão" : "Defina sua Localização"}
          </DialogTitle>
          <DialogDescription>
            {canClose 
              ? "Selecione seu estado e cidade para encontrar serviços e produtos perto de você."
              : "Para usar a plataforma, você precisa definir sua localização padrão primeiro."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Estado *</Label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger><SelectValue placeholder="Selecione um estado..." /></SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map(state => (
                  <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cidade *</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState || isLoading}>
              <SelectTrigger>
                {isLoading ? (
                  <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</span>
                ) : (
                  <SelectValue placeholder="Selecione uma cidade..." />
                )}
              </SelectTrigger>
              <SelectContent>
                {availableCities.length > 0 ? (
                  availableCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)
                ) : (
                  <div className="p-2 text-sm text-center text-muted-foreground">Nenhuma cidade com cobertura.</div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canClose && (
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          )}
          <Button 
            onClick={handleSaveLocation} 
            disabled={isSaving || !selectedCity}
            className="w-full sm:w-auto"
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {canClose ? "Salvar Alteração" : "Definir Localização"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}