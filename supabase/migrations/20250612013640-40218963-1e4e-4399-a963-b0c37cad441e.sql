
-- Atualizar a função is_admin para distinguir entre admin e gerente
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

-- Criar nova função para verificar se é gerente
CREATE OR REPLACE FUNCTION public.is_gerente()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND user_type = 'gerente'
  )
$$;

-- Criar função para verificar se pode modificar (admin ou gerente)
CREATE OR REPLACE FUNCTION public.can_modify()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND user_type IN ('admin', 'gerente')
  )
$$;

-- Atualizar políticas para permitir que gerentes também possam inserir/atualizar/deletar
-- mas apenas admins podem fazer tudo
DROP POLICY IF EXISTS "Only admins can insert camara_fria_items" ON public.camara_fria_items;
DROP POLICY IF EXISTS "Only admins can update camara_fria_items" ON public.camara_fria_items;
DROP POLICY IF EXISTS "Only admins can delete camara_fria_items" ON public.camara_fria_items;

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

-- Repetir para as outras tabelas
DROP POLICY IF EXISTS "Only admins can insert estoque_seco_items" ON public.estoque_seco_items;
DROP POLICY IF EXISTS "Only admins can update estoque_seco_items" ON public.estoque_seco_items;
DROP POLICY IF EXISTS "Only admins can delete estoque_seco_items" ON public.estoque_seco_items;

CREATE POLICY "Admins and gerentes can insert estoque_seco_items" 
  ON public.estoque_seco_items 
  FOR INSERT 
  WITH CHECK (public.can_modify());

CREATE POLICY "Admins and gerentes can update estoque_seco_items" 
  ON public.estoque_seco_items 
  FOR UPDATE 
  USING (public.can_modify());

CREATE POLICY "Admins and gerentes can delete estoque_seco_items" 
  ON public.estoque_seco_items 
  FOR DELETE 
  USING (public.can_modify());

-- Descartáveis
DROP POLICY IF EXISTS "Only admins can insert descartaveis_items" ON public.descartaveis_items;
DROP POLICY IF EXISTS "Only admins can update descartaveis_items" ON public.descartaveis_items;
DROP POLICY IF EXISTS "Only admins can delete descartaveis_items" ON public.descartaveis_items;

CREATE POLICY "Admins and gerentes can insert descartaveis_items" 
  ON public.descartaveis_items 
  FOR INSERT 
  WITH CHECK (public.can_modify());

CREATE POLICY "Admins and gerentes can update descartaveis_items" 
  ON public.descartaveis_items 
  FOR UPDATE 
  USING (public.can_modify());

CREATE POLICY "Admins and gerentes can delete descartaveis_items" 
  ON public.descartaveis_items 
  FOR DELETE 
  USING (public.can_modify());

-- Câmara Refrigerada
DROP POLICY IF EXISTS "Only admins can insert camara_refrigerada_items" ON public.camara_refrigerada_items;
DROP POLICY IF EXISTS "Only admins can update camara_refrigerada_items" ON public.camara_refrigerada_items;
DROP POLICY IF EXISTS "Only admins can delete camara_refrigerada_items" ON public.camara_refrigerada_items;

CREATE POLICY "Admins and gerentes can insert camara_refrigerada_items" 
  ON public.camara_refrigerada_items 
  FOR INSERT 
  WITH CHECK (public.can_modify());

CREATE POLICY "Admins and gerentes can update camara_refrigerada_items" 
  ON public.camara_refrigerada_items 
  FOR UPDATE 
  USING (public.can_modify());

CREATE POLICY "Admins and gerentes can delete camara_refrigerada_items" 
  ON public.camara_refrigerada_items 
  FOR DELETE 
  USING (public.can_modify());

-- Histórico (só admins e gerentes podem inserir)
DROP POLICY IF EXISTS "Only admins can insert camara_fria_historico" ON public.camara_fria_historico;
DROP POLICY IF EXISTS "Only admins can insert estoque_seco_historico" ON public.estoque_seco_historico;
DROP POLICY IF EXISTS "Only admins can insert descartaveis_historico" ON public.descartaveis_historico;
DROP POLICY IF EXISTS "Only admins can insert camara_refrigerada_historico" ON public.camara_refrigerada_historico;

CREATE POLICY "Admins and gerentes can insert camara_fria_historico" 
  ON public.camara_fria_historico 
  FOR INSERT 
  WITH CHECK (public.can_modify());

CREATE POLICY "Admins and gerentes can insert estoque_seco_historico" 
  ON public.estoque_seco_historico 
  FOR INSERT 
  WITH CHECK (public.can_modify());

CREATE POLICY "Admins and gerentes can insert descartaveis_historico" 
  ON public.descartaveis_historico 
  FOR INSERT 
  WITH CHECK (public.can_modify());

CREATE POLICY "Admins and gerentes can insert camara_refrigerada_historico" 
  ON public.camara_refrigerada_historico 
  FOR INSERT 
  WITH CHECK (public.can_modify());
