import OrderCard from "@/components/OrderCard";
import { Order } from "@/types/order";
import { getPendingOrders, getConfirmedOrders, getConfirmedForDeliveryOrders } from "@/utils/orderFilters";

interface OrdersKanbanBoardProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: string) => void;
  onPrint: (order: Order) => void;
}

const OrdersKanbanBoard = ({ orders, onStatusChange, onPrint }: OrdersKanbanBoardProps) => {
  const pendingOrders = getPendingOrders(orders);
  const confirmedOrders = getConfirmedOrders(orders);
  const confirmedForDeliveryOrders = getConfirmedForDeliveryOrders(orders);

  return (
    <main className="container mx-auto px-2 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Coluna Pendente */}
        <div className="bg-card rounded-lg shadow-sm border">
          <div className="text-status-pending-foreground p-3 rounded-t-lg bg-neutral-300">
            <h2 className="font-semibold text-sm">
              Pendente ({pendingOrders.length})
            </h2>
          </div>
          <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusChange={onStatusChange} 
                onPrint={onPrint} 
              />
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Nenhum pedido pendente
              </p>
            )}
          </div>
        </div>

        {/* Coluna Confirmado */}
        <div className="bg-card rounded-lg shadow-sm border">
          <div className="text-status-confirmed-foreground p-3 rounded-t-lg bg-lime-700">
            <h2 className="font-semibold text-sm">
              Confirmado ({confirmedOrders.length})
            </h2>
          </div>
          <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {confirmedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusChange={onStatusChange} 
                onPrint={onPrint} 
              />
            ))}
            {confirmedOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Nenhum pedido confirmado
              </p>
            )}
          </div>
        </div>

        {/* Coluna Pedidos Confirmados */}
        <div className="bg-card rounded-lg shadow-sm border">
          <div className="bg-status-delivery text-status-delivery-foreground p-3 rounded-t-lg">
            <h2 className="font-semibold text-sm">
              Pedidos Confirmados - Hoje ({confirmedForDeliveryOrders.length})
            </h2>
          </div>
          <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {confirmedForDeliveryOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusChange={onStatusChange} 
                onPrint={onPrint} 
              />
            ))}
            {confirmedForDeliveryOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Nenhum pedido confirmado hoje
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrdersKanbanBoard;