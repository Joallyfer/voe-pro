import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calculator } from "lucide-react";

interface Produto {
  id: string;
  nome_produto: string;
  preco_de_venda: number;
  comissao_percentual: number;
  preco_final: number;
  entrada_valor: number;
  valor_financiado: number;
  parcela_valor: number;
  parcelas_qtd: number;
  valor_total_financiado: number;
}

interface ParametrosGlobais {
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
}

const CriarProposta = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [parametros, setParametros] = useState<ParametrosGlobais | null>(null);
  const [selectedProdutoId, setSelectedProdutoId] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [precoFinalAplicado, setPrecoFinalAplicado] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchProdutos();
    fetchParametros();
  }, []);

  useEffect(() => {
    const produtoId = searchParams.get("produto");
    if (produtoId) {
      setSelectedProdutoId(produtoId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedProdutoId) {
      const produto = produtos.find(p => p.id === selectedProdutoId);
      if (produto) {
        setProdutoSelecionado(produto);
        setPrecoFinalAplicado(produto.preco_final);
      }
    }
  }, [selectedProdutoId, produtos]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchProdutos = async () => {
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("nome_produto");
    setProdutos(data || []);
  };

  const fetchParametros = async () => {
    const { data } = await supabase
      .from("parametros_globais")
      .select("*")
      .single();
    setParametros(data);
  };

  const calcularFinanciamento = () => {
    if (!produtoSelecionado || !parametros) return null;

    const entrada = precoFinalAplicado * parametros.percentual_entrada_padrao;
    const valorFinanciado = precoFinalAplicado - entrada;
    const parcelas = produtoSelecionado.parcelas_qtd;
    const jurosMensal = parametros.juros_parcelamento_mensal;

    // Cálculo com juros compostos
    const fatorJuros = Math.pow(1 + jurosMensal, parcelas);
    const parcelaValor = (valorFinanciado * jurosMensal * fatorJuros) / (fatorJuros - 1);
    const totalFinanciado = parcelaValor * parcelas;

    return {
      entrada,
      valorFinanciado,
      parcelaValor,
      parcelas,
      totalFinanciado,
    };
  };

  const calcularCartao = () => {
    if (!parametros) return [];

    const opcoes = [];
    for (let i = 1; i <= 12; i++) {
      const taxaKey = `taxa_cartao_${i}x_percentual` as keyof ParametrosGlobais;
      const taxa = parametros[taxaKey] as number;
      const totalCartao = precoFinalAplicado * (1 + taxa);
      const parcelaCartao = totalCartao / i;
      opcoes.push({
        parcelas: i,
        valorParcela: parcelaCartao,
        valorTotal: totalCartao,
      });
    }
    return opcoes;
  };

  const gerarLinkPublico = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent, tipoPagamento: "financiamento" | "cartao") => {
    e.preventDefault();
    
    if (!produtoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const financiamento = calcularFinanciamento();
    if (!financiamento) return;

    const comissaoValor = precoFinalAplicado * produtoSelecionado.comissao_percentual;
    const linkPublico = gerarLinkPublico();

    const { data, error } = await supabase
      .from("propostas")
      .insert({
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_email: clienteEmail,
        produto_id: produtoSelecionado.id,
        produto_nome: produtoSelecionado.nome_produto,
        preco_final_aplicado: precoFinalAplicado,
        entrada_valor: financiamento.entrada,
        parcelas_qtd: financiamento.parcelas,
        parcela_valor: financiamento.parcelaValor,
        total_financiado: financiamento.totalFinanciado,
        comissao_percentual: produtoSelecionado.comissao_percentual,
        comissao_valor: comissaoValor,
        link_publico: linkPublico,
        tipo_pagamento: tipoPagamento,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar proposta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Proposta criada com sucesso!",
        description: "Copiando link público...",
      });
      
      const urlPublica = `${window.location.origin}/proposta/${linkPublico}`;
      navigator.clipboard.writeText(urlPublica);
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }

    setLoading(false);
  };

  const financiamento = calcularFinanciamento();
  const opcoesCartao = calcularCartao();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Criar Nova Proposta</h1>
          <p className="text-muted-foreground">Preencha os dados do cliente e selecione o produto</p>
        </div>

        <div className="grid gap-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Produto */}
          <Card>
            <CardHeader>
              <CardTitle>Produto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="produto">Selecione o Produto *</Label>
                <Select value={selectedProdutoId} onValueChange={setSelectedProdutoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome_produto} - R$ {produto.preco_final.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {produtoSelecionado && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="preco">Preço Final (ajustável)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={precoFinalAplicado}
                      onChange={(e) => setPrecoFinalAplicado(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  {/* Simulações */}
                  <Card className="mt-4 bg-secondary/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Simulações de Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="financiamento">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="financiamento">Entrada + Financiamento</TabsTrigger>
                          <TabsTrigger value="cartao">Cartão de Crédito</TabsTrigger>
                        </TabsList>

                        <TabsContent value="financiamento" className="space-y-4">
                          {financiamento && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Entrada ({(parametros?.percentual_entrada_padrao || 0) * 100}%)</p>
                                  <p className="text-2xl font-bold text-primary">
                                    R$ {financiamento.entrada.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Valor Financiado</p>
                                  <p className="text-2xl font-bold">
                                    R$ {financiamento.valorFinanciado.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Parcelas</p>
                                  <p className="text-xl font-bold">
                                    {financiamento.parcelas}x de R$ {financiamento.parcelaValor.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Financiado</p>
                                  <p className="text-xl font-bold">
                                    R$ {financiamento.totalFinanciado.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                className="w-full mt-4" 
                                onClick={(e) => handleSubmit(e, "financiamento")}
                                disabled={loading || !clienteNome}
                              >
                                {loading ? "Gerando..." : "Gerar Proposta com Financiamento"}
                              </Button>
                            </>
                          )}
                        </TabsContent>

                        <TabsContent value="cartao" className="space-y-2">
                          <div className="grid gap-2 max-h-96 overflow-y-auto">
                            {opcoesCartao.map((opcao) => (
                              <div 
                                key={opcao.parcelas}
                                className="flex justify-between items-center p-3 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                              >
                                <span className="font-medium">{opcao.parcelas}x</span>
                                <div className="text-right">
                                  <p className="font-bold">R$ {opcao.valorParcela.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Total: R$ {opcao.valorTotal.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full mt-4" 
                            onClick={(e) => handleSubmit(e, "cartao")}
                            disabled={loading || !clienteNome}
                          >
                            {loading ? "Gerando..." : "Gerar Proposta com Cartão"}
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CriarProposta;