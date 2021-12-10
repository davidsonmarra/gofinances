import React, { 
  createContext, 
  ReactNode, 
  useContext,
  useState,
  useEffect
} from 'react';
const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';

interface AuthProviderProps {
  children:  ReactNode
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>; 
  signInWithApple(): Promise<void>; 
  signOut(): Promise<void>;
  userStorageLoading: boolean;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  }
  type: string;
}

export const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);
  const userStorageKey = '@gofinances:user';

  async function signInWithGoogle() {
    try {
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
      const { type, params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;
      if(type === 'success') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();
        setUser({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.given_name,
          photo: userInfo.picture
        });
      }
    } catch(error) {
      throw new Error(error as string);
    }
  }

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });
      if(credential) {
        setUser({
          id: credential.user,
          email: credential.email!,
          name: credential.fullName!.givenName!,
          photo: `https://ui-avatars.com/api/?name=${credential.fullName!.givenName!}&length=1`
        });
      }
    } catch(error) {
      throw new Error(error as string);
    }
  }

  async function signOut() {
    setUser({} as User);
    try { 
      await AsyncStorage.removeItem(userStorageKey);
    } catch(error) {
      throw new Error(error as string);
    }
  }

  useEffect(() => {
    async function saveUser() {
      try {
        if(user.id) 
          await AsyncStorage.setItem(userStorageKey, JSON.stringify(user));
      } catch(error) {
        throw new Error(error as string);
      }
    }
    saveUser();
  }, [user]);

  useEffect(() => {
    async function loadUserStorageData() {
      try {
        const userStoraged = await AsyncStorage.getItem(userStorageKey);
        if(userStoraged) {
          const userLogged = JSON.parse(userStoraged) as User;
          setUser(userLogged);
        }
        setUserStorageLoading(false);
      } catch(error) {
        throw new Error(error as string);
      }
    }
    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      signInWithGoogle,
      signInWithApple,
      signOut,
      userStorageLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth }