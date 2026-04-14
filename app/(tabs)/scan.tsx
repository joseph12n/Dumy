import { isOCRAvailable, recognizeText } from "@/src/api/ai/ocrEngine";
import { parseReceipt } from "@/src/api/ai/receiptParser";
import { FadeInView, ScalePress } from "@/src/components/animated";
import { BrandHeader, CandyCard } from "@/src/components/common";
import { useChatStore } from "@/src/store/chatStore";
import { useSettingsStore } from "@/src/store/settingsStore";
import { ReceiptData, ScanStatus } from "@/src/store/types";
import {
    applyShadow,
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
    toRgba,
} from "@/src/theme/designRuntime";
import { formatCOP } from "@/src/utils/currency";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScanMode = "receipt" | "prices" | "numbers";

/**
 * Extract all numeric values from raw OCR text (for price/number mode).
 * Returns deduplicated values >= 100 (in COP).
 */
function extractAllNumbers(rawText: string): number[] {
  const patterns = [
    /\$\s?([\d]{1,3}(?:[.,]\d{3})*)/g,
    /(?<!\d)([\d]{1,3}(?:\.\d{3})+)(?!\d)/g,
    /(?<!\d)([\d]{3,10})(?!\d)/g,
  ];

  const values: Set<number> = new Set();
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(rawText)) !== null) {
      const cleaned = (match[1] ?? match[0])
        .replace(/[$\s]/g, "")
        .replace(/\./g, "")
        .replace(/,/g, "");
      const v = parseInt(cleaned, 10);
      if (Number.isFinite(v) && v >= 100) {
        values.add(v);
      }
    }
  }
  return [...values].sort((a, b) => b - a);
}

