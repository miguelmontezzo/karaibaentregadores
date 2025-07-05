
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Clock, Truck, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Order {
  id: string;
  codigo_pedido: string | null;
  nome_cliente: string | null;
  telefone: string | null;
  endereco_completo: string | null;
  bairro: string | null;
  itens: string | null;
  valor_total: string | null;
  valor_pedido: string | null;
  taxa_entrega: string | null;
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatCurrency = (value: string | null) => {
    if (!value) return "0,00";
    return value.replace(".", ",");
  };

  const calculateTotal = () => {
    const valorPedido = parseFloat(order.valor_pedido?.replace(",", ".") || "0");
    const taxaEntrega = parseFloat(order.taxa_entrega?.replace(",", ".") || "0");
    const total = valorPedido + taxaEntrega;
    return total.toFixed(2).replace(".", ",");
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
          className="w-full bg-status-confirmed hover:bg-status-confirmed/90 text-status-confirmed-foreground text-xs py-1 h-7"
        >
          <Check className="w-3 h-3 mr-1" />
          Confirmar
        </Button>
      );
    }
    
    if (currentStatus === "Confirmado") {
      return (
        <Button
          size="sm"
          onClick={() => onStatusChange(order.id, "Saiu para entrega")}
          className="w-full bg-status-delivery hover:bg-status-delivery/90 text-status-delivery-foreground text-xs py-1 h-7"
        >
          <Truck className="w-3 h-3 mr-1" />
          Saiu para entrega
        </Button>
      );
    }
    
    return null;
  };

  const getStatusBadge = () => {
    const status = order.status;
    let className = "";
    
    if (status === "Pendente") {
      className = "bg-status-pending text-status-pending-foreground";
    } else if (status === "Confirmado") {
      className = "bg-status-confirmed text-status-confirmed-foreground";
    } else if (status === "Saiu para entrega") {
      className = "bg-status-delivery text-status-delivery-foreground";
    }
    
    return (
      <Badge variant="default" className={`${className} text-xs px-2 py-0`}>
        {status || "Sem status"}
      </Badge>
    );
  };

  // Card resumido para "Saiu para entrega"
  if (order.status === "Saiu para entrega") {
    return (
      <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">
                {order.nome_cliente || "Cliente não informado"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {order.bairro || "Bairro não informado"}
              </p>
              <p className="text-xs text-muted-foreground">
                Pedido: {order.codigo_pedido || "N/A"}
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2 px-3 pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-xs py-1 h-6"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                - Detalhes
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                + Detalhes
              </>
            )}
          </Button>

          {isExpanded && (
            <div className="space-y-2 animate-fade-in">
              <div className="space-y-1 text-xs">
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

              <div className="space-y-1">
                <h4 className="font-medium text-xs">Itens:</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {order.itens || "Itens não informados"}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Total:</span>
                  <p className="text-sm font-bold text-primary">
                    R$ {calculateTotal()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Pagamento:</span>
                  <p className="text-xs">
                    {order.forma_pagamento || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>
                  Tempo estimado: {order.tempo_entrega_estimado || "Não informado"}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Pedido em: {formatTime(order.data_hora_pedido)}</p>
              </div>

              <Separator />

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(order)}
                className="w-full text-xs py-1 h-6"
              >
                <Printer className="w-3 h-3 mr-1" />
                Imprimir (2 vias)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Card completo para "Pendente" e "Confirmado"
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm">
              {order.nome_cliente || "Cliente não informado"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Pedido: {order.codigo_pedido || "N/A"}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 px-3 pb-3">
        {/* Priorizar status, nome e valor total calculado */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div>
            <span className="font-medium">Total:</span>
            <p className="text-sm font-bold text-primary">
              R$ {calculateTotal()}
            </p>
          </div>
          <div>
            <span className="font-medium">Pagamento:</span>
            <p className="text-xs">
              {order.forma_pagamento || "N/A"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Informações do cliente */}
        <div className="space-y-1 text-xs">
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
        <div className="space-y-1">
          <h4 className="font-medium text-xs">Itens:</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {order.itens || "Itens não informados"}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span>
            Tempo estimado: {order.tempo_entrega_estimado || "Não informado"}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Pedido em: {formatTime(order.data_hora_pedido)}</p>
        </div>

        <Separator />

        {/* Ações */}
        <div className="space-y-1">
          {getStatusActions()}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPrint(order)}
            className="w-full text-xs py-1 h-6"
          >
            <Printer className="w-3 h-3 mr-1" />
            Imprimir (2 vias)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
