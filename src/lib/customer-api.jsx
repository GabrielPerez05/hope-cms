import React, { useState, useEffect } from 'react';

const CustomerManager = ({ userType }) => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // getCustomers(userType) logic: 
    // Backend/Service filters 'DELETED' if userType === 'USER'
    fetchCustomers(userType).then(data => setCustomers(data));
  }, [userType]);

  const handleSoftDelete = (id) => {
    // Update local state and call softDeleteCustomer(id)
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <div className="p-4">
      <h2>Customer Directory</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(cust => (
            <tr key={cust.id}>
              <td>{cust.name}</td>
              <td>{cust.status}</td>
              <td>
                <button onClick={() => handleEdit(cust.id)}>Update</button>
                {/* Rights-gated: only show delete if logic allows */}
                <button onClick={() => handleSoftDelete(cust.id)} className="text-red-500">
                  Soft Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerManager;
