import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import karaibaLogo from "@/assets/karaiba-logo-original.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Se já estiver logado, ir para o painel
  useEffect(() => {
    const savedUser = localStorage.getItem("delivery_user");
    if (savedUser) {
      navigate("/painel");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Autenticação via webhook (sem Supabase). Sucesso se status 2xx.
      const webhookResponse = await fetch("https://zzotech-n8n.lgctvv.easypanel.host/webhook/loginentregadro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: email.trim(),
          senha: password.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      // Processar resposta do webhook e exigir confirmação explícita de sucesso
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
        toast({
          title: "Erro no login",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      // Salvar dados do usuário no localStorage (escopo entregadores)
      localStorage.setItem("delivery_user", JSON.stringify({
        usuario: payload?.usuario || email.trim(),
        nome: payload?.nome || email.trim(),
        telefone: payload?.telefone || null,
        autenticado_em: new Date().toISOString(),
      }));
      
      toast({
        title: "Login realizado com sucesso!",
        description: payload?.mensagem || `Bem-vindo, ${payload?.usuario || email.trim()}`,
      });
      
      // Login realizado; ir para o painel
      navigate("/painel");
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no sistema",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-600 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img 
              src={karaibaLogo} 
              alt="Karaíba Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            Delivery Karaiba
          </h1>
          <p className="text-muted-foreground">
            Faça login para acessar o sistema
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white text-base" 
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;