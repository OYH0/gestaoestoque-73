-- Migration adicional para otimizações avançadas do banco de dados
-- Data: 2025-06-17
-- Descrição: Otimizações de performance, constraints e funcionalidades avançadas

-- 1. CRIAR VIEWS PARA RELATÓRIOS E CONSULTAS OTIMIZADAS

-- View para resumo de estoque por unidade
CREATE OR REPLACE VIEW public.estoque_resumo AS
SELECT 
    'camara_fria' as tipo_estoque,
    unidade,
    categoria,
    COUNT(*) as total_itens,
    SUM(quantidade) as quantidade_total,
    SUM(CASE WHEN quantidade <= minimo THEN 1 ELSE 0 END) as itens_estoque_baixo,
    AVG(quantidade) as quantidade_media,
    SUM(CASE WHEN preco_unitario IS NOT NULL THEN quantidade * preco_unitario ELSE 0 END) as valor_total_estimado
FROM public.camara_fria_items
GROUP BY unidade, categoria

UNION ALL

SELECT 
    'camara_refrigerada' as tipo_estoque,
    unidade,
    categoria,
    COUNT(*) as total_itens,
    SUM(quantidade) as quantidade_total,
    0 as itens_estoque_baixo, -- Câmara refrigerada não tem conceito de estoque mínimo
    AVG(quantidade) as quantidade_media,
    0 as valor_total_estimado -- Câmara refrigerada não tem preço
FROM public.camara_refrigerada_items
GROUP BY unidade, categoria

UNION ALL

SELECT 
    'estoque_seco' as tipo_estoque,
    unidade,
    categoria,
    COUNT(*) as total_itens,
    SUM(quantidade) as quantidade_total,
    SUM(CASE WHEN quantidade <= minimo THEN 1 ELSE 0 END) as itens_estoque_baixo,
    AVG(quantidade) as quantidade_media,
    SUM(CASE WHEN preco_unitario IS NOT NULL THEN quantidade * preco_unitario ELSE 0 END) as valor_total_estimado
FROM public.estoque_seco_items
GROUP BY unidade, categoria

UNION ALL

SELECT 
    'descartaveis' as tipo_estoque,
    unidade,
    categoria,
    COUNT(*) as total_itens,
    SUM(quantidade) as quantidade_total,
    SUM(CASE WHEN quantidade <= minimo THEN 1 ELSE 0 END) as itens_estoque_baixo,
    AVG(quantidade) as quantidade_media,
    SUM(CASE WHEN preco_unitario IS NOT NULL THEN quantidade * preco_unitario ELSE 0 END) as valor_total_estimado
FROM public.descartaveis_items
GROUP BY unidade, categoria;

-- View para histórico consolidado
CREATE OR REPLACE VIEW public.historico_consolidado AS
SELECT 
    'camara_fria' as origem,
    id,
    item_nome,
    quantidade,
    unidade_medida,
    categoria,
    tipo,
    unidade,
    data_operacao,
    observacoes,
    user_id
FROM public.camara_fria_historico

UNION ALL

SELECT 
    'camara_refrigerada' as origem,
    id,
    item_nome,
    quantidade,
    unidade_medida,
    categoria,
    tipo,
    unidade,
    data_operacao,
    observacoes,
    user_id
FROM public.camara_refrigerada_historico

UNION ALL

SELECT 
    'estoque_seco' as origem,
    id,
    item_nome,
    quantidade,
    unidade_medida,
    categoria,
    tipo,
    unidade,
    data_operacao,
    observacoes,
    user_id
FROM public.estoque_seco_historico

UNION ALL

SELECT 
    'descartaveis' as origem,
    id,
    item_nome,
    quantidade,
    unidade_medida,
    categoria,
    tipo,
    unidade,
    data_operacao,
    observacoes,
    user_id
FROM public.descartaveis_historico;

-- 2. CRIAR FUNÇÃO PARA AUDITORIA AUTOMÁTICA
CREATE OR REPLACE FUNCTION public.log_item_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir log de mudança na tabela de auditoria
    INSERT INTO public.audit_log (
        table_name,
        operation,
        old_data,
        new_data,
        user_id,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        COALESCE(NEW.user_id, OLD.user_id),
        now()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 3. CRIAR TABELA DE AUDITORIA
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para a tabela de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp DESC);

-- 4. CRIAR TRIGGERS DE AUDITORIA PARA TODAS AS TABELAS DE ITENS
DROP TRIGGER IF EXISTS audit_camara_fria_items ON public.camara_fria_items;
CREATE TRIGGER audit_camara_fria_items
    AFTER INSERT OR UPDATE OR DELETE ON public.camara_fria_items
    FOR EACH ROW EXECUTE FUNCTION public.log_item_changes();

