import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Lora_400Regular,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import { Feather, Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { useEffect, useCallback, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth";
import { AppProvider } from "@/context/AppContext";
import { SubscriptionProvider } from "@/lib/revenuecat";
import { T } from "@/constants/tokens";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const handleDeepLink = useCallback(
    async (url: string) => {
      try {
        const parsed = Linking.parse(url);
        // Notification deep links
        if (parsed.path === "practice" || parsed.hostname === "practice") {
          const params = parsed.queryParams ?? {};
          if (params["textId"]) {
            router.push({
              pathname: "/practice",
              params: {
                textId: params["textId"] as string,
                ...(params["isReview"] ? { isReview: "true" } : {}),
                ...(params["isFlash"] ? { isFlash: "true" } : {}),
              },
            });
          }
        }
      } catch {
      }
    },
    [],
  );

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, [handleDeepLink]);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.textId && data?.screen === "practice") {
        router.push({
          pathname: "/practice",
          params: {
            textId: data.textId as string,
            ...(data.isReview ? { isReview: "true" } : {}),
            ...(data.isFlash ? { isFlash: "true" } : {}),
          },
        });
      }
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data;
      if (data?.textId && data?.screen === "practice") {
        setTimeout(() => {
          router.push({
            pathname: "/practice",
            params: {
              textId: data.textId as string,
              ...(data.isReview ? { isReview: "true" } : {}),
              ...(data.isFlash ? { isFlash: "true" } : {}),
            },
          });
        }, 500);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: T.bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="input" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="deadline" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="mnemonic" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="reading" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="phase1-quiz" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="practice" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="results" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="feedback" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="auth" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lora_400Regular,
    Lora_700Bold,
    ...Feather.font,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <AppProvider>
                  <SubscriptionProvider>
                    <RootLayoutNav />
                  </SubscriptionProvider>
                </AppProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
