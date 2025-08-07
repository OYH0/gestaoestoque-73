# Configuração das Tabelas de Bebidas no Supabase

Para que a funcionalidade de bebidas funcione corretamente, você precisa criar as seguintes tabelas no seu projeto Supabase:

## 1. Acesse o Supabase Dashboard

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Acesse seu projeto
3. Vá para a seção "SQL Editor"

## 2. Execute o seguinte SQL:

```sql
-- Criar tabela para itens de bebidas
CREATE TABLE IF NOT EXISTS public.bebidas_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    unidade TEXT NOT NULL DEFAULT 'un',
    categoria TEXT NOT NULL,
    data_entrada DATE DEFAULT CURRENT_DATE,
    data_validade DATE,
    temperatura DECIMAL(5,2),
    temperatura_ideal DECIMAL(5,2),
    fornecedor TEXT,
    observacoes TEXT,
    unidade_item TEXT CHECK (unidade_item IN ('juazeiro_norte', 'fortaleza')),
    minimo INTEGER DEFAULT 10,
    preco_unitario DECIMAL(10,2),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de bebidas
CREATE TABLE IF NOT EXISTS public.bebidas_historico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    unidade TEXT NOT NULL,
    categoria TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'entrada', 'saida', 'ajuste'
    observacoes TEXT,
    data_operacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.bebidas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bebidas_historico ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para bebidas_items
CREATE POLICY "Usuários podem ver seus próprios itens de bebidas" ON public.bebidas_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios itens de bebidas" ON public.bebidas_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios itens de bebidas" ON public.bebidas_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios itens de bebidas" ON public.bebidas_items
    FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para bebidas_historico
CREATE POLICY "Usuários podem ver seu próprio histórico de bebidas" ON public.bebidas_historico
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir no seu próprio histórico de bebidas" ON public.bebidas_historico
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER handle_bebidas_items_updated_at
    BEFORE UPDATE ON public.bebidas_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_bebidas_items_user_id ON public.bebidas_items(user_id);
CREATE INDEX IF NOT EXISTS idx_bebidas_items_unidade_item ON public.bebidas_items(unidade_item);
CREATE INDEX IF NOT EXISTS idx_bebidas_items_categoria ON public.bebidas_items(categoria);
CREATE INDEX IF NOT EXISTS idx_bebidas_historico_user_id ON public.bebidas_historico(user_id);
CREATE INDEX IF NOT EXISTS idx_bebidas_historico_data_operacao ON public.bebidas_historico(data_operacao);
```

## 3. Após executar o SQL:

1. As tabelas serão criadas automaticamente
2. O sistema irá funcionar com o banco de dados real
3. Os dados não ficarão mais apenas no localStorage

## 4. Atualizando os tipos TypeScript:

Após criar as tabelas, você pode gerar os tipos TypeScript atualizados executando:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Substitua `YOUR_PROJECT_ID` pelo ID do seu projeto Supabase.

## Status Atual:

- ✅ Hook `useBebidas` configurado para localStorage (temporário)
- ✅ Hook `useBebidasHistorico` preparado para Supabase
- ⏳ Tabelas do Supabase precisam ser criadas (execute o SQL acima)
- ⏳ Tipos TypeScript precisam ser atualizados após criar as tabelas

Uma vez que as tabelas estiverem criadas, a funcionalidade de bebidas estará totalmente operacional com persistência no banco de dados.