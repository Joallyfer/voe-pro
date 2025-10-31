import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Proposta {
  id: string;
  cliente_nome: string;
  produto_nome: string;
  preco_final_aplicado: number;
  entrada_valor: number;
  parcelas_qtd: number;
  parcela_valor: number;
  total_financiado: number;
  data_criacao: string;
  validade_dias: number;
  tipo_pagamento: string;
}

const PropostaPublica = () => {
  const { linkPublico } = useParams();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [parametros, setParametros] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposta();
    fetchParametros();
  }, [linkPublico]);

  const fetchProposta = async () => {
    const { data, error } = await supabase
      .from("propostas")
      .select("*")
      .eq("link_publico", linkPublico)
      .single();

    if (!error && data) {
      setProposta(data);
    }
    setLoading(false);
  };

  const fetchParametros = async () => {
    const { data } = await supabase
      .from("parametros_globais")
      .select("*")
      .single();
    setParametros(data);
  };

  const formatarData = (data: string, dias: number) => {
    const dataInicial = new Date(data);
    const dataValidade = new Date(dataInicial);
    dataValidade.setDate(dataValidade.getDate() + dias);
    return dataValidade.toLocaleDateString("pt-BR");
  };

  const abrirWhatsApp = () => {
    const mensagem = encodeURIComponent(
      `Olá! Gostaria de mais informações sobre a proposta do ${proposta?.produto_nome}`
    );
    window.open(`https://wa.me/5511999999999?text=${mensagem}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
        <p className="text-muted-foreground">Carregando proposta...</p>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Proposta não encontrada</h2>
            <p className="text-muted-foreground">
              O link que você acessou não é válido ou a proposta foi removida.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
            VOE CNC
          </h1>
          <p className="text-muted-foreground">Tecnologia em Corte e Gravação a Laser</p>
        </div>

        {/* Proposta Principal */}
        <Card className="mb-6 border-primary/20 shadow-gold">
          <CardHeader className="border-b border-border">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-1">Proposta Comercial</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cliente: <span className="font-semibold text-foreground">{proposta.cliente_nome}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Válida até</p>
                <p className="font-bold text-primary">
                  {formatarData(proposta.data_criacao, proposta.validade_dias)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Produto */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">{proposta.produto_nome}</h3>
            </div>

            {/* Preço À Vista */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Preço à vista</p>
              <p className="text-4xl font-bold text-primary">
                R$ {proposta.preco_final_aplicado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Condição Parcelada */}
            {proposta.tipo_pagamento === "financiamento" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b border-border pb-2">
                  Condição Parcelada com Entrada
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Entrada</p>
                    <p className="text-2xl font-bold text-foreground">
                      R$ {proposta.entrada_valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Saldo Financiado</p>
                    <p className="text-2xl font-bold text-foreground">
                      R$ {(proposta.preco_final_aplicado - proposta.entrada_valor).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Parcelas</p>
                    <p className="text-xl font-bold text-primary">
                      {proposta.parcelas_qtd}x de R$ {proposta.parcela_valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Valor Total Financiado</p>
                    <p className="text-xl font-bold text-foreground">
                      R$ {proposta.total_financiado.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Condições e Observações */}
            {parametros?.observacao_condicoes_comerciais && (
              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-semibold mb-2 text-sm">Condições Comerciais</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {parametros.observacao_condicoes_comerciais}
                </p>
              </div>
            )}

            {/* Botão WhatsApp */}
            <Button 
              size="lg" 
              className="w-full shadow-gold mt-6"
              onClick={abrirWhatsApp}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar agora no WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 VOE CNC - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default PropostaPublica;