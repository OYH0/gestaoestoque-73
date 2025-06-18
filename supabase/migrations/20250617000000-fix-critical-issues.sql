-- Migration para corrigir problemas críticos do banco de dados
-- Data: 2025-06-17
-- Descrição: Corrige duplicação de histórico e outros problemas estruturais

-- 1. CRIAR TABELA CAMARA_FRIA_ITEMS (que estava faltando)
CREATE TABLE IF NOT EXISTS public.camara_fria_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
  categoria TEXT NOT NULL,
  minimo INTEGER DEFAULT 5,
  data_entrada DATE DEFAULT CURRENT_DATE,
  data_validade DATE,
  temperatura_ideal DECIMAL(4,2),
  fornecedor TEXT,
  observacoes TEXT,
  preco_unitario DECIMAL(10,2),
  user_id UUID NOT NULL,
  unidade public.unidade DEFAULT 'juazeiro_norte',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CORRIGIR TIPOS PERMITIDOS NO HISTÓRICO DA CÂMARA REFRIGERADA
-- Remover constraint existente e criar nova
ALTER TABLE public.camara_refrigerada_historico 
DROP CONSTRAINT IF EXISTS camara_refrigerada_historico_tipo_check;

ALTER TABLE public.camara_refrigerada_historico 
ADD CONSTRAINT camara_refrigerada_historico_tipo_check 
CHECK (tipo IN ('retirada', 'volta_freezer', 'entrada'));

-- 3. PADRONIZAR CAMPO UNIDADE NAS TABELAS DE HISTÓRICO
-- Renomear campo 'unidade' para 'unidade_medida' para evitar confusão
-- e manter 'unidade' como enum para localização

-- Adicionar nova coluna unidade_medida
ALTER TABLE public.camara_fria_historico 
ADD COLUMN IF NOT EXISTS unidade_medida TEXT DEFAULT 'pç';

ALTER TABLE public.camara_refrigerada_historico 
ADD COLUMN IF NOT EXISTS unidade_medida TEXT DEFAULT 'pç';

ALTER TABLE public.estoque_seco_historico 
ADD COLUMN IF NOT EXISTS unidade_medida TEXT DEFAULT 'pç';

ALTER TABLE public.descartaveis_historico 
ADD COLUMN IF NOT EXISTS unidade_medida TEXT DEFAULT 'pç';

-- Migrar dados existentes (se houver)
UPDATE public.camara_fria_historico 
SET unidade_medida = 'pç' 
WHERE unidade_medida IS NULL;

UPDATE public.camara_refrigerada_historico 
SET unidade_medida = 'pç' 
WHERE unidade_medida IS NULL;

UPDATE public.estoque_seco_historico 
SET unidade_medida = 'pç' 
WHERE unidade_medida IS NULL;

UPDATE public.descartaveis_historico 
SET unidade_medida = 'pç' 
WHERE unidade_medida IS NULL;

-- 4. ADICIONAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_camara_fria_items_unidade ON public.camara_fria_items(unidade);
CREATE INDEX IF NOT EXISTS idx_camara_fria_items_categoria ON public.camara_fria_items(categoria);
CREATE INDEX IF NOT EXISTS idx_camara_fria_items_nome ON public.camara_fria_items(nome);

CREATE INDEX IF NOT EXISTS idx_camara_refrigerada_items_unidade ON public.camara_refrigerada_items(unidade);
CREATE INDEX IF NOT EXISTS idx_camara_refrigerada_items_categoria ON public.camara_refrigerada_items(categoria);

CREATE INDEX IF NOT EXISTS idx_camara_fria_historico_data ON public.camara_fria_historico(data_operacao DESC);
CREATE INDEX IF NOT EXISTS idx_camara_fria_historico_unidade ON public.camara_fria_historico(unidade);

CREATE INDEX IF NOT EXISTS idx_camara_refrigerada_historico_data ON public.camara_refrigerada_historico(data_operacao DESC);
CREATE INDEX IF NOT EXISTS idx_camara_refrigerada_historico_unidade ON public.camara_refrigerada_historico(unidade);

