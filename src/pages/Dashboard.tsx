import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import karaibaWhiteLogo from "@/assets/karaiba-logo-white.png";

interface Order {
  id: string;
  codigo_pedido: string | null;
  nome_cliente: string | null;
  telefone: string | null;
  endereco_completo: string | null;
  bairro: string | null;
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
  const {
    toast
  } = useToast();

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
      const {
        data,
        error
      } = await supabase.from("pedidos_karaiba").select("*").order("data_hora_pedido", {
        ascending: false
      });
      if (error) {
        console.error("Erro ao buscar pedidos:", error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Tente recarregar a página",
          variant: "destructive"
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
    const channel = supabase.channel("orders-changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "pedidos_karaiba"
    }, payload => {
      console.log("Realtime update:", payload);
      if (payload.eventType === "INSERT") {
        const newOrder = payload.new as Order;
        setOrders(prev => [newOrder, ...prev]);

        // Tocar som de notificação para novos pedidos pendentes
        if (newOrder.status === "Pendente") {
          playNotificationSound();
          toast({
            title: "Novo Pedido!",
            description: `Pedido de ${newOrder.nome_cliente} - ${newOrder.codigo_pedido}`
          });
        }
      } else if (payload.eventType === "UPDATE") {
        setOrders(prev => prev.map(order => order.id === payload.new.id ? payload.new as Order : order));
      } else if (payload.eventType === "DELETE") {
        setOrders(prev => prev.filter(order => order.id !== payload.old.id));
      }
    }).subscribe();
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
      const {
        error
      } = await supabase.from("pedidos_karaiba").update({
        status: newStatus
      }).eq("id", orderId);
      if (error) {
        console.error("Erro ao atualizar status:", error);
        toast({
          title: "Erro ao atualizar status",
          description: "Tente novamente",
          variant: "destructive"
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
        if (order) {
          try {
            const webhookData = {
              nome_cliente: order.nome_cliente,
              telefone: order.telefone,
              codigo_pedido: order.codigo_pedido
            };
            await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(webhookData)
            });
          } catch (webhookError) {
            console.error("Erro no webhook:", webhookError);
          }
        }
      }
      toast({
        title: "Status atualizado!",
        description: `Pedido alterado para: ${newStatus}`
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
    
    const currentDate = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Cupom Fiscal - ${order.codigo_pedido}</title>
          <style>
            @page {
              margin: 0;
              size: auto;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-weight: bold;
            }
            
            .cupom {
              width: 58mm;
              margin: 20px auto;
              padding: 10px;
              border: 1px dashed #000;
              font-size: 14px;
              line-height: 1.4;
              font-weight: bold;
            }
            
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider {
              border-top: 1px dashed #000;
              margin: 5px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .field {
              margin: 2px 0;
            }
            
            @media print { 
              @page {
                margin: 0 !important;
                size: auto !important;
              }
              
              body { 
                margin: 0 !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                font-weight: bold !important;
              }
              
              .cupom { 
                margin: 0 !important; 
                border: none !important;
                page-break-inside: avoid !important;
                font-weight: bold !important;
              }
              
              /* Remove browser headers and footers */
              html, body {
                height: auto !important;
                overflow: visible !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="cupom">
            <div class="center bold">RESTAURANTE E LANCHONETE KARAÍBA</div>
            <div class="center">Souza & Belmiro LTDA</div>
            <div class="center">CNPJ: 08.892.783/0001-77</div>
            <div class="center">Rua Rafael Marino Neto, 266</div>
            <div class="center">Jardim Indaia, Uberlândia - MG</div>
            <div class="center">CEP: 38411-186</div>
            <div class="divider"></div>
            
            <div class="field"><span class="bold">Pedido:</span> ${order.codigo_pedido || "N/A"}</div>
            <div class="field"><span class="bold">Data:</span> ${currentDate}</div>
            <div class="field"><span class="bold">Cliente:</span> ${order.nome_cliente || "N/A"}</div>
            <div class="field"><span class="bold">Telefone:</span> ${order.telefone || "N/A"}</div>
            <div class="field"><span class="bold">Endereço:</span> ${order.endereco_completo || "N/A"}</div>
            <div class="field"><span class="bold">Bairro:</span> ${order.bairro || "N/A"}</div>
            <div class="divider"></div>
            
            <div class="bold">ITENS:</div>
            <div style="margin: 5px 0; font-size: 13px; font-weight: bold;">
              ${order.itens || "Itens não informados"}
            </div>
            
            <div class="divider"></div>
            <div class="item bold"><span>TOTAL</span><span>R$ ${order.valor_total || "0,00"}</span></div>
            <div class="divider"></div>
            
            <div class="field"><span class="bold">Pagamento:</span> ${order.forma_pagamento || "N/A"}</div>
            <div class="field"><span class="bold">Tempo de entrega:</span> ${order.tempo_entrega_estimado || "N/A"}</div>
            <div class="field"><span class="bold">Status:</span> ${order.status || "N/A"}</div>
            <div class="divider"></div>
            
            <div class="center">Agradecemos pela preferência!</div>
            <div class="center">Restaurante e Lanchonete Karaíba</div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Add a small delay to ensure styles are loaded before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getPendingOrders = () => orders.filter(order => order.status === "Pendente");
  const getConfirmedOrders = () => orders.filter(order => order.status === "Confirmado");
  const getDeliveryOrders = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    return orders.filter(order => {
      if (order.status !== "Saiu para entrega") return false;
      const orderDate = new Date(order.data_hora_pedido);
      const orderDateStr = orderDate.toISOString().split('T')[0];
      return orderDateStr === todayStr;
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="shadow-md bg-red-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between bg-red-700">
          <div className="flex items-center space-x-4">
            <img src={karaibaWhiteLogo} alt="Karaíba" className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">
                Painel de Pedidos
              </h1>
              <p className="text-xs text-primary-foreground/80">
                Bem-vindo, {user?.usuario}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary-foreground/20 text-xs py-1 h-7 bg-white/[0.98] text-red-900">
            <LogOut className="w-3 h-3 mr-1" />
            Sair
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="container mx-auto px-2 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Coluna Pendente */}
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="text-status-pending-foreground p-3 rounded-t-lg bg-neutral-300">
              <h2 className="font-semibold text-sm">
                Pendente ({getPendingOrders().length})
              </h2>
            </div>
            <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {getPendingOrders().map(order => <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} onPrint={printOrder} />)}
              {getPendingOrders().length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum pedido pendente
                </p>}
            </div>
          </div>

          {/* Coluna Confirmado */}
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="text-status-confirmed-foreground p-3 rounded-t-lg bg-lime-700">
              <h2 className="font-semibold text-sm">
                Confirmado ({getConfirmedOrders().length})
              </h2>
            </div>
            <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {getConfirmedOrders().map(order => <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} onPrint={printOrder} />)}
              {getConfirmedOrders().length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum pedido confirmado
                </p>}
            </div>
          </div>

          {/* Coluna Saiu para entrega */}
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="bg-status-delivery text-status-delivery-foreground p-3 rounded-t-lg">
              <h2 className="font-semibold text-sm">
                Saiu para entrega - Hoje ({getDeliveryOrders().length})
              </h2>
            </div>
            <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {getDeliveryOrders().map(order => <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} onPrint={printOrder} />)}
              {getDeliveryOrders().length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">
                  Nenhum pedido em entrega hoje
                </p>}
            </div>
          </div>
        </div>
      </main>
    </div>;
};

export default Dashboard;
