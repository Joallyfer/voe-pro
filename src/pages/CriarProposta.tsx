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
import { formatCurrency } from "@/lib/utils";

interface Produto {
  id: string;
  nome_produto: string;
  custo_base: number;
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
  taxa_cartao_13x_percentual: number;
  taxa_cartao_14x_percentual: number;
  taxa_cartao_15x_percentual: number;
  taxa_cartao_16x_percentual: number;
  taxa_cartao_17x_percentual: number;
  taxa_cartao_18x_percentual: number;
  taxa_cartao_19x_percentual: number;
  taxa_cartao_20x_percentual: number;
  taxa_cartao_21x_percentual: number;
  taxa_cartao_22x_percentual: number;
  taxa_cartao_23x_percentual: number;
  taxa_cartao_24x_percentual: number;
  percentual_entrada_padrao: number;
  juros_parcelamento_mensal: number;
  juros_12x_percentual: number;
  juros_18x_percentual: number;
  juros_24x_percentual: number;
  plano_30_markup_percentual: number;
  plano_40_markup_percentual: number;
  plano_50_markup_percentual: number;
  taxa_custo_empresa_debito: number;
  taxa_custo_empresa_1x: number;
  taxa_custo_empresa_2x: number;
  taxa_custo_empresa_3x: number;
  taxa_custo_empresa_4x: number;
  taxa_custo_empresa_5x: number;
  taxa_custo_empresa_6x: number;
  taxa_custo_empresa_7x: number;
  taxa_custo_empresa_8x: number;
  taxa_custo_empresa_9x: number;
  taxa_custo_empresa_10x: number;
  taxa_custo_empresa_11x: number;
  taxa_custo_empresa_12x: number;
  taxa_custo_empresa_13x: number;
  taxa_custo_empresa_14x: number;
  taxa_custo_empresa_15x: number;
  taxa_custo_empresa_16x: number;
  taxa_custo_empresa_17x: number;
  taxa_custo_empresa_18x: number;
  taxa_custo_empresa_19x: number;
  taxa_custo_empresa_20x: number;
  taxa_custo_empresa_21x: number;
  taxa_custo_empresa_22x: number;
  taxa_custo_empresa_23x: number;
  taxa_custo_empresa_24x: number;
  taxa_repassada_cliente_debito: number;
  taxa_repassada_cliente_1x: number;
  taxa_repassada_cliente_2x: number;
  taxa_repassada_cliente_3x: number;
  taxa_repassada_cliente_4x: number;
  taxa_repassada_cliente_5x: number;
  taxa_repassada_cliente_6x: number;
  taxa_repassada_cliente_7x: number;
  taxa_repassada_cliente_8x: number;
  taxa_repassada_cliente_9x: number;
  taxa_repassada_cliente_10x: number;
  taxa_repassada_cliente_11x: number;
  taxa_repassada_cliente_12x: number;
  taxa_repassada_cliente_13x: number;
  taxa_repassada_cliente_14x: number;
  taxa_repassada_cliente_15x: number;
  taxa_repassada_cliente_16x: number;
  taxa_repassada_cliente_17x: number;
  taxa_repassada_cliente_18x: number;
  taxa_repassada_cliente_19x: number;
  taxa_repassada_cliente_20x: number;
  taxa_repassada_cliente_21x: number;
  taxa_repassada_cliente_22x: number;
  taxa_repassada_cliente_23x: number;
  taxa_repassada_cliente_24x: number;
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
  const [planoEscolhido, setPlanoEscolhido] = useState<"30" | "40" | "50">("40");
  const [comissaoEscolhida, setComissaoEscolhida] = useState<"0.005" | "0.01" | "0.015">("0.01");
  const [numeroParcelas, setNumeroParcelas] = useState<12 | 18 | 24>(24);
  const [parcelasCartaoSelecionadas, setParcelasCartaoSelecionadas] = useState<number>(1);
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

  const calcularPrecoFinal = () => {
    if (!produtoSelecionado || !parametros) return 0;

    const markupKey = `plano_${planoEscolhido}_markup_percentual` as keyof ParametrosGlobais;
    const markup = parametros[markupKey] as number;
    
    const precoComLucro = produtoSelecionado.preco_final * (1 + markup);
    const valorComissao = precoComLucro * parseFloat(comissaoEscolhida);
    const precoSemImpostos = precoComLucro + valorComissao;
    
    // Adicionar 10% de impostos ao preço final
    const precoFinal = precoSemImpostos * 1.10;
    
    return precoFinal;
  };

