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
      bebidas_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      bebidas_items: {
        Row: {
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          fornecedor: string | null
          id: string
          minimo: number | null
          nome: string
          observacoes: string | null
          preco_unitario: number | null
          quantidade: number
          temperatura: number | null
          temperatura_ideal: number | null
          unidade: string
          unidade_item: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          temperatura?: number | null
          temperatura_ideal?: number | null
          unidade?: string
          unidade_item?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          temperatura?: number | null
          temperatura_ideal?: number | null
          unidade?: string
          unidade_item?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      camara_fria_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      camara_fria_items: {
        Row: {
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          fornecedor: string | null
          id: string
          minimo: number | null
          nome: string
          observacoes: string | null
          preco_unitario: number | null
          quantidade: number
          temperatura_ideal: number | null
          unidade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          temperatura_ideal?: number | null
          unidade?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          temperatura_ideal?: number | null
          unidade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      camara_refrigerada_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      camara_refrigerada_items: {
        Row: {
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          fornecedor: string | null
          id: string
          nome: string
          observacoes: string | null
          preco_unitario: number | null
          quantidade: number
          status: string
          temperatura_ideal: number | null
          unidade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          status?: string
          temperatura_ideal?: number | null
          unidade?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          status?: string
          temperatura_ideal?: number | null
          unidade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      descartaveis_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      descartaveis_items: {
        Row: {
          categoria: string
          created_at: string
          data_entrada: string
          fornecedor: string | null
          id: string
          minimo: number | null
          nome: string
          observacoes: string | null
          preco_unitario: number | null
          quantidade: number
          unidade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_entrada?: string
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_entrada?: string
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estoque_seco_historico: {
        Row: {
          categoria: string
          data_operacao: string
          id: string
          item_nome: string
          observacoes: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Insert: {
          categoria: string
          data_operacao?: string
          id?: string
          item_nome: string
          observacoes?: string | null
          quantidade: number
          tipo: string
          unidade: string
          user_id: string
        }
        Update: {
          categoria?: string
          data_operacao?: string
          id?: string
          item_nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      estoque_seco_items: {
        Row: {
          categoria: string
          created_at: string
          data_entrada: string
          data_validade: string | null
          fornecedor: string | null
          id: string
          minimo: number | null
          nome: string
          observacoes: string | null
          preco_unitario: number | null
          quantidade: number
          unidade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_entrada?: string
          data_validade?: string | null
          fornecedor?: string | null
          id?: string
          minimo?: number | null
          nome?: string
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          unidade_responsavel: Database["public"]["Enums"]["unidade"] | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          unidade_responsavel?: Database["public"]["Enums"]["unidade"] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          unidade_responsavel?: Database["public"]["Enums"]["unidade"] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_modify: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_gerente: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      unidade: "juazeiro_norte" | "fortaleza"
      user_type: "admin" | "viewer" | "gerente"
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
    Enums: {
      unidade: ["juazeiro_norte", "fortaleza"],
      user_type: ["admin", "viewer", "gerente"],
    },
  },
} as const
