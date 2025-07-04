import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Printer } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import karaibaWhiteLogo from "@/assets/karaiba-logo-white.png";

interface Order {
  id: string;
  codigo_pedido: string | null;
  nome_cliente: string | null;
  telefone: string | null;
  endereco_completo: string | null;
  itens: string | null;
  valor_total: string | null;
  forma_pagamento: string | null;
  tempo_entrega_estimado: string | null;
  status: string | null;
  data_hora_pedido: string;
  criado_em: string | null;
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pedidos_karaiba")
        .select("*")
        .order("data_hora_pedido", { ascending: false });

      if (error) {
        console.error("Erro ao buscar pedidos:", error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Tente recarregar a página",
          variant: "destructive",
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos_karaiba",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            setOrders(prev => [newOrder, ...prev]);
            
            // Tocar som de notificação para novos pedidos pendentes
            if (newOrder.status === "Pendente") {
              playNotificationSound();
              toast({
                title: "Novo Pedido!",
                description: `Pedido de ${newOrder.nome_cliente} - ${newOrder.codigo_pedido}`,
              });
            }
          } else if (payload.eventType === "UPDATE") {
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id ? payload.new as Order : order
              )
            );
          } else if (payload.eventType === "DELETE") {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const playNotificationSound = () => {
    try {
      // Criar um áudio de notificação simples usando AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error("Erro ao reproduzir som:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("pedidos_karaiba")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Erro ao atualizar status:", error);
        toast({
          title: "Erro ao atualizar status",
          description: "Tente novamente",
          variant: "destructive",
        });
        return;
      }

      // Enviar webhook
      let webhookUrl = "";
      if (newStatus === "Confirmado") {
        webhookUrl = "https://zzotech-n8n.lgctvv.easypanel.host/webhook/pedidoconfirmado";
      } else if (newStatus === "Saiu para entrega") {
        webhookUrl = "https://zzotech-n8n.lgctvv.easypanel.host/webhook/saiupentrega";
      }

      if (webhookUrl) {
        const order = orders.find(o => o.id === orderId);
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
          });
        } catch (webhookError) {
          console.error("Erro no webhook:", webhookError);
        }
      }

      toast({
        title: "Status atualizado!",
        description: `Pedido alterado para: ${newStatus}`,
      });
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("karaiba_user");
    navigate("/login");
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido ${order.codigo_pedido}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .section { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .line { border-bottom: 1px dashed #ccc; margin: 5px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KARAÍBA RESTAURANTE</h2>
            <p>Pedido: ${order.codigo_pedido || "N/A"}</p>
          </div>
          
          <div class="section">
            <div class="label">Cliente:</div>
            <div>${order.nome_cliente || "N/A"}</div>
          </div>
          
          <div class="section">
            <div class="label">Telefone:</div>
            <div>${order.telefone || "N/A"}</div>
          </div>
          
          <div class="section">
            <div class="label">Endereço:</div>
            <div>${order.endereco_completo || "N/A"}</div>
          </div>
          
          <div class="line"></div>
          
          <div class="section">
            <div class="label">Itens do Pedido:</div>
            <div>${order.itens || "N/A"}</div>
          </div>
          
          <div class="line"></div>
          
          <div class="section">
            <div class="label">Valor Total:</div>
            <div>${order.valor_total || "N/A"}</div>
          </div>
          
          <div class="section">
            <div class="label">Forma de Pagamento:</div>
            <div>${order.forma_pagamento || "N/A"}</div>
          </div>
          
          <div class="section">
            <div class="label">Tempo Estimado:</div>
            <div>${order.tempo_entrega_estimado || "N/A"}</div>
          </div>
          
          <div class="section">
            <div class="label">Status:</div>
            <div>${order.status || "N/A"}</div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getPendingOrders = () => orders.filter(order => order.status === "Pendente");
  const getConfirmedOrders = () => orders.filter(order => order.status === "Confirmado");
  const getDeliveryOrders = () => orders.filter(order => order.status === "Saiu para entrega");

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
      {/* Header */}
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={karaibaWhiteLogo} 
              alt="Karaíba" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                Painel de Pedidos
              </h1>
              <p className="text-sm text-primary-foreground/80">
                Bem-vindo, {user?.usuario}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna Pendente */}
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="bg-status-pending text-status-pending-foreground p-4 rounded-t-lg">
              <h2 className="font-semibold text-lg">
                Pendente ({getPendingOrders().length})
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {getPendingOrders().map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  onPrint={printOrder}
                />
              ))}
              {getPendingOrders().length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pedido pendente
                </p>
              )}
            </div>
          </div>

          {/* Coluna Confirmado */}
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="bg-status-confirmed text-status-confirmed-foreground p-4 rounded-t-lg">
              <h2 className="font-semibold text-lg">
                Confirmado ({getConfirmedOrders().length})
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {getConfirmedOrders().map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  onPrint={printOrder}
                />
              ))}
              {getConfirmedOrders().length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pedido confirmado
                </p>
              )}
            </div>
          </div>

          {/* Coluna Saiu para entrega */}
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="bg-status-delivery text-status-delivery-foreground p-4 rounded-t-lg">
              <h2 className="font-semibold text-lg">
                Saiu para entrega ({getDeliveryOrders().length})
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {getDeliveryOrders().map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={updateOrderStatus}
                  onPrint={printOrder}
                />
              ))}
              {getDeliveryOrders().length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pedido em entrega
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;