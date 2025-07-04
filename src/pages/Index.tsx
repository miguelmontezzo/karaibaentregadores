import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import karaibaLogo from "@/assets/karaiba-logo-original.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário já está logado
    const savedUser = localStorage.getItem("karaiba_user");
    if (savedUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <img 
            src={karaibaLogo} 
            alt="Karaíba Logo" 
            className="h-24 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-primary mb-4">
            Painel Administrativo Karaíba
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sistema de gestão de pedidos em tempo real
          </p>
        </div>
        
        <Button 
          onClick={() => navigate("/login")} 
          size="lg"
          className="w-full rounded-md"
        >
          Acessar Painel
        </Button>
      </div>
    </div>
  );
};

export default Index;
