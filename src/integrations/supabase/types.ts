export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      parametros_globais: {
        Row: {
          created_at: string | null
          id: string
          juros_parcelamento_mensal: number
          observacao_condicoes_comerciais: string | null
          percentual_entrada_padrao: number
          politica_arredondamento: string | null
          taxa_cartao_10x_percentual: number
          taxa_cartao_11x_percentual: number
          taxa_cartao_12x_percentual: number
          taxa_cartao_1x_percentual: number
          taxa_cartao_2x_percentual: number
          taxa_cartao_3x_percentual: number
          taxa_cartao_4x_percentual: number
          taxa_cartao_5x_percentual: number
          taxa_cartao_6x_percentual: number
          taxa_cartao_7x_percentual: number
          taxa_cartao_8x_percentual: number
          taxa_cartao_9x_percentual: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          juros_parcelamento_mensal?: number
          observacao_condicoes_comerciais?: string | null
          percentual_entrada_padrao?: number
          politica_arredondamento?: string | null
          taxa_cartao_10x_percentual?: number
          taxa_cartao_11x_percentual?: number
          taxa_cartao_12x_percentual?: number
          taxa_cartao_1x_percentual?: number
          taxa_cartao_2x_percentual?: number
          taxa_cartao_3x_percentual?: number
          taxa_cartao_4x_percentual?: number
          taxa_cartao_5x_percentual?: number
          taxa_cartao_6x_percentual?: number
          taxa_cartao_7x_percentual?: number
          taxa_cartao_8x_percentual?: number
          taxa_cartao_9x_percentual?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          juros_parcelamento_mensal?: number
          observacao_condicoes_comerciais?: string | null
          percentual_entrada_padrao?: number
          politica_arredondamento?: string | null
          taxa_cartao_10x_percentual?: number
          taxa_cartao_11x_percentual?: number
          taxa_cartao_12x_percentual?: number
          taxa_cartao_1x_percentual?: number
          taxa_cartao_2x_percentual?: number
          taxa_cartao_3x_percentual?: number
          taxa_cartao_4x_percentual?: number
          taxa_cartao_5x_percentual?: number
          taxa_cartao_6x_percentual?: number
          taxa_cartao_7x_percentual?: number
          taxa_cartao_8x_percentual?: number
          taxa_cartao_9x_percentual?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean
          comissao_percentual: number
          created_at: string | null
          entrada_valor: number
          id: string
          nome_produto: string
          parcela_valor: number
          parcelas_qtd: number
          plano: string
          preco_de_venda: number
          preco_final: number
          updated_at: string | null
          valor_financiado: number
          valor_total_financiado: number
        }
        Insert: {
          ativo?: boolean
          comissao_percentual: number
          created_at?: string | null
          entrada_valor: number
          id?: string
          nome_produto: string
          parcela_valor: number
          parcelas_qtd: number
          plano?: string
          preco_de_venda: number
          preco_final: number
          updated_at?: string | null
          valor_financiado: number
          valor_total_financiado: number
        }
        Update: {
          ativo?: boolean
          comissao_percentual?: number
          created_at?: string | null
          entrada_valor?: number
          id?: string
          nome_produto?: string
          parcela_valor?: number
          parcelas_qtd?: number
          plano?: string
          preco_de_venda?: number
          preco_final?: number
          updated_at?: string | null
          valor_financiado?: number
          valor_total_financiado?: number
        }
        Relationships: []
      }
      propostas: {
        Row: {
          cliente_email: string | null
          cliente_nome: string
          cliente_telefone: string | null
          comissao_percentual: number
          comissao_valor: number
          created_at: string | null
          data_criacao: string | null
          entrada_valor: number
          id: string
          link_publico: string
          parcela_valor: number
          parcelas_qtd: number
          preco_final_aplicado: number
          produto_id: string | null
          produto_nome: string
          status: string | null
          tipo_pagamento: string | null
          total_financiado: number
          updated_at: string | null
          validade_dias: number | null
        }
        Insert: {
          cliente_email?: string | null
          cliente_nome: string
          cliente_telefone?: string | null
          comissao_percentual: number
          comissao_valor: number
          created_at?: string | null
          data_criacao?: string | null
          entrada_valor: number
          id?: string
          link_publico: string
          parcela_valor: number
          parcelas_qtd: number
          preco_final_aplicado: number
          produto_id?: string | null
          produto_nome: string
          status?: string | null
          tipo_pagamento?: string | null
          total_financiado: number
          updated_at?: string | null
          validade_dias?: number | null
        }
        Update: {
          cliente_email?: string | null
          cliente_nome?: string
          cliente_telefone?: string | null
          comissao_percentual?: number
          comissao_valor?: number
          created_at?: string | null
          data_criacao?: string | null
          entrada_valor?: number
          id?: string
          link_publico?: string
          parcela_valor?: number
          parcelas_qtd?: number
          preco_final_aplicado?: number
          produto_id?: string | null
          produto_nome?: string
          status?: string | null
          tipo_pagamento?: string | null
          total_financiado?: number
          updated_at?: string | null
          validade_dias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
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