DROP TRIGGER IF EXISTS audit_camara_refrigerada_items ON public.camara_refrigerada_items;
CREATE TRIGGER audit_camara_refrigerada_items
    AFTER INSERT OR UPDATE OR DELETE ON public.camara_refrigerada_items
    FOR EACH ROW EXECUTE FUNCTION public.log_item_changes();

DROP TRIGGER IF EXISTS audit_estoque_seco_items ON public.estoque_seco_items;
CREATE TRIGGER audit_estoque_seco_items
    AFTER INSERT OR UPDATE OR DELETE ON public.estoque_seco_items
    FOR EACH ROW EXECUTE FUNCTION public.log_item_changes();

DROP TRIGGER IF EXISTS audit_descartaveis_items ON public.descartaveis_items;
CREATE TRIGGER audit_descartaveis_items
    AFTER INSERT OR UPDATE OR DELETE ON public.descartaveis_items
    FOR EACH ROW EXECUTE FUNCTION public.log_item_changes();

-- 5. CRIAR FUNÇÃO PARA LIMPEZA AUTOMÁTICA DE HISTÓRICO ANTIGO
CREATE OR REPLACE FUNCTION public.cleanup_old_history()
RETURNS void AS $$
BEGIN
    -- Manter apenas os últimos 6 meses de histórico
    DELETE FROM public.camara_fria_historico 
    WHERE data_operacao < (now() - INTERVAL '6 months');
    
    DELETE FROM public.camara_refrigerada_historico 
    WHERE data_operacao < (now() - INTERVAL '6 months');
    
    DELETE FROM public.estoque_seco_historico 
    WHERE data_operacao < (now() - INTERVAL '6 months');
    
    DELETE FROM public.descartaveis_historico 
    WHERE data_operacao < (now() - INTERVAL '6 months');
    
    -- Manter apenas 1 ano de logs de auditoria
    DELETE FROM public.audit_log 
    WHERE timestamp < (now() - INTERVAL '1 year');
    
    -- Log da limpeza
    RAISE NOTICE 'Limpeza de histórico concluída em %', now();
END;
$$ language 'plpgsql';

