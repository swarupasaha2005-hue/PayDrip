import React, { createContext, useState, useContext, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [name, setName] = useState(() => localStorage.getItem('pd_user_name') || '');
  const [gender, setGender] = useState(() => localStorage.getItem('pd_user_gender') || '');

  useEffect(() => {
    if (name) localStorage.setItem('pd_user_name', name);
    if (gender) localStorage.setItem('pd_user_gender', gender);
  }, [name, gender]);

  const clearUserData = () => {
    setName('');
    setGender('');
    localStorage.removeItem('pd_user_name');
    localStorage.removeItem('pd_user_gender');
  };

  return (
    <UserContext.Provider value={{ name, setName, gender, setGender, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
}

