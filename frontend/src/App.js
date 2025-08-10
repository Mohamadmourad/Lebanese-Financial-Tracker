import React from 'react';
import { UserProvider } from './Contexts/UserContext';
import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from "react-router-dom";
import Home from './Pages/Home.tsx';
import ProtectedRoute from './ProtectedRoute';
import Signup from './Pages/Signup.tsx';
import Login from './Pages/Login.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
  <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
      <Route path="/signup" element={<Signup />}/>
      <Route path="/login" element={<Login />}/>
    </Route>
  )
)

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router}/>
    </UserProvider>
  );
}

export default App;
