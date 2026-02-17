'use client';
import { createContext, useContext } from 'react';

type AdminContextType = {
  isAuthorized: boolean;
};

export const AdminContext = createContext<AdminContextType>({
  isAuthorized: false,
});

export const useAdmin = () => {
  return useContext(AdminContext);
};
