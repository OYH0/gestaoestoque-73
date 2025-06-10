
-- Create table for camara_fria_historico
CREATE TABLE public.camara_fria_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  unidade TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  data_operacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT
);

-- Create table for estoque_seco_historico  
CREATE TABLE public.estoque_seco_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  unidade TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  data_operacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT
);

-- Create table for descartaveis_historico
CREATE TABLE public.descartaveis_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  unidade TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  data_operacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT
);

-- Add Row Level Security (RLS) policies for all tables
ALTER TABLE public.camara_fria_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_seco_historico ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.descartaveis_historico ENABLE ROW LEVEL SECURITY;

-- Create policies for camara_fria_historico
CREATE POLICY "Users can view their own camara_fria_historico" 
  ON public.camara_fria_historico 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own camara_fria_historico" 
  ON public.camara_fria_historico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for estoque_seco_historico
CREATE POLICY "Users can view their own estoque_seco_historico" 
  ON public.estoque_seco_historico 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estoque_seco_historico" 
  ON public.estoque_seco_historico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for descartaveis_historico
CREATE POLICY "Users can view their own descartaveis_historico" 
  ON public.descartaveis_historico 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own descartaveis_historico" 
  ON public.descartaveis_historico 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
