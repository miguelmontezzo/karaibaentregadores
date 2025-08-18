import { useState, useEffect, useCallback } from 'react';
import { customerApiCall } from '@/integrations/supabase/customerClient';
import { Customer, CustomerFormData } from '@/types/customer';
import { useToast } from './use-toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Função para buscar clientes únicos (evita duplicação por número)
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await customerApiCall('GET', '/dados_cliente?order=created_at.desc&limit=1000');

      // Normalizar e remover duplicatas baseado no número (antes do @)
      const uniqueCustomers = data?.reduce((acc: Customer[], current: Customer) => {
        // Verificar se telefone existe antes de fazer split
        if (!current.telefone) {
          return acc;
        }
        
        // Normalizar status IA - análise mais rigorosa
        let normalizedStatus = 'active'; // Default para active (maioria dos casos)
        
        if (current.atendimento_ia) {
          // Limpar string: remover quebras de linha, espaços, aspas
          const cleanStatus = current.atendimento_ia
            .toString()
            .replace(/[\n\r"']/g, '') // Remove quebras de linha e aspas
            .trim()
            .toLowerCase();
          

          
          // Mapear variações para status correto
          if (cleanStatus === 'pause') {
            normalizedStatus = 'pause';
          } else if (cleanStatus.includes('active') || cleanStatus === 'actvie') {
            normalizedStatus = 'active';
          } else {
            // Para casos undefined/null/empty, manter como active (padrão da maioria)
            normalizedStatus = 'active';
          }
        }
        
        // Criar objeto normalizado
        const normalizedCustomer = {
          ...current,
          atendimento_ia: normalizedStatus
        };
        
        const phoneNumber = current.telefone.split('@')[0];
        const existingIndex = acc.findIndex(customer => 
          customer.telefone && customer.telefone.split('@')[0] === phoneNumber
        );
        
        if (existingIndex === -1) {
          acc.push(normalizedCustomer);
        } else {
          // Manter o mais recente se houver duplicatas
          if (current.created_at && acc[existingIndex].created_at) {
            if (new Date(current.created_at) > new Date(acc[existingIndex].created_at!)) {
              acc[existingIndex] = normalizedCustomer;
            }
          }
        }
        
        return acc;
      }, []) || [];

      setCustomers(uniqueCustomers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Função para atualizar status da IA de um cliente
  const updateCustomerIAStatus = useCallback(async (customerId: number, iaAtiva: boolean) => {
    try {
      await customerApiCall('PATCH', `/dados_cliente?id=eq.${customerId}`, {
        atendimento_ia: iaAtiva ? 'active' : 'pause'
      });

      // Atualizar estado local
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, atendimento_ia: iaAtiva ? 'active' : 'pause' }
            : customer
        )
      );

      toast({
        title: "Sucesso",
        description: `Atendimento IA ${iaAtiva ? 'ativado' : 'desativado'} para o cliente`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Função para adicionar novo cliente
  const addCustomer = useCallback(async (customerData: CustomerFormData) => {
    try {
      // Verificar se já existe um cliente com esse número
      const phoneNumber = customerData.telefone?.split('@')[0];
      const existingCustomer = customers.find(customer => 
        customer.telefone && customer.telefone.split('@')[0] === phoneNumber
      );

      if (existingCustomer) {
        toast({
          title: "Aviso",
          description: "Cliente com este número já existe",
          variant: "destructive"
        });
        return false;
      }

      const data = await customerApiCall('POST', '/dados_cliente', {
        ...customerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (data && data[0]) {
        setCustomers(prev => [data[0], ...prev]);
        toast({
          title: "Sucesso",
          description: "Cliente adicionado com sucesso",
        });
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar cliente';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  }, [customers, toast]);

  // Carregar clientes na inicialização
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    updateCustomerIAStatus,
    addCustomer
  };
};