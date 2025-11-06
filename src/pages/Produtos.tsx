import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Save, X, Upload, Trash2 } from "lucide-react";
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
  fotos?: string[];
}

const Produtos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Produto>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
    // Upload novas fotos se houver
    if (selectedFiles.length > 0) {
      const uploadedUrls = await uploadPhotos(id, selectedFiles);
      if (uploadedUrls.length > 0) {
        const existingFotos = editData.fotos || [];
        editData.fotos = [...existingFotos, ...uploadedUrls];
      }
    }

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
      setSelectedFiles([]);
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

  const uploadPhotos = async (produtoId: string, files: File[]) => {
    setUploadingPhotos(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${produtoId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('produto-fotos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('produto-fotos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handlePhotoDelete = async (produtoId: string, photoUrl: string) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;

    const updatedFotos = (produto.fotos || []).filter(url => url !== photoUrl);
    
    const { error } = await supabase
      .from("produtos")
      .update({ fotos: updatedFotos })
      .eq("id", produtoId);

    if (error) {
      toast({
        title: "Erro ao remover foto",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Deletar do storage
      const fileName = photoUrl.split('/produto-fotos/')[1];
      if (fileName) {
        await supabase.storage.from('produto-fotos').remove([fileName]);
      }
      fetchProdutos();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
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

    const { data: newProduto, error } = await supabase
      .from("produtos")
      .insert([{
        nome_produto: editData.nome_produto,
        plano: "PLANO 40",
        custo_base: editData.preco_final || 0,
        preco_de_venda: 0,
        comissao_percentual: 0.015,
        preco_final: editData.preco_final,
        quantidade_estoque: editData.quantidade_estoque || 0,
        entrada_valor: 0,
        valor_financiado: 0,
        parcela_valor: 0,
        parcelas_qtd: 0,
        valor_total_financiado: 0,
        ativo: true,
        fotos: [],
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Upload fotos se houver
    if (selectedFiles.length > 0 && newProduto) {
      const uploadedUrls = await uploadPhotos(newProduto.id, selectedFiles);
      if (uploadedUrls.length > 0) {
        await supabase
          .from("produtos")
          .update({ fotos: uploadedUrls })
          .eq("id", newProduto.id);
      }
    }

    toast({ title: "Produto criado com sucesso!" });
    setShowNewForm(false);
    setEditData({});
    setSelectedFiles([]);
    fetchProdutos();
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
                  <Label>Custo Base *</Label>
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

              <div>
                <Label>Fotos do Produto</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFiles.length} arquivo(s) selecionado(s)
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={uploadingPhotos}>
                  {uploadingPhotos ? "Enviando..." : "Criar Produto"}
                </Button>
                <Button variant="outline" onClick={() => { 
                  setShowNewForm(false); 
                  setEditData({}); 
                  setSelectedFiles([]);
                }}>
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
                        <Label>Custo Base</Label>
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

                    {/* Fotos existentes */}
                    {editData.fotos && editData.fotos.length > 0 && (
                      <div>
                        <Label>Fotos Atuais</Label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {editData.fotos.map((foto, idx) => (
                            <div key={idx} className="relative group">
                              <img 
                                src={foto} 
                                alt={`Foto ${idx + 1}`} 
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <Button
                                size="icon"
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newFotos = editData.fotos!.filter((_, i) => i !== idx);
                                  setEditData({ ...editData, fotos: newFotos });
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Adicionar Novas Fotos</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      {selectedFiles.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedFiles.length} arquivo(s) selecionado(s)
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(produto.id)} disabled={uploadingPhotos}>
                        <Save className="mr-2 h-4 w-4" />
                        {uploadingPhotos ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setEditingId(null);
                        setSelectedFiles([]);
                      }}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Produto</p>
                          <p className="font-semibold text-lg">{produto.nome_produto}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Custo Base</p>
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
                    
                    {/* Exibir fotos */}
                    {produto.fotos && produto.fotos.length > 0 && (
                      <div className="flex gap-2 flex-wrap border-t pt-3">
                        {produto.fotos.map((foto, idx) => (
                          <img 
                            key={idx}
                            src={foto} 
                            alt={`${produto.nome_produto} - foto ${idx + 1}`} 
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
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