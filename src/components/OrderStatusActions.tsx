import { Button } from "@/components/ui/button";
import { Check, Truck } from "lucide-react";

interface OrderStatusActionsProps {
  status: string | null;
  orderId: string;
  onStatusChange: (orderId: string, status: string) => void;
  hasAddress: boolean;
}

const OrderStatusActions = ({ status, orderId, onStatusChange, hasAddress }: OrderStatusActionsProps) => {
  if (status === "Pendente") {
    return (
      <Button
        size="sm"
        onClick={() => onStatusChange(orderId, "Confirmado")}
        className="w-full bg-status-confirmed hover:bg-status-confirmed/90 text-status-confirmed-foreground text-xs py-1 h-7"
      >
        <Check className="w-3 h-3 mr-1" />
        Confirmar
      </Button>
    );
  }
  
  if (status === "Confirmado") {
    // Se não tem endereço (retirada), mostrar apenas "Pronto para retirada"
    if (!hasAddress) {
      return (
        <Button
          size="sm"
          onClick={() => onStatusChange(orderId, "Pronto para retirada")}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-7"
        >
          <Check className="w-3 h-3 mr-1" />
          Pronto para retirada
        </Button>
      );
    }
    
    // Se tem endereço (entrega), mostrar apenas "Saiu para entrega"
    return (
      <Button
        size="sm"
        onClick={() => onStatusChange(orderId, "Saiu para entrega")}
        className="w-full bg-status-delivery hover:bg-status-delivery/90 text-status-delivery-foreground text-xs py-1 h-7"
      >
        <Truck className="w-3 h-3 mr-1" />
        Saiu para entrega
      </Button>
    );
  }
  
  return null;
};

export default OrderStatusActions;