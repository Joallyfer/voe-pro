import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

interface ParametrosGlobais {
  id: string;
  taxa_cartao_1x_percentual: number;
  taxa_cartao_2x_percentual: number;
  taxa_cartao_3x_percentual: number;
  taxa_cartao_4x_percentual: number;
  taxa_cartao_5x_percentual: number;
  taxa_cartao_6x_percentual: number;
  taxa_cartao_7x_percentual: number;
  taxa_cartao_8x_percentual: number;
  taxa_cartao_9x_percentual: number;
  taxa_cartao_10x_percentual: number;
  taxa_cartao_11x_percentual: number;
  taxa_cartao_12x_percentual: number;
  percentual_entrada_padrao: number;
  juros_parcelamento_mensal: number;
  politica_arredondamento: string;
  observacao_condicoes_comerciais: string;
}

const Configuracoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parametros, setParametros] = useState<ParametrosGlobais | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchParametros();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchParametros = async () => {
    const { data } = await supabase
      .from("parametros_globais")
      .select("*")
      .single();

    if (data) {
      setParametros(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!parametros) return;

    const { error } = await supabase
      .from("parametros_globais")
      .update(parametros)
      .eq("id", parametros.id);

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Configurações salvas com sucesso!",
      });
    }
  };

  const updateParametro = (campo: keyof ParametrosGlobais, valor: any) => {
    if (!parametros) return;
    setParametros({
      ...parametros,
      [campo]: valor,
    });
  };

  if (loading || !parametros) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Configurações Financeiras</h1>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Taxas de Cartão */}
        <Card>
          <CardHeader>
            <CardTitle>Taxas de Cartão de Crédito</CardTitle>
            <CardDescription>Percentuais para cada modalidade de parcelamento</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => {
              const parcela = i + 1;
              const campo = `taxa_cartao_${parcela}x_percentual` as keyof ParametrosGlobais;
              return (
                <div key={parcela}>
                  <Label htmlFor={`taxa-${parcela}x`}>{parcela}x</Label>
                  <Input
                    id={`taxa-${parcela}x`}
                    type="number"
                    step="0.0001"
                    value={parametros[campo] as number}
                    onChange={(e) => updateParametro(campo, parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {((parametros[campo] as number) * 100).toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Configurações de Financiamento */}
        <Card>
          <CardHeader>
            <CardTitle>Financiamento Interno</CardTitle>
            <CardDescription>Parâmetros para cálculo de entrada e parcelamento</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entrada">Percentual de Entrada Padrão</Label>
                <Input
                  id="entrada"
                  type="number"
                  step="0.01"
                  value={parametros.percentual_entrada_padrao}
                  onChange={(e) => updateParametro("percentual_entrada_padrao", parseFloat(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(parametros.percentual_entrada_padrao * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <Label htmlFor="juros">Juros Mensal de Parcelamento</Label>
                <Input
                  id="juros"
                  type="number"
                  step="0.001"
                  value={parametros.juros_parcelamento_mensal}
                  onChange={(e) => updateParametro("juros_parcelamento_mensal", parseFloat(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(parametros.juros_parcelamento_mensal * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="arredondamento">Política de Arredondamento</Label>
              <Input
                id="arredondamento"
                value={parametros.politica_arredondamento || ""}
                onChange={(e) => updateParametro("politica_arredondamento", e.target.value)}
                placeholder="Ex: terminar em .990"
              />
            </div>
          </CardContent>
        </Card>

        {/* Observações Comerciais */}
        <Card>
          <CardHeader>
            <CardTitle>Condições Comerciais</CardTitle>
            <CardDescription>
              Texto que aparecerá nas propostas enviadas aos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={parametros.observacao_condicoes_comerciais || ""}
              onChange={(e) => updateParametro("observacao_condicoes_comerciais", e.target.value)}
              rows={6}
              placeholder="Digite as condições comerciais, validade, garantias, etc."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={handleSave}>
            <Save className="mr-2 h-5 w-5" />
            Salvar Todas as Configurações
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;