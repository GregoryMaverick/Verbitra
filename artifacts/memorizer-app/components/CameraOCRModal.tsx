import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { T } from "@/constants/tokens";
import { TESSERACT_WEBVIEW_HTML } from "@/lib/ocrWebViewHtml";

const MAX_PHOTOS = 5;
const TARGET_MAX_DIMENSION = 2000;
const OCR_ENGINE_TIMEOUT_MS = 30000;
const OCR_RECOGNIZE_TIMEOUT_MS = 90000;
const TESSERACT_WORKER_PATH =
  "https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js";
const TESSERACT_CORE_PATH = "https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0";
const TESSERACT_LANG_PATH =
  "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1/4.0.0_best_int";

const WebViewComponent =
  Platform.OS === "web" ? null : (require("react-native-webview").WebView as any);

declare global {
  interface Window {
    Tesseract?: any;
  }
}

async function ensureTesseractLoaded(): Promise<any> {
  if (typeof window === "undefined") return null;
  if (window.Tesseract?.createWorker) return window.Tesseract;

  const existing = document.getElementById("tesseract-umd");
  if (!existing) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.id = "tesseract-umd";
      script.async = true;
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Couldn't load text recognition. Check your connection."));
      document.head.appendChild(script);
    });
  }

  if (window.Tesseract?.createWorker) return window.Tesseract;
  throw new Error("Text recognition didn't start. Try again.");
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

interface CapturedPhoto {
  uri: string;
  base64?: string;
}

interface CameraOCRModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}


