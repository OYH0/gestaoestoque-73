
-- Criar enum para tipos de usuário
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('admin', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar enum para unidades/lojas
DO $$ BEGIN
    CREATE TYPE public.unidade AS ENUM ('juazeiro_norte', 'fortaleza');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna de tipo de usuário na tabela profiles apenas se não existir
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN user_type public.user_type DEFAULT 'viewer';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN unidade_responsavel public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Adicionar coluna de unidade apenas se não existir
DO $$ BEGIN
    ALTER TABLE public.estoque_seco_items ADD COLUMN unidade public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.descartaveis_items ADD COLUMN unidade public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.camara_refrigerada_items ADD COLUMN unidade public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Adicionar coluna de unidade em todas as tabelas de histórico
DO $$ BEGIN
    ALTER TABLE public.camara_fria_historico ADD COLUMN unidade public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.estoque_seco_historico ADD COLUMN unidade public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.descartaveis_historico ADD COLUMN unidade public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.camara_refrigerada_historico ADD COLUMN unidade public.unidade DEFAULT 'juazeiro_norte';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Criar função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND user_type = 'admin'
  )
$$;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.camara_fria_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_seco_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descartaveis_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camara_refrigerada_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view all camara_fria_items" ON public.camara_fria_items;
DROP POLICY IF EXISTS "Users can view all estoque_seco_items" ON public.estoque_seco_items;
DROP POLICY IF EXISTS "Users can view all descartaveis_items" ON public.descartaveis_items;
DROP POLICY IF EXISTS "Users can view all camara_refrigerada_items" ON public.camara_refrigerada_items;

-- Políticas para visualização (todos podem ver)
CREATE POLICY "Users can view all camara_fria_items" 
  ON public.camara_fria_items 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all estoque_seco_items" 
  ON public.estoque_seco_items 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all descartaveis_items" 
  ON public.descartaveis_items 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all camara_refrigerada_items" 
  ON public.camara_refrigerada_items 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Políticas para inserção (apenas admins)
CREATE POLICY "Only admins can insert camara_fria_items" 
  ON public.camara_fria_items 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can insert estoque_seco_items" 
  ON public.estoque_seco_items 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can insert descartaveis_items" 
  ON public.descartaveis_items 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can insert camara_refrigerada_items" 
  ON public.camara_refrigerada_items 
  FOR INSERT 
  WITH CHECK (public.is_admin());

-- Políticas para atualização (apenas admins)
CREATE POLICY "Only admins can update camara_fria_items" 
  ON public.camara_fria_items 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Only admins can update estoque_seco_items" 
  ON public.estoque_seco_items 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Only admins can update descartaveis_items" 
  ON public.descartaveis_items 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Only admins can update camara_refrigerada_items" 
  ON public.camara_refrigerada_items 
  FOR UPDATE 
  USING (public.is_admin());

-- Políticas para exclusão (apenas admins)
CREATE POLICY "Only admins can delete camara_fria_items" 
  ON public.camara_fria_items 
  FOR DELETE 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete estoque_seco_items" 
  ON public.estoque_seco_items 
  FOR DELETE 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete descartaveis_items" 
  ON public.descartaveis_items 
  FOR DELETE 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete camara_refrigerada_items" 
  ON public.camara_refrigerada_items 
  FOR DELETE 
  USING (public.is_admin());

-- Políticas para histórico (todos podem ver, apenas admins podem inserir)
CREATE POLICY "Users can view all camara_fria_historico" 
  ON public.camara_fria_historico 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all estoque_seco_historico" 
  ON public.estoque_seco_historico 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all descartaveis_historico" 
  ON public.descartaveis_historico 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all camara_refrigerada_historico" 
  ON public.camara_refrigerada_historico 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert camara_fria_historico" 
  ON public.camara_fria_historico 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can insert estoque_seco_historico" 
  ON public.estoque_seco_historico 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can insert descartaveis_historico" 
  ON public.descartaveis_historico 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can insert camara_refrigerada_historico" 
  ON public.camara_refrigerada_historico 
  FOR INSERT 
  WITH CHECK (public.is_admin());
