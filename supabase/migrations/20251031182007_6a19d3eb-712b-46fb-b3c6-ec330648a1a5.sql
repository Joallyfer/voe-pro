-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_produto TEXT NOT NULL,
  plano TEXT NOT NULL DEFAULT 'PLANO 40',
  preco_de_venda DECIMAL(12,2) NOT NULL,
  comissao_percentual DECIMAL(5,4) NOT NULL,
  preco_final DECIMAL(12,2) NOT NULL,
  entrada_valor DECIMAL(12,2) NOT NULL,
  valor_financiado DECIMAL(12,2) NOT NULL,
  parcela_valor DECIMAL(12,2) NOT NULL,
  parcelas_qtd INTEGER NOT NULL,
  valor_total_financiado DECIMAL(12,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Policy: todos podem ver produtos ativos (público)
CREATE POLICY "produtos_select_public" ON public.produtos
  FOR SELECT
  USING (ativo = true);

-- Policy: usuários autenticados podem ver todos os produtos
CREATE POLICY "produtos_select_authenticated" ON public.produtos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: usuários autenticados podem inserir
CREATE POLICY "produtos_insert_authenticated" ON public.produtos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: usuários autenticados podem atualizar
CREATE POLICY "produtos_update_authenticated" ON public.produtos
  FOR UPDATE
  TO authenticated
  USING (true);

-- Criar tabela de parâmetros globais
CREATE TABLE public.parametros_globais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxa_cartao_1x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.0399,
  taxa_cartao_2x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.0499,
  taxa_cartao_3x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.0599,
  taxa_cartao_4x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.0699,
  taxa_cartao_5x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.0799,
  taxa_cartao_6x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.0899,
  taxa_cartao_7x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.0999,
  taxa_cartao_8x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.1099,
  taxa_cartao_9x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.1199,
  taxa_cartao_10x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.1299,
  taxa_cartao_11x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.1399,
  taxa_cartao_12x_percentual DECIMAL(5,4) NOT NULL DEFAULT 0.1499,
  percentual_entrada_padrao DECIMAL(5,4) NOT NULL DEFAULT 0.30,
  juros_parcelamento_mensal DECIMAL(5,4) NOT NULL DEFAULT 0.025,
  politica_arredondamento TEXT DEFAULT 'terminar em .990',
  observacao_condicoes_comerciais TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.parametros_globais ENABLE ROW LEVEL SECURITY;

-- Policy: usuários autenticados podem ver
CREATE POLICY "parametros_select_authenticated" ON public.parametros_globais
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: usuários autenticados podem atualizar
CREATE POLICY "parametros_update_authenticated" ON public.parametros_globais
  FOR UPDATE
  TO authenticated
  USING (true);

-- Criar tabela de propostas
CREATE TABLE public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  cliente_email TEXT,
  produto_id UUID REFERENCES public.produtos(id),
  produto_nome TEXT NOT NULL,
  preco_final_aplicado DECIMAL(12,2) NOT NULL,
  entrada_valor DECIMAL(12,2) NOT NULL,
  parcelas_qtd INTEGER NOT NULL,
  parcela_valor DECIMAL(12,2) NOT NULL,
  total_financiado DECIMAL(12,2) NOT NULL,
  comissao_percentual DECIMAL(5,4) NOT NULL,
  comissao_valor DECIMAL(12,2) NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  validade_dias INTEGER DEFAULT 5,
  link_publico TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada', 'perdida')),
  tipo_pagamento TEXT DEFAULT 'financiamento' CHECK (tipo_pagamento IN ('financiamento', 'cartao')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;

-- Policy: qualquer um pode ver propostas pelo link público
CREATE POLICY "propostas_select_public" ON public.propostas
  FOR SELECT
  USING (true);

-- Policy: usuários autenticados podem inserir
CREATE POLICY "propostas_insert_authenticated" ON public.propostas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: usuários autenticados podem atualizar
CREATE POLICY "propostas_update_authenticated" ON public.propostas
  FOR UPDATE
  TO authenticated
  USING (true);

-- Inserir dados iniciais dos produtos
INSERT INTO public.produtos (
  nome_produto,
  plano,
  preco_de_venda,
  comissao_percentual,
  preco_final,
  entrada_valor,
  valor_financiado,
  parcela_valor,
  parcelas_qtd,
  valor_total_financiado,
  ativo
) VALUES
(
  'Laser CO2 1490',
  'PLANO 40',
  39122.12,
  0.0150,
  39708.95,
  11912.68,
  27796.26,
  2421.40,
  24,
  70026.33,
  true
),
(
  'Laser Fibra 30W',
  'PLANO 40',
  18355.55,
  0.0150,
  18630.88,
  5589.26,
  13041.62,
  1136.09,
  24,
  32855.37,
  true
),
(
  'Laser CO2 1390',
  'PLANO 40',
  36957.47,
  0.0150,
  37511.83,
  11253.55,
  26258.28,
  2287.42,
  24,
  66151.74,
  true
),
(
  'Laser CO2 1610',
  'PLANO 40',
  42061.12,
  0.0150,
  42692.04,
  12807.61,
  29884.43,
  2603.31,
  24,
  75286.98,
  true
);

-- Inserir configuração padrão dos parâmetros globais
INSERT INTO public.parametros_globais (
  observacao_condicoes_comerciais
) VALUES (
  'Validade da proposta: 5 dias corridos. Condições especiais sujeitas a aprovação. Retirada no local. Garantia conforme fabricante.'
);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parametros_updated_at
  BEFORE UPDATE ON public.parametros_globais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propostas_updated_at
  BEFORE UPDATE ON public.propostas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();