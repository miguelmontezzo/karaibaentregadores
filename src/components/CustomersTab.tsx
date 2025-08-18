import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Customer, formatPhoneNumber, formatName } from '@/types/customer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Search, Users, UserCheck, UserX, Bot, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedPhone from '@/components/ProtectedPhone';

const CustomersTab = () => {
  const { customers, loading, error, fetchCustomers, updateCustomerIAStatus } = useCustomers();
  const { isAdmin, loading: permissionLoading, userCargo, userName } = useUserPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pause'>('all');

  // Filtrar e ordenar clientes baseado no termo de busca e status
  const filteredCustomers = customers
    .filter(customer => {
      // Verificar se telefone existe antes de formatar
      if (!customer.telefone) return false;
      
      // Filtro por status IA
      if (statusFilter !== 'all' && customer.atendimento_ia !== statusFilter) {
        return false;
      }
      
      // Filtro por busca
      const phoneNumber = formatPhoneNumber(customer.telefone);
      const name = customer.nomewpp || '';
      const searchLower = searchTerm.toLowerCase();
      
      return phoneNumber.toLowerCase().includes(searchLower) ||
             name.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      // Ordenar alfabeticamente por nome, priorizando letras sobre emojis/símbolos
      const nameA = (a.nomewpp || 'Nome não disponível').toLowerCase();
      const nameB = (b.nomewpp || 'Nome não disponível').toLowerCase();
      
      // Verificar se o primeiro caractere é uma letra
      const startsWithLetterA = /^[a-záàâãäéèêëíìîïóòôõöúùûüçñ]/.test(nameA);
      const startsWithLetterB = /^[a-záàâãäéèêëíìîïóòôõöúùûüçñ]/.test(nameB);
      
      // Se um começa com letra e outro não, priorizar o que começa com letra
      if (startsWithLetterA && !startsWithLetterB) {
        return -1; // A vem primeiro
      }
      if (!startsWithLetterA && startsWithLetterB) {
        return 1; // B vem primeiro
      }
      
      // Se ambos começam com letra ou ambos não começam, ordenar normalmente
      return nameA.localeCompare(nameB, 'pt-BR', { 
        sensitivity: 'base',
        ignorePunctuation: true 
      });
    });

  // Estatísticas
  const totalCustomers = customers.length;
  const activeIA = customers.filter(c => c.atendimento_ia === 'active').length;
  const inactiveIA = customers.filter(c => c.atendimento_ia === 'pause').length;
  


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCustomers();
    setIsRefreshing(false);
  };

  const handleToggleIA = async (customer: Customer, newStatus: boolean) => {
    if (!isAdmin) {
      alert('Acesso negado: Apenas administradores podem alterar o status da IA dos clientes.');
      return;
    }
    
    if (customer.id) {
      await updateCustomerIAStatus(customer.id, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados dos clientes: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Ativa</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeIA}</div>
            <p className="text-xs text-muted-foreground">
              Atendimento IA habilitado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Inativa</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveIA}</div>
            <p className="text-xs text-muted-foreground">
              Atendimento IA desabilitado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Área de Gerenciamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Gerenciar Atendimento IA
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? "Ative ou desative o atendimento por IA para cada cliente"
                  : `Visualização apenas - Usuário: ${userName} (${userCargo}) - Apenas administradores podem alterar configurações`
                }
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Alerta para usuários não-admin */}
          {!isAdmin && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                ⚠️ Você está visualizando esta seção apenas para consulta. Alterações nas configurações de IA 
                são restritas a usuários com cargo de administrador.
              </AlertDescription>
            </Alert>
          )}
          {/* Barra de Pesquisa e Filtros responsiva */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            {/* Busca */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex items-center space-x-2 w-full md:w-auto md:justify-end">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium hidden md:inline">Filtrar por status:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  Todos ({totalCustomers})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                  className="flex items-center gap-1"
                >
                  <UserCheck className="h-3 w-3" />
                  IA Ativa ({activeIA})
                </Button>
                <Button
                  variant={statusFilter === 'pause' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pause')}
                  className="flex items-center gap-1"
                >
                  <UserX className="h-3 w-3" />
                  IA Pausada ({inactiveIA})
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum cliente encontrado com os filtros aplicados.' 
                  : 'Nenhum cliente cadastrado.'
                }
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">
                          {formatName(customer.nomewpp || 'Nome não disponível')}
                        </div>
                        {customer.telefone && (
                          <div className="text-sm text-muted-foreground">
                            <ProtectedPhone
                              phone={formatPhoneNumber(customer.telefone)}
                              allowReveal={isAdmin}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor={`ia-switch-${customer.id}`} 
                      className={`text-sm ${!isAdmin ? 'text-gray-400' : ''}`}
                    >
                      {isAdmin 
                        ? (customer.atendimento_ia === 'active' ? "Pausar" : "Ativar") + " IA"
                        : "Somente Leitura"
                      }
                    </Label>
                    <Switch
                      id={`ia-switch-${customer.id}`}
                      checked={customer.atendimento_ia === 'active'}
                      onCheckedChange={(checked) => handleToggleIA(customer, checked)}
                      disabled={!isAdmin}
                      className={`${customer.atendimento_ia === 'active' 
                        ? 'data-[state=checked]:bg-green-600' 
                        : 'data-[state=unchecked]:bg-gray-400'
                      } ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersTab;