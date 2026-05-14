import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { RightsContext } from "./rights-context";

/**
 * UserRightsProvider - Manages user rights and permissions
 *
 * On login, queries all 9 UserModule_Rights rows and stores as:
 * {
 *   CUST_VIEW: 1,
 *   CUST_ADD: 0,
 *   CUST_EDIT: 1,
 *   CUST_DEL: 0,
 *   SALES_VIEW: 1,
 *   SD_VIEW: 1,
 *   PROD_VIEW: 1,
 *   PRICE_VIEW: 1,
 *   ADM_USER: 0
 * }
 */

export function UserRightsProvider({ children }) {
  const { currentUser, session } = useAuth();
  const currentUserId = currentUser?.id ?? null;
  const [rights, setRights] = useState({
    CUST_VIEW: 0,
    CUST_ADD: 0,
    CUST_EDIT: 0,
    CUST_DEL: 0,
    SALES_VIEW: 0,
    SD_VIEW: 0,
    PROD_VIEW: 0,
    PRICE_VIEW: 0,
    ADM_USER: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserRights = useCallback(async () => {
    if (!currentUserId || !session) {
      setRights({
        CUST_VIEW: 0,
        CUST_ADD: 0,
        CUST_EDIT: 0,
        CUST_DEL: 0,
        SALES_VIEW: 0,
        SD_VIEW: 0,
        PROD_VIEW: 0,
        PRICE_VIEW: 0,
        ADM_USER: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("user_rights")
        .select("right_name, user_right_status")
        .eq("userId", currentUserId);

      if (queryError) throw queryError;

      const rightsMap = {
        CUST_VIEW: 0,
        CUST_ADD: 0,
        CUST_EDIT: 0,
        CUST_DEL: 0,
        SALES_VIEW: 0,
        SD_VIEW: 0,
        PROD_VIEW: 0,
        PRICE_VIEW: 0,
        ADM_USER: 0,
      };

      if (data && Array.isArray(data)) {
        data.forEach((row) => {
          if (Object.prototype.hasOwnProperty.call(rightsMap, row.right_name)) {
            rightsMap[row.right_name] = row.user_right_status ? 1 : 0;
          }
        });
      }

      setRights(rightsMap);
    } catch (err) {
      setError(err.message || "Failed to load user rights.");
      console.error("Error loading user rights:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, session]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUserRights();
  }, [loadUserRights]);

  const hasRight = useCallback(
    (rightName) => rights[rightName] === 1,
    [rights],
  );

  const canEdit = useCallback(
    () => rights.CUST_ADD === 1 || rights.CUST_EDIT === 1 || rights.CUST_DEL === 1,
    [rights],
  );

  const isAdmin = useCallback(() => {
    return rights.ADM_USER === 1;
  }, [rights]);

  const value = useMemo(
    () => ({
      rights,
      loading,
      error,
      hasRight,
      canEdit,
      isAdmin,
      loadUserRights,
    }),
    [rights, loading, error, hasRight, canEdit, isAdmin, loadUserRights],
  );

  return (
    <RightsContext.Provider value={value}>{children}</RightsContext.Provider>
  );
}
