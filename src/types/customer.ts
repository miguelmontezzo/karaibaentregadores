export interface Customer {
  id?: number;
  telefone: string; // Número completo como vem do WhatsApp
  nomewpp?: string; // Nome do WhatsApp
  atendimento_ia: string; // Status do atendimento IA como texto
  created_at?: string;
}

export interface CustomerFormData {
  telefone: string;
  nomewpp?: string;
  atendimento_ia: string;
}

// Função utilitária para extrair apenas o número antes do @
export const extractPhoneNumber = (fullNumber: string): string => {
  if (!fullNumber) return '';
  return fullNumber.split('@')[0];
};

// Formatar número brasileiro: DDD 9 9999-9999
export const formatBrazilianPhone = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Extrair apenas números
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Remover +55 se presente
  let number = cleanNumber;
  if (cleanNumber.startsWith('55') && cleanNumber.length >= 12) {
    number = cleanNumber.substring(2);
  }
  
  // Verificar se tem o formato correto (11 dígitos: DDD + 9 + 8 dígitos)
  if (number.length === 11) {
    const ddd = number.substring(0, 2);
    const firstDigit = number.substring(2, 3);
    const middlePart = number.substring(3, 7);
    const lastPart = number.substring(7, 11);
    
    return `${ddd} ${firstDigit} ${middlePart}-${lastPart}`;
  }
  
  // Se não tem 11 dígitos, tentar adicionar o 9
  if (number.length === 10) {
    const ddd = number.substring(0, 2);
    const middlePart = number.substring(2, 6);
    const lastPart = number.substring(6, 10);
    
    return `${ddd} 9 ${middlePart}-${lastPart}`;
  }
  
  // Se não conseguir formatar, retornar o número original
  return phoneNumber;
};

// Formatar nome com primeira letra maiúscula
export const formatName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Função para formatar o número para exibição no padrão brasileiro
export const formatPhoneNumber = (fullNumber: string): string => {
  const phoneNumber = extractPhoneNumber(fullNumber);
  return formatBrazilianPhone(phoneNumber);
};