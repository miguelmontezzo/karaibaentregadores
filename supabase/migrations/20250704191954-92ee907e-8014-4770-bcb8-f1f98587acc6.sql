-- Habilitar realtime para a tabela pedidos_karaiba
ALTER TABLE public.pedidos_karaiba REPLICA IDENTITY FULL;

-- Adicionar a tabela ao canal de realtime do Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos_karaiba;