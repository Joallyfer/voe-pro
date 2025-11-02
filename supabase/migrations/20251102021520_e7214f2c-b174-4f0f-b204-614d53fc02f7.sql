-- Adicionar campos de markup de planos na tabela parametros_globais
ALTER TABLE parametros_globais
ADD COLUMN plano_30_markup_percentual numeric NOT NULL DEFAULT 0.30,
ADD COLUMN plano_40_markup_percentual numeric NOT NULL DEFAULT 0.40,
ADD COLUMN plano_50_markup_percentual numeric NOT NULL DEFAULT 0.50;

-- Adicionar campo custo_base na tabela produtos
ALTER TABLE produtos
ADD COLUMN custo_base numeric NOT NULL DEFAULT 0;

-- Atualizar produtos existentes com custo_base calculado retroativamente
-- (assumindo que o preco_de_venda era próximo do custo_base + 30%)
UPDATE produtos SET custo_base = preco_de_venda / 1.30 WHERE custo_base = 0;

-- Adicionar novos campos na tabela propostas para rastreamento
ALTER TABLE propostas
ADD COLUMN custo_base_snapshot numeric,
ADD COLUMN plano_escolhido text,
ADD COLUMN markup_do_plano_percentual numeric,
ADD COLUMN comissao_percentual_escolhida numeric,
ADD COLUMN percentual_entrada_utilizado numeric,
ADD COLUMN entrada_reais numeric,
ADD COLUMN numero_de_parcelas integer,
ADD COLUMN juros_parcelamento_mensal_usado numeric,
ADD COLUMN valor_da_parcela numeric;