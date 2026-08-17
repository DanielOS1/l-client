import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/useAuthStore";
import { LoginScreen } from "../modules/auth/screens/LoginScreen";
import { RegisterScreen } from "../modules/auth/screens/RegisterScreen";

import { GroupsListScreen } from "../modules/group/screens/GroupsListScreen";
import { GroupTabNavigator } from "./GroupTabNavigator";
import { CreateGroupScreen } from "../modules/group/screens/CreateGroupScreen";
import { UserProfileScreen } from "../modules/auth/screens/UserProfileScreen";
import { NotificationsScreen } from "../modules/notifications/screens/NotificationsScreen";
import AnimatedSplash from "../components/splash/AnimatedSplash";
import { PostLoginLoading } from "../components/loading/PostLoginLoading";

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator({ onReady }: { onReady: () => void }) {
  const { isAuthenticated, checkAuth, isCheckingAuth } = useAuthStore();
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);
  const [showPostLoginTransition, setShowPostLoginTransition] = useState(false);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    onReady();
  }, []);

  // se muestra mientras checkAuth() no termine O la animación no haya terminado.
  // OJO: isCheckingAuth (no isLoading) — login()/register() también usan isLoading
  // para sus propios spinners de botón, y eso no debe re-disparar este splash.
  const showSplash = isCheckingAuth || !splashAnimationDone;

  // Detecta un login/registro recién hecho (false -> true) una vez ya pasamos
  // la splash inicial — el caso de sesión ya guardada al abrir la app (checkAuth)
  // se resuelve DENTRO de la fase de splash, así que nunca dispara esto.
  useEffect(() => {
    if (showSplash) {
      wasAuthenticatedRef.current = isAuthenticated;
      return;
    }
    if (!wasAuthenticatedRef.current && isAuthenticated) {
      setShowPostLoginTransition(true);
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, showSplash]);

  if (showSplash) {
    return <AnimatedSplash onAnimationEnd={() => setSplashAnimationDone(true)} />;
  }

  if (showPostLoginTransition) {
    return <PostLoginLoading onDone={() => setShowPostLoginTransition(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="GroupsList" component={GroupsListScreen} />
            <Stack.Screen name="GroupTabs" component={GroupTabNavigator} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="NotificationsInbox" component={NotificationsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}