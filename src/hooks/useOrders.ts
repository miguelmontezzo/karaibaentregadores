import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types/order";
import { playNotificationSound } from "@/utils/notificationSound";

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
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
  }, [toast]);

  const setupRealtimeUpdates = useCallback(() => {
    const channel = supabase.channel("orders-changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "pedidos_karaiba"
    }, payload => {
      console.log("Realtime update:", payload);
      if (payload.eventType === "INSERT") {
        const newOrder = payload.new as Order;
        setOrders(prev => [newOrder, ...prev]);

        if (newOrder.status === "Pendente") {
          playNotificationSound();
          toast({
            title: "Novo Pedido!",
            description: `Pedido de ${newOrder.nome_cliente} - ${newOrder.codigo_pedido}`
          });
        }
      } else if (payload.eventType === "UPDATE") {
        const updatedOrder = payload.new as Order;
        setOrders(prev => prev.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        ));
        console.log("Order updated in real-time:", updatedOrder);
      } else if (payload.eventType === "DELETE") {
        setOrders(prev => prev.filter(order => order.id !== payload.old.id));
      }
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      console.log("Updating order status:", orderId, "to:", newStatus);
      
      const { error } = await supabase
        .from("pedidos_karaiba")
        .update({ status: newStatus })
        .eq("id", orderId);
      
      if (error) {
        console.error("Erro ao atualizar status:", error);
        toast({
          title: "Erro ao atualizar status",
          description: "Tente novamente",
          variant: "destructive"
        });
        return;
      }

      // Atualizar localmente também para garantir resposta imediata
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      let webhookUrl = "";
      if (newStatus === "Confirmado") {
        webhookUrl = "https://zzotech-n8n.lgctvv.easypanel.host/webhook/pedidoconfirmado";
      } else if (newStatus === "Saiu para entrega") {
        webhookUrl = "https://zzotech-n8n.lgctvv.easypanel.host/webhook/saiupentrega";
      } else if (newStatus === "Pronto para retirada") {
        webhookUrl = "https://zzotech-n8n.lgctvv.easypanel.host/webhook/prontopararetirada";
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
              headers: { "Content-Type": "application/json" },
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
  }, [orders, toast]);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    setupRealtimeUpdates,
    updateOrderStatus,
    deleteOrder
  };
};