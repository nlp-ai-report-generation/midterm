import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Role = "operator" | "instructor" | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isOperator: boolean;
  isInstructor: boolean;
  instructorName: string;
  setInstructorName: (name: string) => void;
}

const STORAGE_KEY = "lecture-analysis-role";
const INSTRUCTOR_KEY = "lecture-analysis-instructor";

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [role, setRoleState] = useState<Role>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "operator" || stored === "instructor") return stored;
    return null;
  });

  const [instructorName, setInstructorNameState] = useState<string>(() => {
    return localStorage.getItem(INSTRUCTOR_KEY) ?? "";
  });

  // When a user logs in, load their role from user_settings
  useEffect(() => {
    if (!user) return;

    const loadUserSettings = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("role, instructor_name")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setRoleState(data.role as Role);
        if (data.role) {
          localStorage.setItem(STORAGE_KEY, data.role);
        }
        if (data.instructor_name) {
          setInstructorNameState(data.instructor_name);
          localStorage.setItem(INSTRUCTOR_KEY, data.instructor_name);
        }
      }
    };

    loadUserSettings();
  }, [user]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem(STORAGE_KEY, newRole);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Persist to Supabase if logged in
    if (user && newRole) {
      supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          role: newRole,
          instructor_name: instructorName,
        })
        .then();
    }
  };

  const setInstructorName = (name: string) => {
    setInstructorNameState(name);
    if (name) {
      localStorage.setItem(INSTRUCTOR_KEY, name);
    } else {
      localStorage.removeItem(INSTRUCTOR_KEY);
    }

    // Persist to Supabase if logged in
    if (user) {
      supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          role: role ?? "instructor",
          instructor_name: name,
        })
        .then();
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isOperator: role === "operator",
        isInstructor: role === "instructor",
        instructorName,
        setInstructorName,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
