import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Produto {
  id: string;
  nome_produto: string;
  plano: string;
  custo_base: number;
  preco_de_venda: number;
  comissao_percentual: number;
  preco_final: number;
  quantidade_estoque: number;
  ativo: boolean;
}

const Produtos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Produto>>({});
  const [showNewForm, setShowNewForm] = useState(false);

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
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .order("nome_produto");
    setProdutos(data || []);
  };

  const handleEdit = (produto: Produto) => {
    setEditingId(produto.id);
    setEditData(produto);
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from("produtos")
      .update(editData)
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Produto atualizado com sucesso!" });
      setEditingId(null);
      fetchProdutos();
    }
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    const { error } = await supabase
      .from("produtos")
      .update({ ativo })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      fetchProdutos();
    }
  };

  const handleCreate = async () => {
    if (!editData.nome_produto || !editData.preco_final) {
      toast({
        title: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("produtos")
      .insert([{
        nome_produto: editData.nome_produto,
        plano: editData.plano || "PLANO 40",
        custo_base: editData.custo_base || 0,
        preco_de_venda: editData.preco_de_venda || editData.preco_final,
        comissao_percentual: editData.comissao_percentual || 0.015,
        preco_final: editData.preco_final,
        quantidade_estoque: editData.quantidade_estoque || 0,
        entrada_valor: 0,
        valor_financiado: 0,
        parcela_valor: 0,
        parcelas_qtd: 0,
        valor_total_financiado: 0,
        ativo: true,
      }]);

    if (error) {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Produto criado com sucesso!" });
      setShowNewForm(false);
      setEditData({});
      fetchProdutos();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Formulário Novo Produto */}
        {showNewForm && (
          <Card className="mb-6 border-primary/30">
            <CardHeader>
              <CardTitle>Novo Produto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Nome do Produto *</Label>
                  <Input
                    value={editData.nome_produto || ""}
                    onChange={(e) => setEditData({ ...editData, nome_produto: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Plano</Label>
                  <Input
                    value={editData.plano || "PLANO 40"}
                    onChange={(e) => setEditData({ ...editData, plano: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Custo Base *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.custo_base || ""}
                    onChange={(e) => setEditData({ ...editData, custo_base: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Preço de Venda *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.preco_de_venda || ""}
                    onChange={(e) => setEditData({ ...editData, preco_de_venda: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Comissão %</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={editData.comissao_percentual || ""}
                    onChange={(e) => setEditData({ ...editData, comissao_percentual: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Preço de Custo *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.preco_final || ""}
                    onChange={(e) => setEditData({ ...editData, preco_final: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Quantidade em Estoque</Label>
                  <Input
                    type="number"
                    value={editData.quantidade_estoque || ""}
                    onChange={(e) => setEditData({ ...editData, quantidade_estoque: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate}>Criar Produto</Button>
                <Button variant="outline" onClick={() => { setShowNewForm(false); setEditData({}); }}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Produtos */}
        <div className="grid gap-4">
          {produtos.map((produto) => (
            <Card key={produto.id} className={!produto.ativo ? "opacity-60" : ""}>
              <CardContent className="p-6">
                {editingId === produto.id ? (
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Nome do Produto</Label>
                        <Input
                          value={editData.nome_produto || ""}
                          onChange={(e) => setEditData({ ...editData, nome_produto: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Preço de Custo</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.preco_final || ""}
                          onChange={(e) => setEditData({ ...editData, preco_final: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Quantidade em Estoque</Label>
                        <Input
                          type="number"
                          value={editData.quantidade_estoque || ""}
                          onChange={(e) => setEditData({ ...editData, quantidade_estoque: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(produto.id)}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Produto</p>
                        <p className="font-semibold text-lg">{produto.nome_produto}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Preço de Custo</p>
                        <p className="font-semibold text-primary">
                          R$ {produto.preco_final.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estoque</p>
                        <p className="font-semibold">
                          {produto.quantidade_estoque} unidades
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={produto.ativo}
                          onCheckedChange={(checked) => handleToggleAtivo(produto.id, checked)}
                        />
                        <span className="text-sm">{produto.ativo ? "Ativo" : "Inativo"}</span>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => handleEdit(produto)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Produtos;