  const calcularFinanciamento = () => {
    if (!produtoSelecionado || !parametros) return null;

    const precoFinal = calcularPrecoFinal();
    const entrada = precoFinal * 0.30; // Entrada sempre 30%
    const valorFinanciado = precoFinal - entrada;
    
    // Selecionar a taxa de juros baseada no número de parcelas
    let jurosMensal = parametros.juros_parcelamento_mensal;
    if (numeroParcelas === 12) {
      jurosMensal = parametros.juros_12x_percentual;
    } else if (numeroParcelas === 18) {
      jurosMensal = parametros.juros_18x_percentual;
    } else if (numeroParcelas === 24) {
      jurosMensal = parametros.juros_24x_percentual;
    }

    // Cálculo com juros compostos
    const fatorJuros = Math.pow(1 + jurosMensal, numeroParcelas);
    const parcelaValor = (valorFinanciado * jurosMensal * fatorJuros) / (fatorJuros - 1);
    const totalFinanciado = parcelaValor * numeroParcelas;

    return {
      precoFinal,
      entrada,
      valorFinanciado,
      parcelaValor,
      parcelas: numeroParcelas,
      totalFinanciado,
      jurosMensal,
    };
  };

  const calcularCartao = () => {
    if (!parametros) return [];

    const precoFinal = calcularPrecoFinal();
    const opcoes = [];
    for (let i = 1; i <= 24; i++) {
      const taxaCustoKey = `taxa_custo_empresa_${i}x` as keyof ParametrosGlobais;
      const taxaClienteKey = `taxa_repassada_cliente_${i}x` as keyof ParametrosGlobais;
      const taxaCusto = parametros[taxaCustoKey] as number;
      const taxaCliente = parametros[taxaClienteKey] as number;
      
      const valorLiquidoEmpresa = precoFinal * (1 - taxaCusto);
      const valorTotalCliente = precoFinal * (1 + taxaCliente);
      const parcelaCartao = valorTotalCliente / i;
      
      opcoes.push({
        parcelas: i,
        valorParcela: parcelaCartao,
        valorTotal: valorTotalCliente,
        valorLiquidoEmpresa,
        taxaCustoEmpresa: taxaCusto,
        taxaRepassadaCliente: taxaCliente,
      });
    }
    return opcoes;
  };

