import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import karaibaLogo from "@/assets/karaiba-logo-original.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar na tabela usuarios_painel_karaiba
      const { data: user, error } = await supabase
        .from("usuarios_painel_karaiba")
        .select("*")
        .eq("usuario", email)
        .eq("senha", password)
        .single();

      if (error || !user) {
        toast({
          title: "Erro no login",
          description: "Usuário ou senha incorretos",
          variant: "destructive",
        });
        return;
      }

      // Salvar dados do usuário no localStorage
      localStorage.setItem("karaiba_user", JSON.stringify(user));
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.usuario}`,
      });
      
      navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img 
              src={karaibaLogo} 
              alt="Karaíba Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            Painel Administrativo
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
                className="rounded-md"
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
                className="rounded-md"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-md" 
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