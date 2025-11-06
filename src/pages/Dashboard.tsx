import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Settings, FileText } from "lucide-react";

interface Produto {
  id: string;
  nome_produto: string;
  preco_final: number;
  parcelas_qtd: number;
  parcela_valor: number;
  ativo: boolean;
  fotos?: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchProdutos();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchProdutos = async () => {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("nome_produto");

    if (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProdutos(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            VOE CNC
          </h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/produtos")}>
              <Settings className="mr-2 h-4 w-4" />
              Produtos
            </Button>
            <Button variant="secondary" onClick={() => navigate("/configuracoes")}>
              <Settings className="mr-2 h-4 w-4" />
              Financeiro
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard Comercial</h2>
            <p className="text-muted-foreground">Gerencie suas propostas e produtos</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => navigate("/criar-proposta")}
            className="shadow-gold"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova Proposta
          </Button>
        </div>

        {/* Produtos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Carregando produtos...</p>
              </CardContent>
            </Card>
          ) : produtos.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum produto cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            produtos.map((produto) => (
              <Card 
                key={produto.id} 
                className="border-border hover:border-primary transition-all duration-300 hover:shadow-gold cursor-pointer overflow-hidden"
                onClick={() => navigate(`/criar-proposta?produto=${produto.id}`)}
              >
                {produto.fotos && produto.fotos.length > 0 && (
                  <div className="w-full h-48 overflow-hidden bg-muted">
                    <img 
                      src={produto.fotos[0]} 
                      alt={produto.nome_produto}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{produto.nome_produto}</CardTitle>
                  <CardDescription>Clique para criar proposta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Preço Final:</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {produto.preco_final.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Parcela:</span>
                    <span className="font-semibold">
                      {produto.parcelas_qtd}x de R$ {produto.parcela_valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;