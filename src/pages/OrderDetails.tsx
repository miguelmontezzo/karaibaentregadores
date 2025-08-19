import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import MiniRouteMap from "@/components/MiniRouteMap";
import { karaibaApiCall } from "@/integrations/supabase/restKaraiba";

type Order = {
  id: string;
  status: string | null;
  codigo_pedido?: string | null;
  nome_cliente?: string | null;
  data_hora_pedido?: string | null;
  valor_total?: string | number | null;
  forma_pagamento?: string | null;
  endereco_completo?: string | null;
  itens?: string | null;
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ usuario: string; nome?: string | null } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<"idle" | "success" | "error">("idle");
  const [deliveryMessage, setDeliveryMessage] = useState("");

  useEffect(() => {
    // carrega usuário logado
    try {
      const saved = localStorage.getItem("delivery_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentUser({ usuario: parsed?.usuario, nome: parsed?.nome });
      }
    } catch {}

    (async () => {
      try {
        const data = await karaibaApiCall(
          "GET",
          `/pedidos_karaiba?select=*&id=eq.${encodeURIComponent(String(id))}&limit=1`
        );
        const row = Array.isArray(data) ? data[0] : data;
        setOrder(row || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const valorTotal = useMemo(() => {
    const raw = order?.valor_total as any;
    const n = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(",", "."));
    return isNaN(n)
      ? "R$ 0,00"
      : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }, [order?.valor_total]);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!order) return <div className="p-6">Pedido não encontrado.</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-red-700 bg-red-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3 min-h-[56px]">
          <span className="text-lg font-semibold tracking-wide">Karaíba - Entregadores</span>
          <Button variant="secondary" className="bg-white text-red-700 hover:bg-white/90 h-9 rounded-md" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <div className="text-xl font-semibold">Pedido {order.codigo_pedido ?? order.id}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="text-sm text-muted-foreground">Informações</div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><span className="text-muted-foreground">Cliente: </span>{order.nome_cliente ?? "—"}</div>
              <div><span className="text-muted-foreground">Endereço: </span>{order.endereco_completo ?? "—"}</div>
              {order as any && (
                <div><span className="text-muted-foreground">Bairro: </span>{(order as any).bairro ?? "—"}</div>
              )}
              <div><span className="text-muted-foreground">Pagamento: </span>{order.forma_pagamento ?? "—"}</div>
              <div><span className="text-muted-foreground">Valor total: </span><span className="font-medium">{valorTotal}</span></div>
              <div><span className="text-muted-foreground">Status: </span>{order.status ?? "—"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-sm text-muted-foreground">Rota</div>
            </CardHeader>
            <CardContent>
              {order.endereco_completo ? (
                <MiniRouteMap destinationAddress={order.endereco_completo} height={240} />
              ) : (
                <div className="text-sm text-muted-foreground">Sem endereço</div>
              )}
              {order.endereco_completo && (
                <div className="flex gap-3 mt-3">
                  <a
                    className="text-sm underline"
                    target="_blank"
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("Restaurante Karaíba, Uberlândia - MG")}&destination=${encodeURIComponent(order.endereco_completo)}`}
                    rel="noreferrer"
                  >
                    Abrir no Google Maps
                  </a>
                  <a
                    className="text-sm underline"
                    target="_blank"
                    href={`https://waze.com/ul?q=${encodeURIComponent(order.endereco_completo)}`}
                    rel="noreferrer"
                  >
                    Abrir no Waze
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="text-sm text-muted-foreground">Itens do pedido</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap break-words">{order.itens || "—"}</div>
          </CardContent>
        </Card>

        <div className="pt-2">
          <Button className="w-full h-12 rounded-xl bg-red-700 hover:bg-red-800 text-white" onClick={() => { setIsModalOpen(true); setDeliveryCode(""); setDeliveryStatus("idle"); setDeliveryMessage(""); }}>
            Entregar
          </Button>
        </div>
      </div>

      {/* Modal de confirmação de entrega (mesma lógica do Painel) */}
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
                onClick={() => { setIsModalOpen(false); setDeliveryCode(""); setDeliveryStatus("idle"); setDeliveryMessage(""); }}
              >
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Pedido: <span className="font-medium">{order.codigo_pedido ?? order.id}</span>
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
                <Button onClick={async () => {
                  if (!order || !currentUser?.usuario) return;
                  setSubmitting(true);
                  try {
                    const resp = await fetch("https://zzotech-n8n.lgctvv.easypanel.host/webhook/validarcodigopedido", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        pedido_id: order.id,
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

                    // Interpretar respostas
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
                            msg = parsed?.message || "Código inválido";
                          } else if (parsed?.message) {
                            isOk = true;
                            msg = parsed.message;
                          }
                        } catch {
                          isOk = resp.ok;
                          msg = responseText || (resp.ok ? "Confirmado" : "Falha ao confirmar");
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
                  } catch (e) {
                    setDeliveryStatus("error");
                    setDeliveryMessage("Não foi possível confirmar a entrega");
                  } finally {
                    setSubmitting(false);
                  }
                }} disabled={submitting || !deliveryCode.trim()} className="rounded-md">
                  {submitting ? "Enviando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

