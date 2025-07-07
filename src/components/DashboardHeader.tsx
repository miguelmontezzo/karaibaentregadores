import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw } from "lucide-react";
import karaibaWhiteLogo from "@/assets/karaiba-logo-white.png";

interface DashboardHeaderProps {
  user: any;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

const DashboardHeader = ({ user, isRefreshing, onRefresh, onLogout }: DashboardHeaderProps) => {
  return (
    <header className="shadow-md bg-red-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between bg-red-700">
        <div className="flex items-center space-x-4">
          <img src={karaibaWhiteLogo} alt="Karaíba" className="h-8 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">
              Painel de Pedidos
            </h1>
            <p className="text-xs text-primary-foreground/80">
              Bem-vindo, {user?.usuario}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-primary-foreground/20 text-xs py-1 h-7 bg-white/[0.98] text-red-900"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout} 
            className="border-primary-foreground/20 text-xs py-1 h-7 bg-white/[0.98] text-red-900"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;