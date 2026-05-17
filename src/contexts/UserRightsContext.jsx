import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { RightsContext } from "./rights-context";

export const RIGHT_NAMES = [
  "CUST_VIEW",
  "CUST_ADD",
  "CUST_EDIT",
  "CUST_DEL",
  "SALES_VIEW",
  "SD_VIEW",
  "PROD_VIEW",
  "PRICE_VIEW",
  "ADM_USER",
];

function createDefaultRights() {
  return RIGHT_NAMES.reduce((map, rightName) => {
    map[rightName] = 0;
    return map;
  }, {});
}

/**
 * UserRightsProvider - Manages user rights and permissions
 *
 * On login, queries all 9 user_rights rows and stores as:
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
  const userType = currentUser?.user_type || "USER";
  const [rights, setRights] = useState(() => createDefaultRights());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserRights = useCallback(async () => {
    if (!currentUserId || !session) {
      setRights(createDefaultRights());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("user_rights")
        .select("right_name, right_value")
        .eq("userId", currentUserId);

      if (queryError) throw queryError;

      const rightsMap = createDefaultRights();

      if (data && Array.isArray(data)) {
        data.forEach((row) => {
          if (Object.prototype.hasOwnProperty.call(rightsMap, row.right_name)) {
            rightsMap[row.right_name] = row.right_value ? 1 : 0;
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
    return (
      rights.ADM_USER === 1 ||
      userType === "ADMIN" ||
      userType === "SUPERADMIN"
    );
  }, [rights.ADM_USER, userType]);

  const value = useMemo(
    () => ({
      rights,
      userType,
      loading,
      error,
      hasRight,
      canEdit,
      isAdmin,
      loadUserRights,
    }),
    [
      rights,
      userType,
      loading,
      error,
      hasRight,
      canEdit,
      isAdmin,
      loadUserRights,
    ],
  );

  return (
    <RightsContext.Provider value={value}>{children}</RightsContext.Provider>
  );
}
