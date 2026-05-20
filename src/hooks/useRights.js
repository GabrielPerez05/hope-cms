import { useContext } from "react";
import { RightsContext } from "../contexts/rights-context";

/**
 * useRights - Custom hook to consume RightsContext
 * Must be used within UserRightsProvider
 *
 * Returns: { rights, userType, loading, error, hasRight, canEdit, isAdmin, loadUserRights }
 */
export function useRights() {
  const context = useContext(RightsContext);

  if (!context) {
    throw new Error("useRights must be used within UserRightsProvider");
  }

  return context;
}
