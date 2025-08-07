-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar tabela de itens de bebidas
CREATE TABLE public.bebidas_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome text NOT NULL,
  quantidade integer NOT NULL DEFAULT 0,
  unidade text NOT NULL DEFAULT 'un',
  categoria text NOT NULL,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  data_validade date,
  temperatura numeric,
  temperatura_ideal numeric,
  fornecedor text,
  observacoes text,
  unidade_item text CHECK (unidade_item IN ('juazeiro_norte', 'fortaleza')) DEFAULT 'juazeiro_norte',
  minimo integer DEFAULT 10,
  preco_unitario numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.bebidas_items ENABLE ROW LEVEL SECURITY;

-- Políticas para bebidas_items
CREATE POLICY "Users can view all bebidas_items"
ON public.bebidas_items
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own bebidas items"
ON public.bebidas_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bebidas items"
ON public.bebidas_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bebidas items"
ON public.bebidas_items
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and gerentes can insert bebidas_items"
ON public.bebidas_items
FOR INSERT
WITH CHECK (can_modify());

CREATE POLICY "Admins and gerentes can update bebidas_items"
ON public.bebidas_items
FOR UPDATE
USING (can_modify());

CREATE POLICY "Admins and gerentes can delete bebidas_items"
ON public.bebidas_items
FOR DELETE
USING (can_modify());

-- Criar tabela de histórico de bebidas
CREATE TABLE public.bebidas_historico (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_nome text NOT NULL,
  quantidade integer NOT NULL,
  unidade text NOT NULL,
  categoria text NOT NULL,
  tipo text NOT NULL,
  data_operacao timestamp with time zone NOT NULL DEFAULT now(),
  observacoes text
);

-- Habilitar RLS
ALTER TABLE public.bebidas_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para bebidas_historico
CREATE POLICY "Users can view all bebidas_historico"
ON public.bebidas_historico
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own bebidas_historico"
ON public.bebidas_historico
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and gerentes can insert bebidas_historico"
ON public.bebidas_historico
FOR INSERT
WITH CHECK (can_modify());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_bebidas_items_updated_at
BEFORE UPDATE ON public.bebidas_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();