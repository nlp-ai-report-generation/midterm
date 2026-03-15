import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Role = "operator" | "instructor" | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isOperator: boolean;
  isInstructor: boolean;
}

const STORAGE_KEY = "lecture-analysis-role";

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "operator" || stored === "instructor") return stored;
    return null;
  });

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem(STORAGE_KEY, newRole);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isOperator: role === "operator",
        isInstructor: role === "instructor",
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
