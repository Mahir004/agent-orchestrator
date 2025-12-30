-- Create enums for agent and task statuses
CREATE TYPE public.agent_status AS ENUM ('running', 'paused', 'error', 'stopped');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'awaiting_approval');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.app_role AS ENUM ('admin', 'ai_engineer', 'ops_manager', 'compliance_officer', 'viewer');
CREATE TYPE public.autonomy_level AS ENUM ('full', 'supervised', 'approval_required', 'manual');
CREATE TYPE public.log_severity AS ENUM ('info', 'warning', 'error', 'critical');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agents table (Agent Registry)
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  role TEXT NOT NULL,
  status agent_status NOT NULL DEFAULT 'paused',
  model TEXT NOT NULL DEFAULT 'gpt-4',
  autonomy_level autonomy_level NOT NULL DEFAULT 'supervised',
  permissions JSONB DEFAULT '[]'::jsonb,
  tools JSONB DEFAULT '[]'::jsonb,
  decision_boundaries JSONB DEFAULT '{}'::jsonb,
  cost_per_task DECIMAL(10, 4) DEFAULT 0,
  owner_team TEXT,
  system_prompt TEXT,
  memory_policy JSONB DEFAULT '{"short_term": true, "long_term": false}'::jsonb,
  failure_handling JSONB DEFAULT '{"max_retries": 3, "backoff_strategy": "exponential"}'::jsonb,
  escalation_logic JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table (managed by agents)
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 1,
  input_data JSONB,
  output_data JSONB,
  reasoning TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflows table
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow runs table
CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running',
  current_node TEXT,
  execution_log JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Approvals table
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  requested_action JSONB,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Policy rules table (Governance)
CREATE TABLE public.policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kill switches table
CREATE TABLE public.kill_switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_ids JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Integrations table
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  config JSONB DEFAULT '{}'::jsonb,
  api_endpoint TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tool registry table
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  rate_limit INTEGER DEFAULT 100,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table (immutable, append-only)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  actor_type TEXT NOT NULL,
  actor_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  severity log_severity NOT NULL DEFAULT 'info',
  ip_address TEXT,
  user_agent TEXT
);

-- Cost tracking table
CREATE TABLE public.cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  department TEXT,
  model TEXT,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent memory/state table (without vector for now)
CREATE TABLE public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System health metrics
CREATE TABLE public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  latency_ms INTEGER,
  error_rate DECIMAL(5, 2) DEFAULT 0,
  details JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kill_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has any role (is authenticated team member)
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- RLS Policies

-- User roles: users can view own, admins can manage all
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: users can manage their own, team can view all
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agents: team members can view, engineers and admins can modify
CREATE POLICY "Team can view agents" ON public.agents
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Engineers can manage agents" ON public.agents
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ai_engineer')
  );

-- Tasks: team can view and manage
CREATE POLICY "Team can view tasks" ON public.tasks
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team can manage tasks" ON public.tasks
  FOR ALL USING (public.is_team_member(auth.uid()));

-- Workflows: team can view, engineers can manage
CREATE POLICY "Team can view workflows" ON public.workflows
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Engineers can manage workflows" ON public.workflows
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ai_engineer')
  );

-- Workflow runs: team can view and manage
CREATE POLICY "Team can view workflow runs" ON public.workflow_runs
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team can manage workflow runs" ON public.workflow_runs
  FOR ALL USING (public.is_team_member(auth.uid()));

-- Approvals: team can view and manage
CREATE POLICY "Team can view approvals" ON public.approvals
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team can manage approvals" ON public.approvals
  FOR ALL USING (public.is_team_member(auth.uid()));

-- Policy rules: team can view, admins can manage
CREATE POLICY "Team can view policies" ON public.policy_rules
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can manage policies" ON public.policy_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Kill switches: team can view, admins and ops can manage
CREATE POLICY "Team can view kill switches" ON public.kill_switches
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can manage kill switches" ON public.kill_switches
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ops_manager')
  );

-- Integrations: team can view, admins can manage
CREATE POLICY "Team can view integrations" ON public.integrations
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can manage integrations" ON public.integrations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tools: team can view, engineers can manage
CREATE POLICY "Team can view tools" ON public.tools
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Engineers can manage tools" ON public.tools
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'ai_engineer')
  );

-- Audit logs: compliance and admins can view all
CREATE POLICY "Compliance can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'compliance_officer')
  );

-- Cost records: team can view, system can insert
CREATE POLICY "Team can view cost records" ON public.cost_records
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "System can insert cost records" ON public.cost_records
  FOR INSERT WITH CHECK (true);

-- Agent memory: team can view and manage
CREATE POLICY "Team can view agent memory" ON public.agent_memory
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team can manage agent memory" ON public.agent_memory
  FOR ALL USING (public.is_team_member(auth.uid()));

-- System health: team can view, system can manage
CREATE POLICY "Team can view system health" ON public.system_health
  FOR SELECT USING (public.is_team_member(auth.uid()));

CREATE POLICY "System can manage health" ON public.system_health
  FOR ALL USING (true);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'viewer');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_actor_type TEXT,
  p_actor_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB DEFAULT NULL,
  p_severity log_severity DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (actor_type, actor_id, action, resource_type, resource_id, details, severity)
  VALUES (p_actor_type, p_actor_id, p_action, p_resource_type, p_resource_id, p_details, p_severity)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_rules_updated_at
  BEFORE UPDATE ON public.policy_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_memory_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health;

-- Create indexes for performance
CREATE INDEX idx_tasks_agent_id ON public.tasks(agent_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_type, actor_id);
CREATE INDEX idx_cost_records_agent ON public.cost_records(agent_id);
CREATE INDEX idx_cost_records_date ON public.cost_records(recorded_at);
CREATE INDEX idx_agent_memory_agent ON public.agent_memory(agent_id);
CREATE INDEX idx_approvals_status ON public.approvals(status);