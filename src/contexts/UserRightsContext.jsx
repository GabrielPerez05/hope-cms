import React, { createContext, useContext, useState } from 'react';

const UserRightsContext = createContext();

export const UserRightsProvider = ({ children }) => {
  const [userRights, setUserRights] = useState([]); // Array of 9 strings/IDs
  const [userType, setUserType] = useState('USER'); // 'ADMIN' or 'USER'

  const hasRight = (rightId) => userRights.includes(rightId);

  return (
    <UserRightsContext.Provider value={{ userRights, userType, setUserRights, hasRight }}>
      {children}
    </UserRightsContext.Provider>
  );
};

// Custom hook for easy access
export const useRights = () => useContext(UserRightsContext);
