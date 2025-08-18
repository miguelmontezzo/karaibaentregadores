// Configurações para acesso à base de dados de clientes
export const CUSTOMER_SUPABASE_CONFIG = {
  url: "https://fikhhcdxsutcdtvqbqkm.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2hoY2R4c3V0Y2R0dnFicWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTgzODIsImV4cCI6MjA2ODQzNDM4Mn0.q-EUHCawjpRrKS0oVhnEcEcNYIqAg-jSxktpv3ckek0"
};

// Função para fazer requisições HTTP diretas ao Supabase REST API
export const customerApiCall = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any
) => {
  const url = `${CUSTOMER_SUPABASE_CONFIG.url}/rest/v1${endpoint}`;
  
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CUSTOMER_SUPABASE_CONFIG.anonKey}`,
    'apikey': CUSTOMER_SUPABASE_CONFIG.anonKey,
  };
  
  // Adicionar headers específicos baseados no método
  if (method === 'GET') {
    headers['Range'] = '0-999'; // Pegar até 1000 registros
    headers['Prefer'] = 'count=exact'; // Retornar contagem exata
  } else if (method === 'PATCH' || method === 'PUT') {
    headers['Prefer'] = 'return=minimal'; // Para updates, não retornar dados
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Verificar se há conteúdo na resposta antes de fazer parse JSON
    const text = await response.text();
    
    // Se a resposta está vazia (comum em updates/deletes), retornar objeto vazio
    if (!text || text.trim() === '') {
      return {};
    }

    // Tentar fazer parse JSON apenas se há conteúdo
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn('Resposta não é JSON válido:', text);
      return text; // Retorna como texto se não for JSON
    }
  } catch (error) {
    console.error('Customer API call error:', error);
    throw error;
  }
};