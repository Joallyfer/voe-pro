-- Adicionar campos para as 3 opções de parcelamento interno
ALTER TABLE public.parametros_globais 
ADD COLUMN juros_12x_percentual numeric NOT NULL DEFAULT 0.0499,
ADD COLUMN juros_18x_percentual numeric NOT NULL DEFAULT 0.0599,
ADD COLUMN juros_24x_percentual numeric NOT NULL DEFAULT 0.0699;

-- Comentário explicativo
COMMENT ON COLUMN public.parametros_globais.juros_12x_percentual IS 'Taxa de juros mensal para parcelamento em 12x';
COMMENT ON COLUMN public.parametros_globais.juros_18x_percentual IS 'Taxa de juros mensal para parcelamento em 18x';
COMMENT ON COLUMN public.parametros_globais.juros_24x_percentual IS 'Taxa de juros mensal para parcelamento em 24x';