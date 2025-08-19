import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { karaibaApiCall } from "@/integrations/supabase/restKaraiba";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { playNotificationSound } from "@/utils/notificationSound";
import MiniRouteMap from "@/components/MiniRouteMap";
// removed logo import per header simplification

type Order = {
  id: string;
  status: string;
  codigo_pedido?: string | null;
  nome_cliente?: string | null;
  data_hora_pedido?: string | null;
  valor_total?: string | number | null;
  forma_pagamento?: string | null;
  endereco_completo?: string | null;
  itens?: string | null;
};

const Painel = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<{ usuario: string; nome?: string | null } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const hasLoadedOnceRef = useRef<boolean>(false);
  const [deliveryCode, setDeliveryCode] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "success" | "error">("idle");
  const [deliveryMessage, setDeliveryMessage] = useState<string>("");
  const { toast } = useToast();

  // Garantir login (entregadores)
  useEffect(() => {
    const savedUser = localStorage.getItem("delivery_user");
    if (!savedUser) {
      navigate("/");
      return;
    }
    try {
      const parsed = JSON.parse(savedUser);
      setCurrentUser({ usuario: parsed?.usuario, nome: parsed?.nome });
    } catch {
      setCurrentUser(null);
    }
  }, [navigate]);

  const fetchOrders = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      // Intervalo do dia atual (horário local)
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const status = encodeURIComponent("Saiu para entrega");
      const gte = encodeURIComponent(startOfDay.toISOString());
      const lte = encodeURIComponent(endOfDay.toISOString());
      const entregador = currentUser?.usuario ? encodeURIComponent(`*${currentUser.usuario}*`) : "";
      const entregadorFilter = currentUser?.usuario ? `&entregador=ilike.${entregador}` : "";
      const endpoint = `/pedidos_karaiba?select=*&status=eq.${status}${entregadorFilter}&data_hora_pedido=gte.${gte}&data_hora_pedido=lte.${lte}&order=data_hora_pedido.desc`;
      const data = await karaibaApiCall('GET', endpoint);
      const list: Order[] = Array.isArray(data) ? data : (data ? [data] as any : []);
      // Persistência entre navegações: comparar com última lista conhecida do usuário
      const userKey = currentUser?.usuario ? `last_orders_${currentUser.usuario}` : null;
      let storedIds = new Set<string>();
      if (userKey) {
        try {
          const raw = localStorage.getItem(userKey);
          const parsed: string[] = raw ? JSON.parse(raw) : [];
          storedIds = new Set(parsed || []);
        } catch {}
      }
      const currentIds = list.map(o => o.id);
      const hasNewComparedToStored = currentIds.some(id => !storedIds.has(id));
      if (userKey) {
        try { localStorage.setItem(userKey, JSON.stringify(currentIds)); } catch {}
      }

      // Se houver IDs novos comparado ao estado atual E já houve primeira carga, toca
      setOrders(prev => {
        const prevIds = new Set((prev || []).map(p => p.id));
        const hasNew = list.some(o => !prevIds.has(o.id));
        if (hasLoadedOnceRef.current && hasNew && hasNewComparedToStored) {
          playNotificationSound();
        }
        return list;
      });
      // Marca que o primeiro carregamento já ocorreu para não tocar no initial load
      if (!hasLoadedOnceRef.current) {
        hasLoadedOnceRef.current = true;
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUser?.usuario]);

  const fetchDelivered = useCallback(async () => {
    try {
      const status = encodeURIComponent("Entregue");
      const entregador = currentUser?.usuario ? encodeURIComponent(`*${currentUser.usuario}*`) : "";
      const entregadorFilter = currentUser?.usuario ? `&entregador=ilike.${entregador}` : "";
      const endpoint = `/pedidos_karaiba?select=*&status=eq.${status}${entregadorFilter}&order=data_hora_pedido.desc`;
      const data = await karaibaApiCall('GET', endpoint);
      setDeliveredOrders(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (e) {
      // silencioso
    }
  }, [currentUser?.usuario]);

  useEffect(() => {
    if (currentUser?.usuario) {
      fetchOrders();
      fetchDelivered();
    }
  }, [fetchOrders, fetchDelivered, currentUser?.usuario]);

  // Atualizações quase em tempo real sem recarregar a página
  useEffect(() => {
    if (!currentUser?.usuario) return;
    const intervalId = setInterval(() => {
      fetchOrders(true);
      fetchDelivered();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [currentUser?.usuario, fetchOrders, fetchDelivered]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(true), fetchDelivered()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("delivery_user");
    navigate("/");
  };

  const openDeliverModal = (order: Order) => {
    setSelectedOrder(order);
    setDeliveryCode("");
    setDeliveryStatus("idle");
    setDeliveryMessage("");
    setIsModalOpen(true);
  };

  const openDetailsModal = (order: Order) => {
    setDetailsOrder(order);
    setIsDetailsOpen(true);
  };

  const handleDeliver = async () => {
    if (!selectedOrder || !currentUser?.usuario) return;
    setSubmitting(true);
    try {
      const resp = await fetch("https://zzotech-n8n.lgctvv.easypanel.host/webhook/validarcodigopedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: selectedOrder.id,
          codigo_entrega: deliveryCode.trim(),
          entregador_id: currentUser.usuario,
          timestamp: new Date().toISOString(),
        })
      });
      let payload: any = null;
      try { payload = await resp.clone().json(); } catch {}
      let item = Array.isArray(payload) ? payload[0] : payload;
      let responseText = item?.response as string | undefined;
      if (!responseText) {
        responseText = await resp.text().catch(() => "");
      }

      // Interpretar respostas do webhook
      let isOk = false;
      let msg = "";
      if (typeof responseText === "string") {
        if (responseText.trim() === "Código validado com sucesso") {
          isOk = true;
          msg = responseText;
        } else {
          try {
            const parsed = JSON.parse(responseText);
            if (parsed?.success === false) {
              isOk = false;
              msg = parsed?.message || "Código inválido ou expirado";
            }
          } catch {
            isOk = false;
            msg = responseText || "Código inválido";
          }
        }
      }

      if (!isOk) {
        setDeliveryStatus("error");
        setDeliveryMessage(msg || "Código inválido");
        return;
      }

      setDeliveryStatus("success");
      setDeliveryMessage(msg || "Código validado com sucesso");
      await fetchOrders();
    } catch (err) {
      setDeliveryStatus("error");
      setDeliveryMessage("Não foi possível confirmar a entrega");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-red-700 bg-red-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3 min-h-[56px]">
          <span className="text-lg font-semibold tracking-wide truncate">Karaíba - Entregadores</span>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} disabled={refreshing} className="h-9 rounded-md bg-white text-red-700 hover:bg-white/90 px-3">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={handleLogout} className="h-9 rounded-md bg-white text-red-700 hover:bg-white/90 px-3">
              <span className="hidden sm:inline">Sair</span>
              <span className="sm:hidden">⎋</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel</h1>
          <div />
        </div>

        {(() => {
          const rawName = currentUser?.nome || currentUser?.usuario || "";
          const displayName = rawName
            .toString()
            .trim()
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          return (
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="text-base md:text-lg">
                  Olá, <span className="font-semibold">{displayName}</span> 👋
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">
                  Antes de sair, confira itens, endereço e forma de pagamento. No destino, valide o código de 6 dígitos e registre a entrega.
                </div>
              </CardContent>
            </Card>
          );
        })()}

        <Tabs defaultValue="em-rota" className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-auto">
            <TabsTrigger value="em-rota" className="relative w-full text-center leading-snug pr-10">
              <span className="block">Pedidos para entregar</span>
              <Badge className="absolute right-2 top-1/2 -translate-y-1/2" variant="secondary">{orders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="entregues" className="relative w-full text-center leading-snug pr-10">
              <span className="block">Pedidos entregues</span>
              <Badge className="absolute right-2 top-1/2 -translate-y-1/2" variant="secondary">{deliveredOrders.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="em-rota" className="mt-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Nenhum pedido em entrega no momento.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((o) => (
                  <Card key={o.id} className="flex flex-col cursor-pointer" onClick={() => navigate(`/pedido/${encodeURIComponent(o.id)}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Pedido {o.codigo_pedido ?? "N/A"}</div>
                        <Badge variant="secondary">{o.forma_pagamento ?? "N/A"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm"><span className="text-muted-foreground">Cliente:</span> {o.nome_cliente ?? "Não informado"}</div>
                      <div className="text-base font-semibold">
                        {(() => {
                          const raw = o.valor_total as any;
                          const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(',', '.'));
                          return isNaN(n) ? 'R$ 0,00' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        })()}
                      </div>
                      <div className="text-xs text-muted-foreground">{o.data_hora_pedido ? new Date(o.data_hora_pedido).toLocaleString("pt-BR") : "—"}</div>
                      <div className="pt-2">
                        <Button className="w-full rounded-md" onClick={(e) => { e.stopPropagation(); openDeliverModal(o); }}>
                          Entregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="entregues" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <div className="text-sm text-muted-foreground">Total entregues (30 dias)</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{deliveredOrders.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-sm text-muted-foreground">Hoje</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{deliveredOrders.filter(o => o.data_hora_pedido && new Date(o.data_hora_pedido).toDateString() === new Date().toDateString()).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-sm text-muted-foreground">Esta semana</div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{deliveredOrders.filter(o => {
                    const d = o.data_hora_pedido ? new Date(o.data_hora_pedido) : null;
                    if (!d) return false;
                    const now = new Date();
                    const weekAgo = new Date(now);
                    weekAgo.setDate(now.getDate() - 7);
                    return d >= weekAgo && d <= now;
                  }).length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="text-sm text-muted-foreground">Pedidos entregues por dia (últimos 14 dias)</div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const byDay = new Map<string, number>();
                      const now = new Date();
                      for (let i = 13; i >= 0; i--) {
                        const d = new Date(now);
                        d.setDate(now.getDate() - i);
                        d.setHours(0,0,0,0);
                        byDay.set(d.toLocaleDateString('pt-BR'), 0);
                      }
                      deliveredOrders.forEach(o => {
                        if (!o.data_hora_pedido) return;
                        const key = new Date(o.data_hora_pedido).toLocaleDateString('pt-BR');
                        if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + 1);
                      });
                      return Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm text-muted-foreground">Bairros mais entregues</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const counts = new Map<string, number>();
                    const getBairro = (o: any) => o.bairro || o.endereco_bairro || (typeof o.endereco_completo === 'string' ? (o.endereco_completo.split('-').pop() || '').trim() : '');
                    deliveredOrders.forEach(o => {
                      const b = (getBairro(o) || 'Não informado').toString();
                      counts.set(b, (counts.get(b) || 0) + 1);
                    });
                    const list = Array.from(counts.entries()).sort((a,b) => b[1]-a[1]).slice(0, 8);
                    if (list.length === 0) return <div className="text-sm text-muted-foreground">Sem dados suficientes.</div>;
                    return list.map(([bairro, qtd]) => (
                      <div key={bairro} className="flex items-center justify-between border rounded-md px-3 py-2">
                        <div className="text-sm truncate max-w-[70%]">{bairro}</div>
                        <div className="text-sm font-medium">{qtd}</div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-[92vw] sm:w-auto sm:max-w-md rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>Confirmar Entrega</DialogTitle>
              <DialogDescription>
                Digite o código para confirmar a entrega deste pedido.
              </DialogDescription>
            </DialogHeader>
            {deliveryStatus === "success" ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div className="text-base font-medium">{deliveryMessage || "Código validado com sucesso"}</div>
                <Button
                  className="rounded-md"
                  onClick={() => { setIsModalOpen(false); setSelectedOrder(null); setDeliveryCode(""); setDeliveryStatus("idle"); setDeliveryMessage(""); }}
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Pedido: <span className="font-medium">{selectedOrder?.codigo_pedido ?? selectedOrder?.id}</span>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="codigo">Código de Entrega</Label>
                    <Input
                      id="codigo"
                      placeholder="Digite o código"
                      value={deliveryCode}
                      onChange={(e) => setDeliveryCode(e.target.value)}
                      disabled={submitting}
                    />
                    <div className="text-xs text-muted-foreground">Dica: Solicitar código de 6 dígitos enviado via WhatsApp para o cliente.</div>
                    {deliveryStatus === "error" && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <XCircle className="h-4 w-4" />
                        <span>{deliveryMessage || "Código inválido"}</span>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleDeliver} disabled={submitting || !deliveryCode.trim()} className="rounded-md">
                    {submitting ? "Enviando..." : "Confirmar"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Detalhes do pedido com mini mapa e links de rota */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
              <DialogDescription>
                Verifique itens, endereço e rota antes de sair.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Pedido</div>
                  <div className="text-base font-medium">{detailsOrder?.codigo_pedido ?? detailsOrder?.id}</div>
                  <div className="text-sm text-muted-foreground">Cliente</div>
                  <div className="text-base">{detailsOrder?.nome_cliente ?? "—"}</div>
                  <div className="text-sm text-muted-foreground">Endereço</div>
                  <div className="text-base break-words">{detailsOrder?.endereco_completo ?? "—"}</div>
                  <div className="flex gap-3 pt-2">
                    {detailsOrder?.endereco_completo && (
                      <>
                        <a
                          className="text-sm underline"
                          target="_blank"
                          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("Restaurante Karaíba, Uberlândia - MG")}&destination=${encodeURIComponent(detailsOrder.endereco_completo)}`}
                          rel="noreferrer"
                        >
                          Abrir no Google Maps
                        </a>
                        <a
                          className="text-sm underline"
                          target="_blank"
                          href={`https://waze.com/ul?q=${encodeURIComponent(detailsOrder.endereco_completo)}`}
                          rel="noreferrer"
                        >
                          Abrir no Waze
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  {detailsOrder?.endereco_completo && (
                    <MiniRouteMap destinationAddress={detailsOrder.endereco_completo} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Forma de pagamento</div>
                  <div className="text-base font-medium">{detailsOrder?.forma_pagamento ?? "—"}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Valor total</div>
                  <div className="text-base font-medium">
                    {(() => {
                      const raw = detailsOrder?.valor_total as any;
                      const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(',', '.'));
                      return isNaN(n) ? 'R$ 0,00' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    })()}
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="text-base font-medium">{detailsOrder?.status ?? "—"}</div>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <div className="text-sm font-medium mb-2">Itens do pedido</div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {detailsOrder?.itens || "—"}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
};

export default Painel;

