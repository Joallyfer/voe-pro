-- Update the tipo_pagamento check constraint to include "avista"
ALTER TABLE public.propostas DROP CONSTRAINT propostas_tipo_pagamento_check;

ALTER TABLE public.propostas ADD CONSTRAINT propostas_tipo_pagamento_check 
CHECK (tipo_pagamento = ANY (ARRAY['financiamento'::text, 'cartao'::text, 'avista'::text]));