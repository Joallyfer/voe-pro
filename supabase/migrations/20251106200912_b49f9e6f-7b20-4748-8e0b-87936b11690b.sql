-- Criar bucket de storage para fotos de produtos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('produto-fotos', 'produto-fotos', true);

-- Políticas RLS para o bucket de fotos
CREATE POLICY "Fotos de produtos são públicas" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'produto-fotos');

CREATE POLICY "Usuários autenticados podem fazer upload de fotos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'produto-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar fotos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'produto-fotos' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar fotos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'produto-fotos' AND auth.role() = 'authenticated');

-- Adicionar coluna para armazenar as URLs das fotos
ALTER TABLE produtos 
ADD COLUMN fotos text[] DEFAULT '{}';

-- Adicionar comentário explicativo
COMMENT ON COLUMN produtos.fotos IS 'Array de URLs das fotos do produto no storage';