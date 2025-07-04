import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, Truck, Printer } from "lucide-react";

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

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
  onPrint: (order: Order) => void;
}

const OrderCard = ({ order, onStatusChange, onPrint }: OrderCardProps) => {
  const formatCurrency = (value: string | null) => {
    if (!value) return "N/A";
    return `R$ ${value}`;
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusActions = () => {
    const currentStatus = order.status;
    
    if (currentStatus === "Pendente") {
      return (
        <Button
          size="sm"
          onClick={() => onStatusChange(order.id, "Confirmado")}
          className="w-full bg-status-confirmed hover:bg-status-confirmed/90 text-status-confirmed-foreground"
        >
          <Check className="w-4 h-4 mr-2" />
          Confirmar
        </Button>
      );
    }
    
    if (currentStatus === "Confirmado") {
      return (
        <Button
          size="sm"
          onClick={() => onStatusChange(order.id, "Saiu para entrega")}
          className="w-full bg-status-delivery hover:bg-status-delivery/90 text-status-delivery-foreground"
        >
          <Truck className="w-4 h-4 mr-2" />
          Saiu para entrega
        </Button>
      );
    }
    
    return null;
  };

  const getStatusBadge = () => {
    const status = order.status;
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let className = "";
    
    if (status === "Pendente") {
      className = "bg-status-pending text-status-pending-foreground";
    } else if (status === "Confirmado") {
      className = "bg-status-confirmed text-status-confirmed-foreground";
    } else if (status === "Saiu para entrega") {
      className = "bg-status-delivery text-status-delivery-foreground";
    }
    
    return (
      <Badge variant={variant} className={className}>
        {status || "Sem status"}
      </Badge>
    );
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-base">
              {order.nome_cliente || "Cliente não informado"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Pedido: {order.codigo_pedido || "N/A"}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Informações do cliente */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-medium">📞</span>
            <span>{order.telefone || "Não informado"}</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">📍</span>
            <span className="text-xs leading-relaxed">
              {order.endereco_completo || "Endereço não informado"}
            </span>
          </div>
        </div>

        <Separator />

        {/* Itens do pedido */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Itens:</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {order.itens || "Itens não informados"}
          </p>
        </div>

        <Separator />

        {/* Informações financeiras e tempo */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Valor:</span>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(order.valor_total)}
            </p>
          </div>
          <div>
            <span className="font-medium">Pagamento:</span>
            <p className="text-sm">
              {order.forma_pagamento || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>
            Tempo estimado: {order.tempo_entrega_estimado || "Não informado"}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Pedido em: {formatTime(order.data_hora_pedido)}</p>
        </div>

        <Separator />

        {/* Ações */}
        <div className="space-y-2">
          {getStatusActions()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrint(order)}
            className="w-full"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;