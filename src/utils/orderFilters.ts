import { Order } from "@/types/order";

export const getPendingOrders = (orders: Order[]) => 
  orders.filter(order => order.status === "Pendente");

export const getConfirmedOrders = (orders: Order[]) => 
  orders.filter(order => order.status === "Confirmado");

export const getConfirmedForDeliveryOrders = (orders: Order[]) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return orders.filter(order => {
    if (order.status !== "Saiu para entrega" && order.status !== "Pronto para retirada") return false;
    const orderDate = new Date(order.data_hora_pedido);
    const orderDateStr = orderDate.toISOString().split('T')[0];
    return orderDateStr === todayStr;
  });
};