import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";
import { SUBSCRIPTIONS_ENABLED } from "@/constants/features";
import type Purchases from "react-native-purchases";
import type {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOfferings,
} from "react-native-purchases";

// Mock packages shown in Expo Go so the paywall UI can be fully tested
const MOCK_MONTHLY = {
  identifier: "$rc_monthly",
  packageType: "MONTHLY" as PurchasesPackage["packageType"],
  product: {
    identifier: "pro_monthly",
    title: "Pro Monthly",
    description: "Pro Monthly",
    price: 9.99,
    priceString: "$9.99",
    currencyCode: "USD",
    introPrice: null,
    discounts: null,
    productCategory: "SUBSCRIPTION" as never,
    productType: "AUTO_RENEWABLE_SUBSCRIPTION" as never,
    subscriptionPeriod: "P1M",
    defaultOption: null,
    subscriptionOptions: null,
    presentedOfferingIdentifier: "default",
    presentedOfferingContext: null,
  } as unknown as PurchasesPackage["product"],
  offeringIdentifier: "default",
  presentedOfferingContext: { offeringIdentifier: "default", placementIdentifier: null, targetingContext: null },
} as unknown as PurchasesPackage;
const MOCK_ANNUAL = {
  identifier: "$rc_annual",
  packageType: "ANNUAL" as PurchasesPackage["packageType"],
  product: {
    identifier: "pro_annual",
    title: "Pro Annual",
    description: "Pro Annual",
    price: 79.99,
    priceString: "$79.99",
    currencyCode: "USD",
    introPrice: null,
    discounts: null,
    productCategory: "SUBSCRIPTION" as never,
    productType: "AUTO_RENEWABLE_SUBSCRIPTION" as never,
    subscriptionPeriod: "P1Y",
    defaultOption: null,
    subscriptionOptions: null,
    presentedOfferingIdentifier: "default",
    presentedOfferingContext: null,
  } as unknown as PurchasesPackage["product"],
  offeringIdentifier: "default",
  presentedOfferingContext: { offeringIdentifier: "default", placementIdentifier: null, targetingContext: null },
} as unknown as PurchasesPackage;

type PurchasesModule = typeof Purchases;

interface PurchasesError {
  message?: string;
  userCancelled?: boolean;
}

interface SubscriptionContextValue {
  isSubscribed: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  offerings: PurchasesPackage[] | null;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

function getNativeModule(): PurchasesModule | null {
  if (Platform.OS === "web") return null;
  try {
    return (require("react-native-purchases") as { default: PurchasesModule }).default;
  } catch {
    return null;
  }
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesPackage[] | null>(null);

  useEffect(() => {
    if (!SUBSCRIPTIONS_ENABLED) {
      setIsLoading(false);
      return;
    }
    initRevenueCat();
  }, []);

  async function initRevenueCat() {
    if (!SUBSCRIPTIONS_ENABLED) {
      setIsLoading(false);
      return;
    }
    // Expo Go cannot access native store — show mock plans so UI can be tested
    const isExpoGo = Constants.executionEnvironment === "storeClient";
    if (isExpoGo) {
      console.log("[RevenueCat] Expo Go: using mock offerings for UI testing");
      setOfferings([MOCK_ANNUAL, MOCK_MONTHLY]);
      setIsLoading(false);
      return;
    }
    const RC = getNativeModule();
    if (!RC) {
      setIsLoading(false);
      return;
    }
    try {
      const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
      if (!apiKey) {
        setIsLoading(false);
        return;
      }
      RC.configure({ apiKey });
      const [info, off]: [CustomerInfo, PurchasesOfferings] = await Promise.all([
        RC.getCustomerInfo(),
        RC.getOfferings(),
      ]);
      setIsSubscribed(!!info.entitlements.active["pro"]);
      if (off.current) {
        setOfferings(off.current.availablePackages);
      }
    } catch (e: unknown) {
      const err = e as PurchasesError;
      const msg = err.message ?? "";
      // Expo Go does not support native store — this is expected, not a user-facing error
      const isExpoGoError = msg.includes("Expo Go") || msg.includes("native store") || msg.includes("Test Store");
      if (isExpoGoError) {
        console.warn("[RevenueCat] Skipped: running in Expo Go (native store unavailable)");
      } else {
        console.warn("[RevenueCat] init error:", err);
        Alert.alert(
          "Subscription unavailable",
          "Could not connect to the subscription service. Please try again later.",
          [{ text: "OK" }],
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  const isExpoGo = Constants.executionEnvironment === "storeClient";

  const purchase = async (pkg: PurchasesPackage): Promise<boolean> => {
    if (isExpoGo) {
      setIsPurchasing(true);
      await new Promise((r) => setTimeout(r, 800));
      setIsSubscribed(true);
      setIsPurchasing(false);
      return true;
    }
    const RC = getNativeModule();
    if (!RC) return false;
    setIsPurchasing(true);
    try {
      const { customerInfo } = await RC.purchasePackage(pkg);
      const ok = !!customerInfo.entitlements.active["pro"];
      setIsSubscribed(ok);
      return ok;
    } catch (e: unknown) {
      const err = e as PurchasesError;
      if (!err.userCancelled) {
        Alert.alert("Purchase failed", err.message ?? "Something went wrong. Please try again.");
      }
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  const restore = async (): Promise<boolean> => {
    if (isExpoGo) {
      Alert.alert("No subscription found", "We didn't find an active Pro subscription linked to your account.");
      return false;
    }
    const RC = getNativeModule();
    if (!RC) return false;
    setIsPurchasing(true);
    try {
      const info: CustomerInfo = await RC.restorePurchases();
      const ok = !!info.entitlements.active["pro"];
      setIsSubscribed(ok);
      if (!ok) {
        Alert.alert(
          "No subscription found",
          "We didn't find an active Pro subscription for your account.",
        );
      }
      return ok;
    } catch (e: unknown) {
      const err = e as PurchasesError;
      Alert.alert("Restore failed", err.message ?? "Could not restore purchases.");
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{ isSubscribed: SUBSCRIPTIONS_ENABLED ? isSubscribed : true, isLoading, isPurchasing, offerings, purchase, restore }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