-- 6. CRIAR FUNÇÃO PARA RELATÓRIO DE ITENS VENCENDO
CREATE OR REPLACE FUNCTION public.get_expiring_items(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    tipo_estoque TEXT,
    nome TEXT,
    categoria TEXT,
    quantidade INTEGER,
    data_validade DATE,
    dias_para_vencer INTEGER,
    unidade public.unidade
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'camara_fria'::TEXT as tipo_estoque,
        cf.nome,
        cf.categoria,
        cf.quantidade,
        cf.data_validade,
        (cf.data_validade - CURRENT_DATE) as dias_para_vencer,
        cf.unidade
    FROM public.camara_fria_items cf
    WHERE cf.data_validade IS NOT NULL 
      AND cf.data_validade <= (CURRENT_DATE + days_ahead)
      AND cf.data_validade >= CURRENT_DATE
    
    UNION ALL
    
    SELECT 
        'estoque_seco'::TEXT as tipo_estoque,
        es.nome,
        es.categoria,
        es.quantidade,
        es.data_validade,
        (es.data_validade - CURRENT_DATE) as dias_para_vencer,
        es.unidade
    FROM public.estoque_seco_items es
    WHERE es.data_validade IS NOT NULL 
      AND es.data_validade <= (CURRENT_DATE + days_ahead)
      AND es.data_validade >= CURRENT_DATE
    
    UNION ALL
    
    SELECT 
        'descartaveis'::TEXT as tipo_estoque,
        d.nome,
        d.categoria,
        d.quantidade,
        d.data_validade,
        (d.data_validade - CURRENT_DATE) as dias_para_vencer,
        d.unidade
    FROM public.descartaveis_items d
    WHERE d.data_validade IS NOT NULL 
      AND d.data_validade <= (CURRENT_DATE + days_ahead)
      AND d.data_validade >= CURRENT_DATE
    
    ORDER BY dias_para_vencer ASC;
END;
$$ language 'plpgsql';

-- 7. CRIAR FUNÇÃO PARA RELATÓRIO DE ESTOQUE BAIXO
CREATE OR REPLACE FUNCTION public.get_low_stock_items()
RETURNS TABLE (
    tipo_estoque TEXT,
    nome TEXT,
    categoria TEXT,
    quantidade INTEGER,
    minimo INTEGER,
    unidade public.unidade,
    deficit INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'camara_fria'::TEXT as tipo_estoque,
        cf.nome,
        cf.categoria,
        cf.quantidade,
        cf.minimo,
        cf.unidade,
        (cf.minimo - cf.quantidade) as deficit
    FROM public.camara_fria_items cf
    WHERE cf.quantidade <= cf.minimo
    
    UNION ALL
    
    SELECT 
        'estoque_seco'::TEXT as tipo_estoque,
        es.nome,
        es.categoria,
        es.quantidade,
        es.minimo,
        es.unidade,
        (es.minimo - es.quantidade) as deficit
    FROM public.estoque_seco_items es
    WHERE es.quantidade <= es.minimo
    
    UNION ALL
    
    SELECT 
        'descartaveis'::TEXT as tipo_estoque,
        d.nome,
        d.categoria,
        d.quantidade,
        d.minimo,
        d.unidade,
        (d.minimo - d.quantidade) as deficit
    FROM public.descartaveis_items d
    WHERE d.quantidade <= d.minimo
    
    ORDER BY deficit DESC;
END;
$$ language 'plpgsql';

-- 8. CRIAR POLÍTICAS RLS PARA NOVAS TABELAS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs" 
  ON public.audit_log 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Apenas admins podem ver logs de auditoria completos
CREATE POLICY "Only admins can view all audit logs" 
  ON public.audit_log 
  FOR SELECT 
  USING (public.is_admin());

-- 9. ADICIONAR CONSTRAINTS DE VALIDAÇÃO MAIS RIGOROSAS
-- Garantir que quantidades não sejam negativas
ALTER TABLE public.camara_fria_items 
ADD CONSTRAINT check_quantidade_positive CHECK (quantidade >= 0);

ALTER TABLE public.camara_refrigerada_items 
ADD CONSTRAINT check_quantidade_positive CHECK (quantidade >= 0);

ALTER TABLE public.estoque_seco_items 
ADD CONSTRAINT check_quantidade_positive CHECK (quantidade >= 0);

ALTER TABLE public.descartaveis_items 
ADD CONSTRAINT check_quantidade_positive CHECK (quantidade >= 0);

-- Garantir que preços não sejam negativos
ALTER TABLE public.camara_fria_items 
ADD CONSTRAINT check_preco_positive CHECK (preco_unitario IS NULL OR preco_unitario >= 0);

ALTER TABLE public.estoque_seco_items 
ADD CONSTRAINT check_preco_positive CHECK (preco_unitario IS NULL OR preco_unitario >= 0);

ALTER TABLE public.descartaveis_items 
ADD CONSTRAINT check_preco_positive CHECK (preco_unitario IS NULL OR preco_unitario >= 0);

-- Garantir que mínimo não seja negativo
ALTER TABLE public.camara_fria_items 
ADD CONSTRAINT check_minimo_positive CHECK (minimo IS NULL OR minimo >= 0);

ALTER TABLE public.estoque_seco_items 
ADD CONSTRAINT check_minimo_positive CHECK (minimo IS NULL OR minimo >= 0);

ALTER TABLE public.descartaveis_items 
ADD CONSTRAINT check_minimo_positive CHECK (minimo IS NULL OR minimo >= 0);

-- 10. CRIAR ÍNDICES COMPOSTOS PARA CONSULTAS COMPLEXAS
CREATE INDEX IF NOT EXISTS idx_camara_fria_unidade_categoria ON public.camara_fria_items(unidade, categoria);
CREATE INDEX IF NOT EXISTS idx_camara_fria_validade ON public.camara_fria_items(data_validade) WHERE data_validade IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_camara_fria_estoque_baixo ON public.camara_fria_items(quantidade, minimo) WHERE quantidade <= minimo;

CREATE INDEX IF NOT EXISTS idx_estoque_seco_unidade_categoria ON public.estoque_seco_items(unidade, categoria);
CREATE INDEX IF NOT EXISTS idx_estoque_seco_validade ON public.estoque_seco_items(data_validade) WHERE data_validade IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_estoque_seco_estoque_baixo ON public.estoque_seco_items(quantidade, minimo) WHERE quantidade <= minimo;

CREATE INDEX IF NOT EXISTS idx_descartaveis_unidade_categoria ON public.descartaveis_items(unidade, categoria);
CREATE INDEX IF NOT EXISTS idx_descartaveis_validade ON public.descartaveis_items(data_validade) WHERE data_validade IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_descartaveis_estoque_baixo ON public.descartaveis_items(quantidade, minimo) WHERE quantidade <= minimo;

