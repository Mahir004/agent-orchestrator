import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserRole {
  role: "admin" | "ai_engineer" | "ops_manager" | "compliance_officer" | "viewer";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (!error && data) {
      setRoles(data as UserRole[]);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: UserRole["role"]) => {
    return roles.some((r) => r.role === role);
  };

  const isAdmin = () => hasRole("admin");
  const isEngineer = () => hasRole("ai_engineer") || isAdmin();
  const isOpsManager = () => hasRole("ops_manager") || isAdmin();
  const isCompliance = () => hasRole("compliance_officer") || isAdmin();

  return {
    user,
    session,
    loading,
    roles,
    signOut,
    hasRole,
    isAdmin,
    isEngineer,
    isOpsManager,
    isCompliance,
  };
}
