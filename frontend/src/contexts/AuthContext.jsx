import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const AuthContext = createContext(null);

const storageKey = 'user';

const getStoredUser = () => {
  const storedUser = localStorage.getItem(storageKey);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const logIn = useCallback((userData) => {
    localStorage.setItem(storageKey, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logOut = useCallback(() => {
    localStorage.removeItem(storageKey);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loggedIn: Boolean(user?.token),
    logIn,
    logOut,
  }), [user, logIn, logOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);