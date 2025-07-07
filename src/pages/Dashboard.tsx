import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import OrdersKanbanBoard from "@/components/OrdersKanbanBoard";
import { useOrders } from "@/hooks/useOrders";
import { useOrderPrint } from "@/hooks/useOrderPrint";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { orders, loading, fetchOrders, setupRealtimeUpdates, updateOrderStatus } = useOrders();
  const { printOrder } = useOrderPrint();

  useEffect(() => {
    // Verificar se usuário está logado
    const savedUser = localStorage.getItem("karaiba_user");
    if (!savedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(savedUser));
    fetchOrders();
    setupRealtimeUpdates();
  }, [navigate, fetchOrders, setupRealtimeUpdates]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
    toast({
      title: "Página atualizada!",
      description: "Dados recarregados com sucesso"
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("karaiba_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        user={user}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      
      <OrdersKanbanBoard 
        orders={orders}
        onStatusChange={updateOrderStatus}
        onPrint={printOrder}
      />
    </div>
  );
};

export default Dashboard;
