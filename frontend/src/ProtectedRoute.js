import React from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useUser } from './Contexts/UserContext';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const { setUser } = useUser();
  React.useEffect(() => {
    axios.get(`${process.env.REACT_APP_ENDPOINT_ROUTES}/api/user/checkAuth`, { withCredentials: true })
      .then(res => {
        if (res.status === 200 && res.data.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, [setUser]);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
