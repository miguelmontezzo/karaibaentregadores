import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const slides = [
  {
    title: "Agora o Karaíba tem um app para gerenciar as entregas",
    description:
      "Mais facilidade e segurança para o cliente e para você entregador.",
  },
  {
    title: "Confira todos os detalhes antes de sair",
    description:
      "Revise itens do pedido e forma de pagamento ainda no restaurante.",
  },
  {
    title: "Boas entregas!",
    description:
      "Estamos juntos para tornar seu dia mais ágil e seguro.",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("delivery_user");
    if (savedUser) navigate("/painel");
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const webhookResponse = await fetch("https://zzotech-n8n.lgctvv.easypanel.host/webhook/loginentregadro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: email.trim(),
          senha: password.trim(),
          timestamp: new Date().toISOString(),
        }),
      });
      let webhookData: any = null;
      let rawText = "";
      if (webhookResponse.ok) {
        try {
          webhookData = await webhookResponse.clone().json();
        } catch {
          rawText = await webhookResponse.text().catch(() => "");
        }
      } else {
        rawText = await webhookResponse.text().catch(() => "");
      }
      const payload = Array.isArray(webhookData) ? webhookData[0] : webhookData;
      const statusValue = (payload?.status ?? "").toString().toLowerCase();
      const isSuccess = webhookResponse.ok && statusValue === "sucesso";
      if (!isSuccess) {
        const errorMsg = payload?.mensagem || rawText || `Falha no webhook (${webhookResponse.status})`;
        toast({ title: "Erro no login", description: errorMsg, variant: "destructive" });
        return;
      }
      localStorage.setItem("delivery_user", JSON.stringify({
        usuario: payload?.usuario || email.trim(),
        nome: payload?.nome || email.trim(),
        telefone: payload?.telefone || null,
        autenticado_em: new Date().toISOString(),
      }));
      toast({ title: "Login realizado com sucesso!", description: payload?.mensagem || `Bem-vindo, ${payload?.usuario || email.trim()}` });
      navigate("/painel");
    } catch (error) {
      toast({ title: "Erro no sistema", description: "Tente novamente mais tarde", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Topo vermelho ocupando cerca de 45% da tela */}
      <div className="bg-red-600 text-white px-6 pt-12 pb-8 flex flex-col items-center justify-start">
        <img src="/Karaiba%20branco%20t-%20Oclo.png" alt="Karaíba" className="h-20 md:h-16 w-auto mb-4" />
        <div className="text-lg font-semibold tracking-wide mb-3 text-center">App Entregadores Karaíba</div>
        <div className="w-full max-w-md">
          <Carousel
            className="w-full"
            opts={{ align: "start", loop: false }}
            setApi={(api) => {
              api?.on("select", () => setCurrent(api.selectedScrollSnap()));
              setCurrent(api.selectedScrollSnap());
            }}
          >
            <CarouselContent>
              {slides.map((s, idx) => (
                <CarouselItem key={idx}>
                  <div className="text-center space-y-1 px-2">
                    <h1 className="text-xl font-bold leading-snug">{s.title}</h1>
                    <p className="text-sm/6 opacity-90">{s.description}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex items-center justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === current ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Área branca com login */}
      <div className="flex-1 w-full px-6 py-6 flex items-start justify-center">
        <div className="w-full max-w-md">
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Usuário</Label>
              <Input
                id="email"
                type="text"
                placeholder="Digite seu usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12 text-base"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-12 text-base"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>

      {/* Rodapé */}
      <div className="px-6 pb-6 flex items-center justify-center">
        <span className="text-xs text-neutral-400 mr-2">Desenvolvido por:</span>
        <img src="/alliacinzaass@2x.png" alt="Allia" className="h-5 w-auto opacity-60" />
      </div>
    </div>
  );
};

export default Onboarding;

