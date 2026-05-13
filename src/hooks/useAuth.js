<<<<<<< HEAD
import { useContext } from "react";
import { AuthContext } from "../contexts/auth-context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
=======
import { useContext } from "react";
import { AuthContext } from "../contexts/auth-context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
>>>>>>> 535af6926ae60f228da74f82990a30ff8a584b19
