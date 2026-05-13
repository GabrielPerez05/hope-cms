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
 *   SYS_ADMIN: 0
 * }
 */

export function UserRightsProvider({ children }) {
  const { currentUser, session } = useAuth();
  const [rights, setRights] = useState({
    CUST_VIEW: 0,
    CUST_ADD: 0,
    CUST_EDIT: 0,
    CUST_DEL: 0,
    SALES_VIEW: 0,
    SD_VIEW: 0,
    PROD_VIEW: 0,
    PRICE_VIEW: 0,
    SYS_ADMIN: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Query all 9 user rights from the UserModule_Rights table
   */
  const loadUserRights = useCallback(async () => {
    if (!currentUser?.id || !session) {
      setRights({
        CUST_VIEW: 0,
        CUST_ADD: 0,
        CUST_EDIT: 0,
        CUST_DEL: 0,
        SALES_VIEW: 0,
        SD_VIEW: 0,
        PROD_VIEW: 0,
        PRICE_VIEW: 0,
        SYS_ADMIN: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query all 9 rights for the current user
      const { data, error: queryError } = await supabase
        .from("user_rights")
        .select("right_name, user_right_status")
        .eq("userId", currentUser.id);

      if (queryError) throw queryError;

      // Build rights object from query results
      const rightsMap = {
        CUST_VIEW: 0,
        CUST_ADD: 0,
        CUST_EDIT: 0,
        CUST_DEL: 0,
        SALES_VIEW: 0,
        SD_VIEW: 0,
        PROD_VIEW: 0,
        PRICE_VIEW: 0,
        SYS_ADMIN: 0,
      };

      if (data && Array.isArray(data)) {
        data.forEach((row) => {
          if (rightsMap.hasOwnProperty(row.right_name)) {
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
  }, [currentUser?.id, session]);

  /**
   * Load rights whenever user changes (on login/logout)
   */
  useEffect(() => {
    loadUserRights();
  }, [loadUserRights]);

  /**
   * Helper: Check if user has a specific right
   */
  const hasRight = useCallback(
    (rightName) => {
      return rights[rightName] === 1;
    },
    [rights],
  );

  /**
   * Helper: Check if user can perform any action (CUST_ADD, CUST_EDIT, etc.)
   */
  const canEdit = useCallback(() => {
    return (
      rights.CUST_ADD === 1 || rights.CUST_EDIT === 1 || rights.CUST_DEL === 1
    );
  }, [rights]);

  /**
   * Helper: Check if user is system admin
   */
  const isAdmin = useCallback(() => {
    return rights.SYS_ADMIN === 1;
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
