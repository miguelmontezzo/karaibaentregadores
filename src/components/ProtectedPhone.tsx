import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface ProtectedPhoneProps {
  phone: string | null;
  className?: string;
  allowReveal?: boolean;
}

const ProtectedPhone = ({ phone, className = "", allowReveal = false }: ProtectedPhoneProps) => {
  const [isVisible, setIsVisible] = useState(allowReveal);

  if (!phone || phone === "Não informado") {
    return <span className={className}>Não informado</span>;
  }

  const formatHiddenPhone = (phoneNumber: string): string => {
    // Manter apenas os primeiros 3 dígitos e mascarar o resto
    if (phoneNumber.length <= 4) return '****';
    return phoneNumber.substring(0, 3) + '*'.repeat(phoneNumber.length - 3);
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="font-mono text-xs">
        {isVisible ? phone : formatHiddenPhone(phone)}
      </span>
      {allowReveal && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="h-5 w-5 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
          title={isVisible ? "Ocultar número" : "Mostrar número"}
        >
          {isVisible ? (
            <EyeOff className="h-3 w-3 text-gray-600" />
          ) : (
            <Eye className="h-3 w-3 text-gray-600" />
          )}
        </Button>
      )}
    </div>
  );
};

export default ProtectedPhone;