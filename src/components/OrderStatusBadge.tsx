import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string | null;
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  let className = "";
  
  if (status === "Pendente") {
    className = "bg-status-pending text-status-pending-foreground";
  } else if (status === "Confirmado") {
    className = "bg-status-confirmed text-status-confirmed-foreground";
  } else if (status === "Saiu para entrega") {
    className = "bg-status-delivery text-status-delivery-foreground";
  } else if (status === "Pronto para retirada") {
    className = "bg-green-600 text-white";
  }
  
  return (
    <Badge variant="default" className={`${className} text-xs px-2 py-0`}>
      {status || "Sem status"}
    </Badge>
  );
};

export default OrderStatusBadge;