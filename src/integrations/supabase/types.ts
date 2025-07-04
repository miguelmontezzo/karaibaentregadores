export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