  const gerarLinkPublico = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent, tipoPagamento: "financiamento" | "cartao" | "avista") => {
    e.preventDefault();
    
    if (!produtoSelecionado || !parametros) {
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

    const comissaoValor = financiamento.precoFinal * parseFloat(comissaoEscolhida);
    const linkPublico = gerarLinkPublico();
    
    const markupKey = `plano_${planoEscolhido}_markup_percentual` as keyof ParametrosGlobais;
    const markupUtilizado = parametros[markupKey] as number;

    // Se for cartão, usar os valores da opção de cartão selecionada
    let dadosParaProposta;
    if (tipoPagamento === "cartao") {
      const opcaoCartao = opcoesCartao.find(o => o.parcelas === parcelasCartaoSelecionadas);
      if (!opcaoCartao) return;
      
      dadosParaProposta = {
        entrada_valor: 0,
        entrada_reais: 0,
        numero_de_parcelas: opcaoCartao.parcelas,
        parcelas_qtd: opcaoCartao.parcelas,
        parcela_valor: opcaoCartao.valorParcela,
        valor_da_parcela: opcaoCartao.valorParcela,
        total_financiado: opcaoCartao.valorTotal,
        percentual_entrada_utilizado: 0,
        juros_parcelamento_mensal_usado: 0,
      };
    } else if (tipoPagamento === "avista") {
      dadosParaProposta = {
        entrada_valor: financiamento.precoFinal,
        entrada_reais: financiamento.precoFinal,
        numero_de_parcelas: 1,
        parcelas_qtd: 1,
        parcela_valor: financiamento.precoFinal,
        valor_da_parcela: financiamento.precoFinal,
        total_financiado: financiamento.precoFinal,
        percentual_entrada_utilizado: 1,
        juros_parcelamento_mensal_usado: 0,
      };
    } else {
      dadosParaProposta = {
        entrada_valor: financiamento.entrada,
        entrada_reais: financiamento.entrada,
        numero_de_parcelas: numeroParcelas,
        parcelas_qtd: financiamento.parcelas,
        parcela_valor: financiamento.parcelaValor,
        valor_da_parcela: financiamento.parcelaValor,
        total_financiado: financiamento.totalFinanciado,
        percentual_entrada_utilizado: 0.30,
        juros_parcelamento_mensal_usado: financiamento.jurosMensal,
      };
    }

    console.log("Dados para proposta:", {
      cliente_nome: clienteNome,
      tipo_pagamento: tipoPagamento,
      dadosParaProposta
    });

    const { data, error } = await supabase
      .from("propostas")
      .insert({
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_email: clienteEmail,
        produto_id: produtoSelecionado.id,
        produto_nome: produtoSelecionado.nome_produto,
        custo_base_snapshot: produtoSelecionado.custo_base,
        plano_escolhido: `PLANO ${planoEscolhido}`,
        markup_do_plano_percentual: markupUtilizado,
        comissao_percentual_escolhida: parseFloat(comissaoEscolhida),
        preco_final_aplicado: financiamento.precoFinal,
        ...dadosParaProposta,
        comissao_percentual: parseFloat(comissaoEscolhida),
        comissao_valor: comissaoValor,
        link_publico: linkPublico,
        tipo_pagamento: tipoPagamento,
      })
      .select()
      .single();

    console.log("Resultado:", { data, error });

    if (error) {
      console.error("Erro detalhado:", error);
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
                        {produto.nome_produto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {produtoSelecionado && parametros && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="plano">Plano Comercial</Label>
                      <Select value={planoEscolhido} onValueChange={(v) => setPlanoEscolhido(v as "30" | "40" | "50")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">Plano 30 ({(parametros.plano_30_markup_percentual * 100).toFixed(0)}%)</SelectItem>
                          <SelectItem value="40">Plano 40 ({(parametros.plano_40_markup_percentual * 100).toFixed(0)}%)</SelectItem>
                          <SelectItem value="50">Plano 50 ({(parametros.plano_50_markup_percentual * 100).toFixed(0)}%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="comissao">Comissão do Vendedor</Label>
                      <Select value={comissaoEscolhida} onValueChange={(v) => setComissaoEscolhida(v as "0.005" | "0.01" | "0.015")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.005">0,5%</SelectItem>
                          <SelectItem value="0.01">1,0%</SelectItem>
                          <SelectItem value="0.015">1,5%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Preço Final Calculado (somente leitura)</Label>
                    <div className="p-3 bg-secondary/30 rounded-md">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(calcularPrecoFinal())}
                      </p>
                    </div>
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
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="financiamento">Entrada + Financiamento</TabsTrigger>
                          <TabsTrigger value="cartao">Cartão de Crédito</TabsTrigger>
                          <TabsTrigger value="avista">À Vista</TabsTrigger>
                        </TabsList>

                        <TabsContent value="financiamento" className="space-y-4">
                          {financiamento && (
                            <>
                              <div className="grid gap-2">
                                <Label htmlFor="num-parcelas">Número de Parcelas</Label>
                                <Select value={numeroParcelas.toString()} onValueChange={(v) => setNumeroParcelas(parseInt(v) as 12 | 18 | 24)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="12">12x - Taxa {(parametros.juros_12x_percentual * 100).toFixed(2)}% a.m.</SelectItem>
                                    <SelectItem value="18">18x - Taxa {(parametros.juros_18x_percentual * 100).toFixed(2)}% a.m.</SelectItem>
                                    <SelectItem value="24">24x - Taxa {(parametros.juros_24x_percentual * 100).toFixed(2)}% a.m.</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Entrada (30%)</p>
                                  <p className="text-2xl font-bold text-primary">
                                    {formatCurrency(financiamento.entrada)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Valor Financiado</p>
                                  <p className="text-2xl font-bold">
                                    {formatCurrency(financiamento.valorFinanciado)}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Parcelas</p>
                                  <p className="text-xl font-bold">
                                    {financiamento.parcelas}x de {formatCurrency(financiamento.parcelaValor)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Financiado</p>
                                  <p className="text-xl font-bold">
                                    {formatCurrency(financiamento.totalFinanciado)}
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
                                onClick={() => setParcelasCartaoSelecionadas(opcao.parcelas)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${
                                  parcelasCartaoSelecionadas === opcao.parcelas
                                    ? "bg-primary/20 border-2 border-primary"
                                    : "bg-background border border-border hover:border-primary"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-lg">{opcao.parcelas}x</span>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">{formatCurrency(opcao.valorParcela)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Total: {formatCurrency(opcao.valorTotal)}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50">
                                  <div>
                                    <p className="text-muted-foreground">Taxa Empresa</p>
                                    <p className="font-semibold">{(opcao.taxaCustoEmpresa * 100).toFixed(2)}%</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Líquido Empresa</p>
                                    <p className="font-semibold text-primary">{formatCurrency(opcao.valorLiquidoEmpresa)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Taxa Cliente</p>
                                    <p className="font-semibold">{(opcao.taxaRepassadaCliente * 100).toFixed(2)}%</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Total Cliente</p>
                                    <p className="font-semibold">{formatCurrency(opcao.valorTotal)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button 
                            className="w-full mt-4" 
                            onClick={(e) => handleSubmit(e, "cartao")}
                            disabled={loading || !clienteNome}
                          >
                            {loading ? "Gerando..." : `Gerar Proposta ${parcelasCartaoSelecionadas}x no Cartão`}
                          </Button>
                        </TabsContent>

                        <TabsContent value="avista" className="space-y-4">
                          {financiamento && (
                            <>
                              <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground mb-2">Valor À Vista</p>
                                <p className="text-4xl font-bold text-primary mb-4">
                                  {formatCurrency(financiamento.precoFinal)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Pagamento em uma única parcela
                                </p>
                              </div>
                              
                              <div className="bg-secondary/30 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Resumo do Pagamento</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Forma de Pagamento:</span>
                                    <span className="font-semibold">À Vista</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Parcelas:</span>
                                    <span className="font-semibold">1x</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Valor Total:</span>
                                    <span className="font-semibold text-primary">{formatCurrency(financiamento.precoFinal)}</span>
                                  </div>
                                </div>
                              </div>

                              <Button 
                                className="w-full mt-4" 
                                onClick={(e) => handleSubmit(e, "avista")}
                                disabled={loading || !clienteNome}
                              >
                                {loading ? "Gerando..." : "Gerar Proposta À Vista"}
                              </Button>
                            </>
                          )}
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