export default function CameraOCRModal({
  visible,
  onClose,
  onConfirm,
}: CameraOCRModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);
  const webOcrButtonRef = useRef<any>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const webViewReadyRef = useRef(false);
  const pendingOcrRef = useRef<string[] | null>(null);
  const autoPickerOpenedRef = useRef(false);

  const preprocessAsset = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    // OCR gets dramatically worse with heavy compression, incorrect rotation,
    // or very large images that exceed memory limits. This normalizes images.
    const exif: any = (asset as any).exif;
    const orientation = exif?.Orientation ?? exif?.orientation;
    const rotate =
      orientation === 3 ? 180 : orientation === 6 ? 90 : orientation === 8 ? 270 : 0;

    const width = asset.width ?? TARGET_MAX_DIMENSION;
    const height = asset.height ?? TARGET_MAX_DIMENSION;
    const maxDim = Math.max(width, height);
    const scale = maxDim > TARGET_MAX_DIMENSION ? TARGET_MAX_DIMENSION / maxDim : 1;

    const actions: ImageManipulator.Action[] = [];
    if (rotate !== 0) actions.push({ rotate });
    if (scale !== 1) {
      actions.push({
        resize: {
          width: Math.round(width * scale),
          height: Math.round(height * scale),
        },
      });
    }

    if (actions.length === 0) {
      // Still request base64 so OCR can run reliably on native + web.
      return ImageManipulator.manipulateAsync(
        asset.uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
    }

    return ImageManipulator.manipulateAsync(asset.uri, actions, {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
  }, []);

  const addAssetAsPhoto = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      try {
        const processed = await preprocessAsset(asset);
        setPhotos((prev) => [
          ...prev,
          { uri: processed.uri, base64: processed.base64 ?? undefined },
        ]);
      } catch {
        // Fall back to original asset if preprocessing fails.
        setPhotos((prev) => [
          ...prev,
          { uri: asset.uri, base64: asset.base64 ?? undefined },
        ]);
      }
    },
    [preprocessAsset]
  );

  const reset = useCallback(() => {
    setPhotos([]);
    setIsProcessing(false);
    setProcessingStatus("");
    pendingOcrRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const pickPhoto = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert("Limit reached", `You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    if (Platform.OS === "web") {
      const remaining = MAX_PHOTOS - photos.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 1,
        base64: true,
        allowsMultipleSelection: remaining > 1,
        selectionLimit: remaining,
      } as any);

      if (!result.canceled && result.assets?.length) {
        const assets = result.assets.slice(0, remaining);
        for (const asset of assets) {
          // eslint-disable-next-line no-await-in-loop
          await addAssetAsPhoto(asset);
        }
      }
      return;
    }

    Alert.alert(
      "Add Photo",
      "Choose a source",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert("Permission needed", "Camera access is required to take photos.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: "images",
              quality: 1,
              base64: true,
              exif: true,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              await addAssetAsPhoto(asset);
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert("Permission needed", "Photo library access is required.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: "images",
              quality: 1,
              base64: true,
              exif: true,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              await addAssetAsPhoto(asset);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  }, [photos.length, addAssetAsPhoto]);

  useEffect(() => {
    if (!visible) {
      autoPickerOpenedRef.current = false;
      return;
    }
    if (autoPickerOpenedRef.current || isProcessing) return;
    autoPickerOpenedRef.current = true;
    void pickPhoto();
  }, [visible, isProcessing, pickPhoto]);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const movePhotoLeft = useCallback((index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const movePhotoRight = useCallback((index: number) => {
    setPhotos((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const runOcr = useCallback(async () => {
    if (photos.length === 0 || isProcessing) return;

    const base64Images = photos.map((p) => {
      if (p.base64) return `data:image/jpeg;base64,${p.base64}`;
      return p.uri;
    });

    setIsProcessing(true);
    setProcessingStatus("Preparing…");

    if (Platform.OS === "web") {
      try {
        const Tesseract = await withTimeout(
          ensureTesseractLoaded(),
          OCR_ENGINE_TIMEOUT_MS,
          "Timed out loading text recognition. Check your connection."
        );
        setProcessingStatus("Loading…");
        const worker: any = await withTimeout(
          Tesseract.createWorker("eng", 1, {
          workerPath: TESSERACT_WORKER_PATH,
          corePath: TESSERACT_CORE_PATH,
          langPath: TESSERACT_LANG_PATH,
          logger: (m: any) => {
            if (m?.status === "recognizing text") {
              setProcessingStatus(
                `Reading… ${Math.round((m.progress ?? 0) * 100)}%`
              );
            }
          },
          }),
          OCR_ENGINE_TIMEOUT_MS,
          "Timed out starting text recognition. Check your connection and try again."
        );

        const textParts: string[] = [];
        for (let i = 0; i < base64Images.length; i++) {
          setProcessingStatus(`Reading photo ${i + 1} of ${base64Images.length}…`);
          // eslint-disable-next-line no-await-in-loop
          const result = await withTimeout(
            worker.recognize(base64Images[i]),
            OCR_RECOGNIZE_TIMEOUT_MS,
            "Timed out reading text from this image. Try cropping closer to the text."
          );
          const data: any = (result as any)?.data;
          const rawText = typeof data?.text === "string" ? data.text : "";
          textParts.push(rawText.trim());
        }

        await worker.terminate();

        const stitchedText = textParts.join("\n---\n");
        reset();
        onConfirm(stitchedText);
      } catch (e: any) {
        setIsProcessing(false);
        Alert.alert(
          "Couldn't read text",
          e?.message || "Could not read text from these photos. Please try again."
        );
      }
      return;
    }

    if (webViewReadyRef.current) {
      const script = `(function() { window.runOCR(${JSON.stringify(base64Images)}); })(); true;`;
      webViewRef.current?.injectJavaScript(script);
    } else {
      pendingOcrRef.current = base64Images;
    }
  }, [photos, isProcessing, onConfirm, reset]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node = webOcrButtonRef.current;
    if (!node) return;

    const handleClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      void runOcr();
    };

    node.addEventListener("click", handleClick);
    return () => {
      node.removeEventListener("click", handleClick);
    };
  }, [runOcr, photos.length]);

  useEffect(() => {
    if (!isProcessing) return;
    if (Platform.OS === "web") return;
    // If the WebView never boots (e.g. JS error), don't spin forever.
    const t = setTimeout(() => {
      if (!webViewReadyRef.current) {
        setIsProcessing(false);
        setProcessingStatus("");
        pendingOcrRef.current = null;
        Alert.alert(
          "Couldn't start",
          "Text recognition didn't finish starting. Try again or restart the app."
        );
      }
    }, 12000);
    return () => clearTimeout(t);
  }, [isProcessing]);

  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        // Helps debug issues where the WebView can't start Tesseract.
        // This shows up in Metro logs / device logs.
        // eslint-disable-next-line no-console
        console.log("[OCR WebView message]", event.nativeEvent.data);
        const msg = JSON.parse(event.nativeEvent.data);

        if (msg.type === "ready") {
          webViewReadyRef.current = true;
          if (pendingOcrRef.current) {
            const images = pendingOcrRef.current;
            pendingOcrRef.current = null;
            const script = `(function() { window.runOCR(${JSON.stringify(images)}); })(); true;`;
            webViewRef.current?.injectJavaScript(script);
          }
        } else if (msg.type === "progress") {
          if (msg.status === "init") {
            setProcessingStatus("Loading…");
          } else {
            setProcessingStatus(
              `Reading photo ${msg.page} of ${msg.total}…`
            );
          }
        } else if (msg.type === "result") {
          setIsProcessing(false);
          const pages: { rawText: string }[] = msg.pages;
          const textParts: string[] = [];

          for (const page of pages) {
            textParts.push(String(page.rawText ?? "").trim());
          }

          const stitchedText = textParts.join("\n---\n");
          reset();
          onConfirm(stitchedText);
        } else if (msg.type === "error") {
          setIsProcessing(false);
          const details =
            typeof msg.message === "string" && msg.message.trim().length > 0
              ? msg.message
              : JSON.stringify(msg);
          Alert.alert("Couldn't read text", details || "Could not read text from these photos.");
        }
      } catch {
        // eslint-disable-next-line no-console
        console.log("[OCR WebView message parse error]", event.nativeEvent.data);
      }
    },
    [reset, onConfirm]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
            <Feather name="x" size={22} color={T.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan from photo</Text>
          <Text style={styles.photoCount}>
            {photos.length}/{MAX_PHOTOS}
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Add up to {MAX_PHOTOS} photos with clear printed text.
        </Text>

        {photos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stripScroll}
            contentContainerStyle={styles.stripContent}
          >
            {photos.map((photo, index) => (
              <View key={photo.uri + index} style={styles.thumbWrapper}>
                <Image source={{ uri: photo.uri }} style={styles.thumb} />
                <View style={styles.thumbOverlay}>
                  <Text style={styles.thumbIndex}>{index + 1}</Text>
                </View>
                <View style={styles.thumbActions}>
                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => movePhotoLeft(index)}
                      style={styles.thumbActionBtn}
                    >
                      <Feather name="chevron-left" size={14} color={T.text} />
                    </TouchableOpacity>
                  )}
                  {index < photos.length - 1 && (
                    <TouchableOpacity
                      onPress={() => movePhotoRight(index)}
                      style={styles.thumbActionBtn}
                    >
                      <Feather name="chevron-right" size={14} color={T.text} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    style={[styles.thumbActionBtn, styles.thumbDeleteBtn]}
                  >
                    <Feather name="trash-2" size={14} color={T.wrong} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={pickPhoto}
                disabled={isProcessing}
              >
                <Feather name="plus" size={28} color={T.primary} />
                <Text style={styles.addMoreLabel}>Add photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          <TouchableOpacity style={styles.emptyPickArea} onPress={pickPhoto}>
            <Feather name="camera" size={40} color={T.primary} />
            <Text style={styles.emptyPickTitle}>Add a photo</Text>
            <Text style={styles.emptyPickSub}>
              Tap here if the picker didn&apos;t open — camera or library
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color={T.primary} />
              <Text style={styles.processingText}>{processingStatus}</Text>
            </View>
          ) : Platform.OS === "web" ? (
            React.createElement(
              "button",
              {
                ref: webOcrButtonRef,
                type: "button",
                onClick: (event: any) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void runOcr();
                },
                disabled: photos.length === 0,
                style: {
                  ...styles.webOcrBtn,
                  ...(photos.length === 0 ? styles.webOcrBtnDisabled : null),
                } as any,
              },
              `Extract text${photos.length > 1 ? ` (${photos.length} photos)` : ""}`
            )
          ) : (
            <TouchableOpacity
              style={[
                styles.ocrBtn,
                photos.length === 0 && styles.ocrBtnDisabled,
              ]}
              onPress={() => {
                void runOcr();
              }}
              disabled={photos.length === 0}
              activeOpacity={0.85}
            >
              <Feather name="zap" size={18} color="#fff" />
              <Text style={styles.ocrBtnText}>
                Extract text{photos.length > 1 ? ` (${photos.length} photos)` : ""}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hidden WebView for Tesseract.js */}
        <View style={styles.hiddenWebView}>
          {WebViewComponent ? (
            <WebViewComponent
              ref={webViewRef}
              source={{ html: TESSERACT_WEBVIEW_HTML }}
              onMessage={handleWebViewMessage}
              javaScriptEnabled
              originWhitelist={["about:", "blob:"]}
              onLoadEnd={() => {
                // eslint-disable-next-line no-console
                console.log("[OCR WebView] load end");
              }}
              onHttpError={(e: any) => {
                // eslint-disable-next-line no-console
                console.log("[OCR WebView] http error", e?.nativeEvent);
              }}
              onError={(e: any) => {
                setIsProcessing(false);
                // eslint-disable-next-line no-console
                console.log("[OCR WebView] error", e?.nativeEvent);
                Alert.alert(
                  "Error",
                  e?.nativeEvent?.description || "Couldn't load text recognition."
                );
              }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  closeBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: T.text,
    letterSpacing: -0.4,
  },
  photoCount: {
    fontSize: 13,
    color: T.tertiary,
    fontWeight: "600" as const,
  },
  subtitle: {
    fontSize: 13,
    color: T.secondary,
    marginBottom: 20,
  },
  stripScroll: { flexGrow: 0 },
  stripContent: {
    paddingBottom: 8,
    gap: 12,
    flexDirection: "row",
  },
  thumbWrapper: {
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
  },
  thumb: { width: "100%", height: "100%", resizeMode: "cover" },
  thumbOverlay: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  thumbIndex: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  thumbActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  thumbActionBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  thumbDeleteBtn: {
    marginLeft: 4,
  },
  addMoreBtn: {
    width: 120,
    height: 160,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: T.primary,
    borderStyle: "dashed" as const,
    backgroundColor: T.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addMoreLabel: {
    fontSize: 12,
    color: T.primary,
    fontWeight: "600" as const,
  },
  emptyPickArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: T.border,
    borderStyle: "dashed" as const,
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyPickTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: T.text,
  },
  emptyPickSub: {
    fontSize: 13,
    color: T.secondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  footer: { marginTop: "auto", paddingTop: 16 },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
  },
  processingText: {
    fontSize: 14,
    color: T.secondary,
  },
  ocrBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ocrBtnDisabled: { opacity: 0.45 },
  ocrBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  webOcrBtn: {
    width: "100%",
    backgroundColor: T.primary,
    borderRadius: 14,
    borderWidth: 0,
    paddingTop: 16,
    paddingBottom: 16,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
    cursor: "pointer",
  },
  webOcrBtnDisabled: {
    opacity: 0.45,
    cursor: "default",
  },
  hiddenWebView: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: "none" as const,
  },
});
