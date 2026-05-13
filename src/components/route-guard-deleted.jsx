import { Navigate } from 'react-router-dom';
import { useRights } from './UserRightsContext';

const ProtectedRoute = ({ children, requiredType }) => {
  const { userType } = useRights();

  // If the user isn't an ADMIN, redirect to standard customers
  if (userType !== requiredType) {
    return <Navigate to="/customers" replace />;
  }

  return children;
};

// Usage in App.jsx
/*
  <Route 
    path="/deleted-customers" 
    element={
      <ProtectedRoute requiredType="ADMIN">
        <DeletedCustomersPage />
      </ProtectedRoute>
    } 
  />
*/
