import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useRef, useState } from "react";
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
import { WebView } from "react-native-webview";

import { T } from "@/constants/tokens";
import { TESSERACT_WEBVIEW_HTML } from "@/lib/ocrWebViewHtml";

const MAX_PHOTOS = 5;

export interface OcrWord {
  text: string;
  confidence: number;
}

export interface OcrPageResult {
  words: OcrWord[];
  rawText: string;
}

interface CapturedPhoto {
  uri: string;
  base64?: string;
}

interface CameraOCRModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (text: string, words: OcrWord[]) => void;
}


export default function CameraOCRModal({
  visible,
  onClose,
  onConfirm,
}: CameraOCRModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const webViewReadyRef = useRef(false);
  const pendingOcrRef = useRef<string[] | null>(null);

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
              quality: 0.8,
              base64: true,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              setPhotos((prev) => [
                ...prev,
                { uri: asset.uri, base64: asset.base64 ?? undefined },
              ]);
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
              quality: 0.8,
              base64: true,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              setPhotos((prev) => [
                ...prev,
                { uri: asset.uri, base64: asset.base64 ?? undefined },
              ]);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  }, [photos.length]);

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

  const runOcr = useCallback(() => {
    if (photos.length === 0 || isProcessing) return;

    const base64Images = photos.map((p) => {
      if (p.base64) return `data:image/jpeg;base64,${p.base64}`;
      return p.uri;
    });

    setIsProcessing(true);
    setProcessingStatus("Initialising OCR engine…");

    if (webViewReadyRef.current) {
      const script = `(function() { window.runOCR(${JSON.stringify(base64Images)}); })(); true;`;
      webViewRef.current?.injectJavaScript(script);
    } else {
      pendingOcrRef.current = base64Images;
    }
  }, [photos, isProcessing]);

  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
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
            setProcessingStatus("Loading OCR engine…");
          } else {
            setProcessingStatus(
              `Processing photo ${msg.page} of ${msg.total}…`
            );
          }
        } else if (msg.type === "result") {
          setIsProcessing(false);
          const pages: OcrPageResult[] = msg.pages;
          const allWords: OcrWord[] = [];
          const textParts: string[] = [];

          for (const page of pages) {
            allWords.push(...page.words);
            textParts.push(page.rawText.trim());
          }

          const stitchedText = textParts.join("\n---\n");
          reset();
          onConfirm(stitchedText, allWords);
        } else if (msg.type === "error") {
          setIsProcessing(false);
          Alert.alert("OCR Error", msg.message || "Could not process the images. Please try again.");
        }
      } catch {
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
          <Text style={styles.headerTitle}>Camera OCR</Text>
          <Text style={styles.photoCount}>
            {photos.length}/{MAX_PHOTOS}
          </Text>
        </View>

        <Text style={styles.subtitle}>
          Photograph printed text — up to {MAX_PHOTOS} pages.
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
            <Text style={styles.emptyPickTitle}>Add your first photo</Text>
            <Text style={styles.emptyPickSub}>
              Take a photo or choose from your library
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator size="small" color={T.primary} />
              <Text style={styles.processingText}>{processingStatus}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.ocrBtn,
                photos.length === 0 && styles.ocrBtnDisabled,
              ]}
              onPress={runOcr}
              disabled={photos.length === 0}
              activeOpacity={0.85}
            >
              <Feather name="zap" size={18} color="#fff" />
              <Text style={styles.ocrBtnText}>
                Run OCR{photos.length > 1 ? ` on ${photos.length} photos` : ""}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hidden WebView for Tesseract.js */}
        <View style={styles.hiddenWebView}>
          <WebView
            ref={webViewRef}
            source={{ html: TESSERACT_WEBVIEW_HTML }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            originWhitelist={["about:", "blob:"]}
            onError={() => {
              setIsProcessing(false);
              Alert.alert("Error", "Failed to load OCR engine.");
            }}
          />
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
  hiddenWebView: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: "none" as const,
  },
});