export default function ScanReceiptScreen() {
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const attachReceipt = useChatStore((s) => s.attachReceipt);

  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scanMode, setScanMode] = useState<ScanMode>("receipt");
  const [showCamera, setShowCamera] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [detectedNumbers, setDetectedNumbers] = useState<number[]>([]);
  const [rawOcrText, setRawOcrText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a la camara para escanear.",
        );
        return;
      }
    }
    setShowCamera(true);
    setStatus("capturing");
    setReceipt(null);
    setDetectedNumbers([]);
    setOcrError(null);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo?.uri) {
        setImageUri(photo.uri);
        setShowCamera(false);
        await processImage(photo.uri);
      }
    } catch (err) {
      console.error("[Scan] Error taking photo:", err);
      setOcrError("No se pudo tomar la foto.");
      setStatus("error");
      setShowCamera(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setReceipt(null);
        setDetectedNumbers([]);
        setOcrError(null);
        await processImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("[Scan] Error picking image:", err);
      setOcrError("No se pudo abrir la galeria.");
      setStatus("error");
    }
  };

  const processImage = async (uri: string) => {
    setStatus("processing");
    setOcrError(null);

    const ocrResult = await recognizeText(uri);

    if (!ocrResult.success) {
      setOcrError(ocrResult.error ?? "No se pudo leer la imagen.");
      setStatus("error");
      return;
    }

    if (ocrResult.text.trim().length === 0) {
      setOcrError("No se detecto texto en la imagen. Intenta con otra foto.");
      setStatus("error");
      return;
    }

    setRawOcrText(ocrResult.text);

    if (scanMode === "receipt") {
      const parsed = parseReceipt(ocrResult.text);
      setReceipt(parsed);
    } else {
      // prices or numbers mode — just extract all numbers
      const numbers = extractAllNumbers(ocrResult.text);
      setDetectedNumbers(numbers);

      // Also create a receipt-like structure for chat integration
      const items = numbers.map((n, i) => ({
        description: `Valor ${i + 1}`,
        amount: n,
      }));
      const sum = numbers.reduce((s, n) => s + n, 0);
      setReceipt({
        items,
        subtotal: null,
        tax: null,
        total: null,
        calculatedSum: sum,
        date: null,
        vendor: null,
        rawText: ocrResult.text,
        confidence: numbers.length > 0 ? 0.7 : 0.3,
      });
    }

    setStatus("parsed");
  };

  const handleSendToChat = () => {
    if (!receipt) return;
    attachReceipt(receipt);
    router.push("/chat");
  };

  const handleAddAsExpense = () => {
    if (!receipt) return;
    router.push("/add");
  };

  const numbersSum = detectedNumbers.reduce((s, n) => s + n, 0);

  const SCAN_MODES: { key: ScanMode; label: string; icon: string }[] = [
    { key: "receipt", label: "Recibo", icon: "file-text-o" },
    { key: "prices", label: "Precios", icon: "tag" },
    { key: "numbers", label: "Numeros", icon: "calculator" },
  ];

  /* Camera view */
  if (showCamera) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#000" }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View className="flex-1 justify-end items-center pb-10">
            <View className="flex-row items-center gap-6">
              <ScalePress
                onPress={() => {
                  setShowCamera(false);
                  setStatus("idle");
                }}
                className="w-14 h-14 rounded-full bg-white/30 items-center justify-center"
              >
                <FontAwesome name="close" size={22} color="#fff" />
              </ScalePress>
              <ScalePress
                onPress={handleTakePhoto}
                className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
                style={{ backgroundColor: design.palette.primary }}
              >
                <FontAwesome name="camera" size={28} color="#fff" />
              </ScalePress>
              <View className="w-14 h-14" />
            </View>
            <Text className="text-white/70 text-sm mt-4">
              {scanMode === "receipt"
                ? "Centra el recibo en el encuadre"
                : scanMode === "prices"
                  ? "Enfoca los precios del producto"
                  : "Enfoca los numeros que quieres sumar"}
            </Text>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  /* Main view */
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <BrandHeader
        title="Dumy"
        subtitle="Escaner inteligente"
        rightIcon="close"
        onRightPress={() => router.back()}
      />

      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Scan mode selector */}
        <FadeInView delay={50}>
          <View className="flex-row gap-2 mb-4">
            {SCAN_MODES.map((mode) => {
              const active = scanMode === mode.key;
              return (
                <ScalePress
                  key={mode.key}
                  onPress={() => {
                    setScanMode(mode.key);
                    setReceipt(null);
                    setDetectedNumbers([]);
                    setStatus("idle");
                  }}
                  className="flex-1 py-3 items-center border"
                  style={{
                    borderRadius: getCornerRadius(design.radius, "pill"),
                    borderColor: active
                      ? design.palette.primary
                      : design.palette.borderLight,
                    backgroundColor: active
                      ? `${design.palette.primary}15`
                      : design.palette.surfaceLight,
                  }}
                >
                  <FontAwesome
                    name={mode.icon as any}
                    size={16}
                    color={
                      active
                        ? design.palette.primary
                        : design.palette.borderDark
                    }
                  />
                  <Text
                    className="mt-1"
                    style={{
                      fontSize: scaleFont(11, design.fontScale),
                      color: active
                        ? design.palette.primary
                        : design.palette.borderDark,
                      fontWeight: active ? "700" : "500",
                    }}
                  >
                    {mode.label}
                  </Text>
                </ScalePress>
              );
            })}
          </View>
        </FadeInView>

        {/* Capture buttons */}
        <View className="gap-3">
          <FadeInView delay={100}>
            <ScalePress
              onPress={handleOpenCamera}
              className="p-5 border"
              style={{
                borderRadius: getCornerRadius(design.radius, "card"),
                backgroundColor: toRgba(design.palette.surfaceLight, 0.88),
                borderColor: design.palette.borderLight,
                ...applyShadow(design.shadows.card),
              }}
            >
              <View className="flex-row items-center gap-3">
                <LinearGradient
                  colors={design.gradients.hero.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesome name="camera" size={20} color="#fff" />
                </LinearGradient>
                <View className="flex-1">
                  <Text
                    className="text-candy-text font-bold"
                    style={{ fontSize: scaleFont(15, design.fontScale) }}
                    numberOfLines={1}
                  >
                    {scanMode === "receipt"
                      ? "Tomar foto del recibo"
                      : scanMode === "prices"
                        ? "Fotografiar precios"
                        : "Fotografiar numeros"}
                  </Text>
                  <Text
                    className="text-candy-text-secondary mt-1"
                    style={{ fontSize: scaleFont(12, design.fontScale) }}
                  >
                    {scanMode === "receipt"
                      ? "Facturas, tickets y recibos"
                      : scanMode === "prices"
                        ? "Etiquetas de precios, listas de productos"
                        : "Numeros escritos a mano, cuentas"}
                  </Text>
                </View>
              </View>
            </ScalePress>
          </FadeInView>

          <FadeInView delay={150}>
            <ScalePress
              onPress={handlePickFromGallery}
              className="p-5 border"
              style={{
                borderRadius: getCornerRadius(design.radius, "card"),
                backgroundColor: toRgba(design.palette.surfaceLight, 0.88),
                borderColor: design.palette.borderLight,
                ...applyShadow(design.shadows.card),
              }}
            >
              <View className="flex-row items-center gap-3">
                <LinearGradient
                  colors={design.gradients.secondary.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesome name="image" size={20} color="#fff" />
                </LinearGradient>
                <View className="flex-1">
                  <Text
                    className="text-candy-text font-bold"
                    style={{ fontSize: scaleFont(15, design.fontScale) }}
                    numberOfLines={1}
                  >
                    Cargar desde galeria
                  </Text>
                  <Text
                    className="text-candy-text-secondary mt-1"
                    style={{ fontSize: scaleFont(12, design.fontScale) }}
                  >
                    Imagenes guardadas previamente
                  </Text>
                </View>
              </View>
            </ScalePress>
          </FadeInView>
        </View>

        {/* Processing indicator */}
        {status === "processing" && (
          <FadeInView slideFrom={10}>
            <View className="items-center py-10">
              <ActivityIndicator size="large" color={design.palette.primary} />
              <Text
                className="text-candy-text-secondary mt-3"
                style={{ fontSize: scaleFont(14, design.fontScale) }}
              >
                {scanMode === "receipt"
                  ? "Leyendo recibo..."
                  : scanMode === "prices"
                    ? "Detectando precios..."
                    : "Detectando numeros..."}
              </Text>
            </View>
          </FadeInView>
        )}

        {/* Error state */}
        {status === "error" && ocrError && (
          <FadeInView className="mt-4">
            <CandyCard variant="default" animated={false}>
              <View className="flex-row items-center gap-2">
                <FontAwesome
                  name="exclamation-triangle"
                  size={16}
                  color="#e53e3e"
                />
                <Text className="text-candy-error text-sm flex-1">
                  {ocrError}
                </Text>
              </View>
              {!isOCRAvailable() && (
                <Text className="text-candy-text-secondary text-xs mt-2">
                  El OCR requiere un build nativo (EAS Build). En Expo Go no
                  esta disponible.
                </Text>
              )}
            </CandyCard>
          </FadeInView>
        )}

        {/* Image preview */}
        {imageUri && status !== "capturing" && (
          <FadeInView delay={50} className="mt-4">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-48"
              style={{
                borderRadius: getCornerRadius(design.radius, "card"),
              }}
              resizeMode="cover"
            />
          </FadeInView>
        )}

        {/* Parsed receipt results (receipt mode) */}
        {status === "parsed" && receipt && scanMode === "receipt" && (
          <View className="mt-4 gap-3">
            {/* Vendor & date */}
            <FadeInView delay={100}>
              <CandyCard variant="glass" animated={false}>
                <Text
                  className="text-candy-text font-bold mb-2"
                  style={{ fontSize: scaleFont(16, design.fontScale) }}
                >
                  Datos del recibo
                </Text>
                {receipt.vendor && (
                  <Text
                    className="text-candy-text"
                    style={{ fontSize: scaleFont(14, design.fontScale) }}
                    numberOfLines={2}
                  >
                    Establecimiento: {receipt.vendor}
                  </Text>
                )}
                {receipt.date && (
                  <Text
                    className="text-candy-text-secondary"
                    style={{ fontSize: scaleFont(13, design.fontScale) }}
                  >
                    Fecha: {receipt.date}
                  </Text>
                )}
                <Text className="text-candy-text-secondary text-xs mt-1">
                  Confianza: {(receipt.confidence * 100).toFixed(0)}%
                </Text>
              </CandyCard>
            </FadeInView>

            {/* Line items */}
            {receipt.items.length > 0 && (
              <FadeInView delay={200}>
                <CandyCard variant="glass" animated={false}>
                  <Text
                    className="text-candy-text font-bold mb-2"
                    style={{ fontSize: scaleFont(15, design.fontScale) }}
                  >
                    Articulos ({receipt.items.length})
                  </Text>
                  {receipt.items.map((item, idx) => (
                    <View
                      key={idx}
                      className={`flex-row justify-between ${idx > 0 ? "mt-2 pt-2 border-t border-candy-outline-light" : ""}`}
                    >
                      <Text
                        className="text-candy-text flex-1 mr-2"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                      <Text
                        className="text-candy-text font-semibold"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                      >
                        {formatCOP(item.amount)}
                      </Text>
                    </View>
                  ))}
                </CandyCard>
              </FadeInView>
            )}

            {/* Totals */}
            <FadeInView delay={300}>
              <CandyCard variant="purple" animated={false}>
                <View className="gap-1">
                  {receipt.subtotal !== null && (
                    <View className="flex-row justify-between">
                      <Text
                        className="text-candy-text"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                      >
                        Subtotal
                      </Text>
                      <Text
                        className="text-candy-text font-semibold"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                      >
                        {formatCOP(receipt.subtotal)}
                      </Text>
                    </View>
                  )}
                  {receipt.tax !== null && (
                    <View className="flex-row justify-between">
                      <Text
                        className="text-candy-text"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                      >
                        IVA
                      </Text>
                      <Text
                        className="text-candy-text font-semibold"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                      >
                        {formatCOP(receipt.tax)}
                      </Text>
                    </View>
                  )}
                  {receipt.total !== null && (
                    <View className="flex-row justify-between mt-1 pt-1 border-t border-candy-outline-light">
                      <Text
                        className="text-candy-text font-bold"
                        style={{ fontSize: scaleFont(16, design.fontScale) }}
                      >
                        Total
                      </Text>
                      <Text
                        className="text-candy-text font-bold"
                        style={{ fontSize: scaleFont(16, design.fontScale) }}
                      >
                        {formatCOP(receipt.total)}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between mt-1">
                    <Text
                      className="text-candy-text-secondary"
                      style={{ fontSize: scaleFont(12, design.fontScale) }}
                    >
                      Suma calculada
                    </Text>
                    <Text
                      className="text-candy-text-secondary font-medium"
                      style={{ fontSize: scaleFont(12, design.fontScale) }}
                    >
                      {formatCOP(receipt.calculatedSum)}
                    </Text>
                  </View>
                </View>
              </CandyCard>
            </FadeInView>

            {/* Actions */}
            <FadeInView delay={400}>
              <View className="flex-row gap-3 mt-1 mb-8">
                <ScalePress onPress={handleSendToChat} className="flex-1">
                  <LinearGradient
                    colors={design.gradients.hero.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="py-3 items-center"
                    style={{
                      borderRadius: getCornerRadius(design.radius, "pill"),
                      ...applyShadow(design.shadows.button),
                    }}
                  >
                    <Text
                      className="text-white font-bold"
                      style={{ fontSize: scaleFont(14, design.fontScale) }}
                    >
                      Analizar con Dumy
                    </Text>
                  </LinearGradient>
                </ScalePress>
                <ScalePress
                  onPress={handleAddAsExpense}
                  className="flex-1 py-3 items-center border"
                  style={{
                    borderRadius: getCornerRadius(design.radius, "pill"),
                    borderColor: design.palette.borderLight,
                  }}
                >
                  <Text
                    className="text-candy-text font-bold"
                    style={{ fontSize: scaleFont(14, design.fontScale) }}
                  >
                    Registrar gasto
                  </Text>
                </ScalePress>
              </View>
            </FadeInView>
          </View>
        )}

        {/* Prices / Numbers results */}
        {status === "parsed" &&
          (scanMode === "prices" || scanMode === "numbers") && (
            <View className="mt-4 gap-3">
              <FadeInView delay={100}>
                <CandyCard variant="glass" animated={false}>
                  <Text
                    className="text-candy-text font-bold mb-2"
                    style={{ fontSize: scaleFont(16, design.fontScale) }}
                  >
                    {scanMode === "prices"
                      ? "Precios detectados"
                      : "Numeros detectados"}
                  </Text>
                  {detectedNumbers.length === 0 ? (
                    <Text
                      className="text-candy-text-secondary"
                      style={{ fontSize: scaleFont(13, design.fontScale) }}
                    >
                      No se detectaron{" "}
                      {scanMode === "prices" ? "precios" : "numeros"} claros.
                      Intenta con otra foto mas nitida.
                    </Text>
                  ) : (
                    detectedNumbers.map((num, idx) => (
                      <View
                        key={idx}
                        className={`flex-row justify-between items-center ${idx > 0 ? "mt-2 pt-2 border-t border-candy-outline-light" : ""}`}
                      >
                        <Text
                          className="text-candy-text"
                          style={{ fontSize: scaleFont(14, design.fontScale) }}
                        >
                          {scanMode === "prices"
                            ? `Precio ${idx + 1}`
                            : `Valor ${idx + 1}`}
                        </Text>
                        <Text
                          className="text-candy-text font-semibold"
                          style={{ fontSize: scaleFont(14, design.fontScale) }}
                        >
                          {formatCOP(num)}
                        </Text>
                      </View>
                    ))
                  )}
                </CandyCard>
              </FadeInView>

              {/* Sum total */}
              {detectedNumbers.length > 0 && (
                <FadeInView delay={200}>
                  <CandyCard variant="purple" animated={false}>
                    <View className="flex-row justify-between items-center">
                      <Text
                        className="text-candy-text font-bold"
                        style={{ fontSize: scaleFont(18, design.fontScale) }}
                      >
                        SUMA TOTAL
                      </Text>
                      <Text
                        className="text-candy-text font-bold"
                        style={{ fontSize: scaleFont(18, design.fontScale) }}
                      >
                        {formatCOP(numbersSum)}
                      </Text>
                    </View>
                    <Text
                      className="text-candy-text-secondary mt-1"
                      style={{ fontSize: scaleFont(12, design.fontScale) }}
                    >
                      {detectedNumbers.length} valor(es) sumados
                    </Text>
                  </CandyCard>
                </FadeInView>
              )}

              {/* Actions */}
              <FadeInView delay={300}>
                <View className="flex-row gap-3 mt-1 mb-8">
                  <ScalePress onPress={handleSendToChat} className="flex-1">
                    <LinearGradient
                      colors={design.gradients.hero.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="py-3 items-center"
                      style={{
                        borderRadius: getCornerRadius(design.radius, "pill"),
                        ...applyShadow(design.shadows.button),
                      }}
                    >
                      <Text
                        className="text-white font-bold"
                        style={{ fontSize: scaleFont(14, design.fontScale) }}
                      >
                        Analizar con Dumy
                      </Text>
                    </LinearGradient>
                  </ScalePress>
                  {numbersSum > 0 && (
                    <ScalePress
                      onPress={handleAddAsExpense}
                      className="flex-1 py-3 items-center border"
                      style={{
                        borderRadius: getCornerRadius(design.radius, "pill"),
                        borderColor: design.palette.borderLight,
                      }}
                    >
                      <Text
                        className="text-candy-text font-bold"
                        style={{ fontSize: scaleFont(14, design.fontScale) }}
                      >
                        Registrar gasto
                      </Text>
                    </ScalePress>
                  )}
                </View>
              </FadeInView>

              {/* Raw text preview */}
              {rawOcrText.length > 0 && (
                <FadeInView delay={400}>
                  <CandyCard variant="default" animated={false}>
                    <Text
                      className="text-candy-text font-bold mb-2"
                      style={{ fontSize: scaleFont(13, design.fontScale) }}
                    >
                      Texto detectado
                    </Text>
                    <Text
                      className="text-candy-text-secondary"
                      style={{
                        fontSize: scaleFont(11, design.fontScale),
                        fontFamily:
                          "monospace",
                      }}
                      selectable
                    >
                      {rawOcrText.slice(0, 500)}
                      {rawOcrText.length > 500 ? "..." : ""}
                    </Text>
                  </CandyCard>
                </FadeInView>
              )}
            </View>
          )}

        {/* Empty state hint */}
        {status === "idle" && (
          <FadeInView delay={200}>
            <View className="items-center py-8">
              <FontAwesome
                name={
                  scanMode === "receipt"
                    ? "file-text-o"
                    : scanMode === "prices"
                      ? "tag"
                      : "calculator"
                }
                size={48}
                color={design.palette.borderLight}
              />
              <Text
                className="text-candy-text-secondary text-center mt-3 max-w-[280px]"
                style={{ fontSize: scaleFont(13, design.fontScale) }}
              >
                {scanMode === "receipt"
                  ? "Toma una foto o carga una imagen para extraer datos del recibo. Todo se procesa localmente."
                  : scanMode === "prices"
                    ? "Fotografía etiquetas de precios o listas de productos para detectar y sumar valores automaticamente."
                    : "Fotografía numeros escritos a mano o en papel para que Dumy los sume por ti."}
              </Text>
            </View>
          </FadeInView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
