
import { Order } from "@/types/order";
import CollapsedOrderCard from "./CollapsedOrderCard";
import ExpandedOrderCard from "./ExpandedOrderCard";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
  onPrint: (order: Order) => void;
}

const OrderCard = ({ order, onStatusChange, onPrint }: OrderCardProps) => {
  // Card resumido para "Saiu para entrega" e "Pronto para retirada"
  if (order.status === "Saiu para entrega" || order.status === "Pronto para retirada") {
    return <CollapsedOrderCard order={order} onPrint={onPrint} />;
  }

  // Card completo para "Pendente" e "Confirmado"
  return (
    <ExpandedOrderCard 
      order={order} 
      onStatusChange={onStatusChange} 
      onPrint={onPrint} 
    />
  );
};

export default OrderCard;
