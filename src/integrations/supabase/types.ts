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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_memory: {
        Row: {
          agent_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          key: string
          memory_type: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          key: string
          memory_type: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          key?: string
          memory_type?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          autonomy_level: Database["public"]["Enums"]["autonomy_level"]
          cost_per_task: number | null
          created_at: string
          created_by: string | null
          decision_boundaries: Json | null
          description: string | null
          escalation_logic: Json | null
          failure_handling: Json | null
          id: string
          memory_policy: Json | null
          model: string
          name: string
          owner_team: string | null
          permissions: Json | null
          role: string
          status: Database["public"]["Enums"]["agent_status"]
          system_prompt: string | null
          tools: Json | null
          updated_at: string
        }
        Insert: {
          autonomy_level?: Database["public"]["Enums"]["autonomy_level"]
          cost_per_task?: number | null
          created_at?: string
          created_by?: string | null
          decision_boundaries?: Json | null
          description?: string | null
          escalation_logic?: Json | null
          failure_handling?: Json | null
          id?: string
          memory_policy?: Json | null
          model?: string
          name: string
          owner_team?: string | null
          permissions?: Json | null
          role: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          tools?: Json | null
          updated_at?: string
        }
        Update: {
          autonomy_level?: Database["public"]["Enums"]["autonomy_level"]
          cost_per_task?: number | null
          created_at?: string
          created_by?: string | null
          decision_boundaries?: Json | null
          description?: string | null
          escalation_logic?: Json | null
          failure_handling?: Json | null
          id?: string
          memory_policy?: Json | null
          model?: string
          name?: string
          owner_team?: string | null
          permissions?: Json | null
          role?: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          tools?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      approvals: {
        Row: {
          agent_id: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          id: string
          rejection_reason: string | null
          requested_action: Json | null
          status: Database["public"]["Enums"]["approval_status"]
          task_id: string | null
          title: string
        }
        Insert: {
          agent_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rejection_reason?: string | null
          requested_action?: Json | null
          status?: Database["public"]["Enums"]["approval_status"]
          task_id?: string | null
          title: string
        }
        Update: {
          agent_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rejection_reason?: string | null
          requested_action?: Json | null
          status?: Database["public"]["Enums"]["approval_status"]
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          severity: Database["public"]["Enums"]["log_severity"]
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          severity?: Database["public"]["Enums"]["log_severity"]
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          severity?: Database["public"]["Enums"]["log_severity"]
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      cost_records: {
        Row: {
          agent_id: string | null
          cost: number
          department: string | null
          id: string
          model: string | null
          recorded_at: string
          task_id: string | null
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          agent_id?: string | null
          cost?: number
          department?: string | null
          id?: string
          model?: string | null
          recorded_at?: string
          task_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          agent_id?: string | null
          cost?: number
          department?: string | null
          id?: string
          model?: string | null
          recorded_at?: string
          task_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_records_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_records_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          api_endpoint: string | null
          config: Json | null
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string | null
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      kill_switches: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          reason: string | null
          target_ids: Json | null
          target_type: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          reason?: string | null
          target_ids?: Json | null
          target_type: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          reason?: string | null
          target_ids?: Json | null
          target_type?: string
        }
        Relationships: []
      }
      policy_rules: {
        Row: {
          actions: Json | null
          category: string
          conditions: Json | null
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          category: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          category?: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_health: {
        Row: {
          component: string
          details: Json | null
          error_rate: number | null
          id: string
          latency_ms: number | null
          recorded_at: string
          status: string
        }
        Insert: {
          component: string
          details?: Json | null
          error_rate?: number | null
          id?: string
          latency_ms?: number | null
          recorded_at?: string
          status?: string
        }
        Update: {
          component?: string
          details?: Json | null
          error_rate?: number | null
          id?: string
          latency_ms?: number | null
          recorded_at?: string
          status?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          description: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          priority: number | null
          reasoning: string | null
          retry_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          tokens_used: number | null
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          priority?: number | null
          reasoning?: string | null
          retry_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          tokens_used?: number | null
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          priority?: number | null
          reasoning?: string | null
          retry_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          rate_limit: number | null
          type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          rate_limit?: number | null
          type: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          rate_limit?: number | null
          type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          current_node: string | null
          execution_log: Json | null
          id: string
          started_at: string
          status: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          current_node?: string | null
          execution_log?: Json | null
          id?: string
          started_at?: string
          status?: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          current_node?: string | null
          execution_log?: Json | null
          id?: string
          started_at?: string
          status?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          edges: Json | null
          id: string
          name: string
          nodes: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          name: string
          nodes?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          name?: string
          nodes?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: { Args: { _user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_actor_id: string
          p_actor_type: string
          p_details?: Json
          p_resource_id: string
          p_resource_type: string
          p_severity?: Database["public"]["Enums"]["log_severity"]
        }
        Returns: string
      }
    }
    Enums: {
      agent_status: "running" | "paused" | "error" | "stopped"
      app_role:
        | "admin"
        | "ai_engineer"
        | "ops_manager"
        | "compliance_officer"
        | "viewer"
      approval_status: "pending" | "approved" | "rejected"
      autonomy_level: "full" | "supervised" | "approval_required" | "manual"
      log_severity: "info" | "warning" | "error" | "critical"
      task_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "awaiting_approval"
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
      agent_status: ["running", "paused", "error", "stopped"],
      app_role: [
        "admin",
        "ai_engineer",
        "ops_manager",
        "compliance_officer",
        "viewer",
      ],
      approval_status: ["pending", "approved", "rejected"],
      autonomy_level: ["full", "supervised", "approval_required", "manual"],
      log_severity: ["info", "warning", "error", "critical"],
      task_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
        "awaiting_approval",
      ],
    },
  },
} as const
