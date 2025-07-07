import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { Order } from "@/types/order";
import { formatCurrency, calculateTotal } from "@/utils/currencyUtils";
import { formatTime } from "@/utils/dateUtils";
import OrderStatusBadge from "./OrderStatusBadge";

interface CollapsedOrderCardProps {
  order: Order;
  onPrint: (order: Order) => void;
}

const CollapsedOrderCard = ({ order, onPrint }: CollapsedOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          <OrderStatusBadge status={order.status} />
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
                  {order.endereco_completo || "Retirada"}
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

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-medium">Valor do pedido:</span>
                <span>R$ {formatCurrency(order.valor_pedido)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Taxa de entrega:</span>
                <span>R$ {formatCurrency(order.taxa_entrega)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-sm text-primary">
                <span>TOTAL:</span>
                <span>R$ {calculateTotal(order.valor_total, order.valor_pedido, order.taxa_entrega)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Pagamento:</span>
                <span>{order.forma_pagamento || "N/A"}</span>
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
};

export default CollapsedOrderCard;