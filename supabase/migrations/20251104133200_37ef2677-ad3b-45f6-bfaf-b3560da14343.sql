-- Adicionar campo de quantidade em estoque
ALTER TABLE public.produtos 
ADD COLUMN quantidade_estoque integer NOT NULL DEFAULT 0;

-- Os campos entrada_valor, parcela_valor, parcelas_qtd, valor_financiado, valor_total_financiado
-- permanecem na tabela para manter compatibilidade com propostas existentes,
-- mas não serão mais editáveis no cadastro de produtos