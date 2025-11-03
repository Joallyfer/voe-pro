-- Adicionar taxas de cartão de 13x até 24x
ALTER TABLE public.parametros_globais
ADD COLUMN IF NOT EXISTS taxa_cartao_13x_percentual numeric NOT NULL DEFAULT 0.1599,
ADD COLUMN IF NOT EXISTS taxa_cartao_14x_percentual numeric NOT NULL DEFAULT 0.1699,
ADD COLUMN IF NOT EXISTS taxa_cartao_15x_percentual numeric NOT NULL DEFAULT 0.1799,
ADD COLUMN IF NOT EXISTS taxa_cartao_16x_percentual numeric NOT NULL DEFAULT 0.1899,
ADD COLUMN IF NOT EXISTS taxa_cartao_17x_percentual numeric NOT NULL DEFAULT 0.1999,
ADD COLUMN IF NOT EXISTS taxa_cartao_18x_percentual numeric NOT NULL DEFAULT 0.2099,
ADD COLUMN IF NOT EXISTS taxa_cartao_19x_percentual numeric NOT NULL DEFAULT 0.2199,
ADD COLUMN IF NOT EXISTS taxa_cartao_20x_percentual numeric NOT NULL DEFAULT 0.2299,
ADD COLUMN IF NOT EXISTS taxa_cartao_21x_percentual numeric NOT NULL DEFAULT 0.2399,
ADD COLUMN IF NOT EXISTS taxa_cartao_22x_percentual numeric NOT NULL DEFAULT 0.2499,
ADD COLUMN IF NOT EXISTS taxa_cartao_23x_percentual numeric NOT NULL DEFAULT 0.2599,
ADD COLUMN IF NOT EXISTS taxa_cartao_24x_percentual numeric NOT NULL DEFAULT 0.2699;