-- 5. ADICIONAR CAMPOS DE AUDITORIA
ALTER TABLE public.camara_refrigerada_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.estoque_seco_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.descartaveis_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 6. CRIAR FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. CRIAR TRIGGERS PARA ATUALIZAR updated_at
DROP TRIGGER IF EXISTS update_camara_fria_items_updated_at ON public.camara_fria_items;
CREATE TRIGGER update_camara_fria_items_updated_at 
    BEFORE UPDATE ON public.camara_fria_items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_camara_refrigerada_items_updated_at ON public.camara_refrigerada_items;
CREATE TRIGGER update_camara_refrigerada_items_updated_at 
    BEFORE UPDATE ON public.camara_refrigerada_items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_estoque_seco_items_updated_at ON public.estoque_seco_items;
CREATE TRIGGER update_estoque_seco_items_updated_at 
    BEFORE UPDATE ON public.estoque_seco_items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_descartaveis_items_updated_at ON public.descartaveis_items;
CREATE TRIGGER update_descartaveis_items_updated_at 
    BEFORE UPDATE ON public.descartaveis_items 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. HABILITAR RLS E CRIAR POLÍTICAS PARA CAMARA_FRIA_ITEMS
ALTER TABLE public.camara_fria_items ENABLE ROW LEVEL SECURITY;

-- Políticas para visualização (todos podem ver)
CREATE POLICY "Users can view all camara_fria_items" 
  ON public.camara_fria_items 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Políticas para modificação (apenas admins e gerentes)
CREATE POLICY "Admins and gerentes can insert camara_fria_items" 
  ON public.camara_fria_items 
  FOR INSERT 
  WITH CHECK (public.can_modify());

CREATE POLICY "Admins and gerentes can update camara_fria_items" 
  ON public.camara_fria_items 
  FOR UPDATE 
  USING (public.can_modify());

CREATE POLICY "Admins and gerentes can delete camara_fria_items" 
  ON public.camara_fria_items 
  FOR DELETE 
  USING (public.can_modify());

-- 9. CRIAR FUNÇÃO PARA PREVENIR DUPLICAÇÃO DE HISTÓRICO
CREATE OR REPLACE FUNCTION public.prevent_duplicate_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se já existe um registro similar nos últimos 5 segundos
    IF EXISTS (
        SELECT 1 
        FROM public.camara_refrigerada_historico 
        WHERE item_nome = NEW.item_nome 
          AND quantidade = NEW.quantidade 
          AND tipo = NEW.tipo 
          AND user_id = NEW.user_id
          AND data_operacao > (now() - INTERVAL '5 seconds')
    ) THEN
        -- Cancelar a inserção se for duplicada
        RETURN NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. CRIAR TRIGGER PARA PREVENIR DUPLICAÇÃO
DROP TRIGGER IF EXISTS prevent_duplicate_camara_refrigerada_history ON public.camara_refrigerada_historico;
CREATE TRIGGER prevent_duplicate_camara_refrigerada_history
    BEFORE INSERT ON public.camara_refrigerada_historico
    FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_history();

-- Fazer o mesmo para câmara fria
CREATE OR REPLACE FUNCTION public.prevent_duplicate_camara_fria_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se já existe um registro similar nos últimos 5 segundos
    IF EXISTS (
        SELECT 1 
        FROM public.camara_fria_historico 
        WHERE item_nome = NEW.item_nome 
          AND quantidade = NEW.quantidade 
          AND tipo = NEW.tipo 
          AND user_id = NEW.user_id
          AND data_operacao > (now() - INTERVAL '5 seconds')
    ) THEN
        -- Cancelar a inserção se for duplicada
        RETURN NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS prevent_duplicate_camara_fria_history ON public.camara_fria_historico;
CREATE TRIGGER prevent_duplicate_camara_fria_history
    BEFORE INSERT ON public.camara_fria_historico
    FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_camara_fria_history();

