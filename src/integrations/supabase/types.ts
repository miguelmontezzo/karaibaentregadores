export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      feedback_ml: {
        Row: {
          cargo: string | null
          criado_em: string | null
          empresa: string | null
          id: number
          mensagem: string | null
          nome_completo: string
          nota: number
        }
        Insert: {
          cargo?: string | null
          criado_em?: string | null
          empresa?: string | null
          id?: number
          mensagem?: string | null
          nome_completo: string
          nota: number
        }
        Update: {
          cargo?: string | null
          criado_em?: string | null
          empresa?: string | null
          id?: number
          mensagem?: string | null
          nome_completo?: string
          nota?: number
        }
        Relationships: []
      }
      formulario_ml: {
        Row: {
          criado_em: string | null
          email: string
          empresa_segmento: string
          id: number
          nome_completo: string
          whatsapp: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          empresa_segmento: string
          id?: number
          nome_completo: string
          whatsapp: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          empresa_segmento?: string
          id?: number
          nome_completo?: string
          whatsapp?: string
        }
        Relationships: []
      }
      n8n_fila_mensagens_karaiba: {
        Row: {
          id: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Insert: {
          id?: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Update: {
          id?: number
          id_mensagem?: string
          mensagem?: string
          telefone?: string
          timestamp?: string
        }
        Relationships: []
      }
      n8n_fila_mensagens_mlmkt: {
        Row: {
          id: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Insert: {
          id?: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Update: {
          id?: number
          id_mensagem?: string
          mensagem?: string
          telefone?: string
          timestamp?: string
        }
        Relationships: []
      }
      n8n_historico_mensagens_karaiba: {
        Row: {
          created_at: string
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_historico_mensagens_mlmkt: {
        Row: {
          created_at: string
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      pedidos_karaiba: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade_uf: string | null
          codigo_pedido: string | null
          criado_em: string | null
          data_hora_pedido: string
          endereco_completo: string | null
          fonte_pedido: string | null
          forma_pagamento: string | null
          id: string
          itens: string | null
          link_app: string | null
          nome_cliente: string | null
          observacoes: string | null
          status: string | null
          taxa_entrega: string | null
          telefone: string | null
          tempo_entrega_estimado: string | null
          valor_pedido: string | null
          valor_total: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade_uf?: string | null
          codigo_pedido?: string | null
          criado_em?: string | null
          data_hora_pedido: string
          endereco_completo?: string | null
          fonte_pedido?: string | null
          forma_pagamento?: string | null
          id?: string
          itens?: string | null
          link_app?: string | null
          nome_cliente?: string | null
          observacoes?: string | null
          status?: string | null
          taxa_entrega?: string | null
          telefone?: string | null
          tempo_entrega_estimado?: string | null
          valor_pedido?: string | null
          valor_total?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade_uf?: string | null
          codigo_pedido?: string | null
          criado_em?: string | null
          data_hora_pedido?: string
          endereco_completo?: string | null
          fonte_pedido?: string | null
          forma_pagamento?: string | null
          id?: string
          itens?: string | null
          link_app?: string | null
          nome_cliente?: string | null
          observacoes?: string | null
          status?: string | null
          taxa_entrega?: string | null
          telefone?: string | null
          tempo_entrega_estimado?: string | null
          valor_pedido?: string | null
          valor_total?: string | null
        }
        Relationships: []
      }
      relatorio_ia_karaiba: {
        Row: {
          datahora: string
          id: number
          mensagem_enviada: string | null
          mensagem_recebida: string | null
          nome: string | null
          telefone: string
          tipo_mensagem: string | null
        }
        Insert: {
          datahora?: string
          id?: number
          mensagem_enviada?: string | null
          mensagem_recebida?: string | null
          nome?: string | null
          telefone: string
          tipo_mensagem?: string | null
        }
        Update: {
          datahora?: string
          id?: number
          mensagem_enviada?: string | null
          mensagem_recebida?: string | null
          nome?: string | null
          telefone?: string
          tipo_mensagem?: string | null
        }
        Relationships: []
      }
      usuarios_painel_karaiba: {
        Row: {
          criado_em: string | null
          id: string
          senha: string
          usuario: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          senha: string
          usuario: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          senha?: string
          usuario?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
