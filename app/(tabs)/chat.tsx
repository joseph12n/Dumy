import { FadeInView, ScalePress } from "@/src/components/animated";
import { BrandHeader } from "@/src/components/common";
import { useChat } from "@/src/hooks/useChat";
import { useSetting } from "@/src/hooks/useSettings";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
    applyShadow,
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
    toRgba,
} from "@/src/theme/designRuntime";
import { getRelativeTimeLabel } from "@/src/utils/dates";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const {
    messages,
    isResponding,
    error,
    sendMessage,
    clearSession,
    lastReceipt,
  } = useChat();
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const profileName = useSetting("profile_name", "");
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const status = error
    ? {
        label: "Con incidencia en el servicio",
        dotClassName: "bg-candy-error",
        textClassName: "text-candy-error",
      }
    : isResponding
      ? {
          label: "Procesando respuesta",
          dotClassName: "bg-candy-purple",
          textClassName: "text-candy-text-secondary",
        }
      : {
          label: "Listo en modo offline",
          dotClassName: "bg-candy-blue",
          textClassName: "text-candy-text-secondary",
        };

  const handleSend = async () => {
    const text = input.trim();
    const image = attachedImage;

    if (!text && !image && !lastReceipt) return;
    if (isResponding) return;

    setInput("");
    setAttachedImage(null);

    const messageText =
      text || (image ? "Analiza esta imagen" : "Analiza el recibo adjunto");
    await sendMessage(messageText, image ?? undefined);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleAttachImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAttachedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("[Chat] Error picking image:", err);
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: design.palette.backgroundLight }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <View className="border-b border-candy-outline-light pb-1">
          <BrandHeader
            title="Dumy AI"
            subtitle="Asistente financiero"
            status={status}
            rightIcon="refresh"
            onRightPress={clearSession}
          />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <FadeInView delay={200} slideFrom={20}>
              <View className="items-center py-8">
                <LinearGradient
                  colors={design.gradients.hero.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    ...applyShadow(design.shadows.hero),
                  }}
                >
                  <FontAwesome name="comments" size={28} color="#fff" />
                </LinearGradient>
                <Text
                  className="text-candy-text font-bold text-center mb-2"
                  style={{ fontSize: scaleFont(20, design.fontScale) }}
                >
                  {profileName
                    ? `Hola ${profileName}, soy Dumy`
                    : "Hola! Soy Dumy"}
                </Text>
                <Text
                  className="text-candy-text-secondary text-center max-w-[280px]"
                  style={{ fontSize: scaleFont(13, design.fontScale) }}
                >
                  Tu asistente financiero offline. Preguntame sobre tus gastos,
                  ahorro, presupuestos, o adjunta una foto de un recibo.
                </Text>

                {/* Quick Prompts */}
                <View className="mt-6 gap-2 w-full">
                  {[
                    "Como van mis gastos este mes?",
                    "Dame tips de ahorro",
                    "Que me recomiendas?",
                    "Hay alertas importantes?",
                    "Que puedes hacer?",
                  ].map((prompt, idx) => (
                    <FadeInView
                      key={prompt}
                      delay={350 + idx * 60}
                      slideFrom={12}
                    >
                      <ScalePress
                        onPress={() => setInput(prompt)}
                        scaleValue={0.98}
                        className="px-4 py-3 border"
                        style={{
                          backgroundColor: toRgba(
                            design.palette.surfaceLight,
                            0.88,
                          ),
                          borderColor: design.palette.borderLight,
                          borderRadius: getCornerRadius(design.radius, "card"),
                          ...applyShadow(design.shadows.card),
                        }}
                      >
                        <Text
                          className="text-candy-text"
                          style={{ fontSize: scaleFont(13, design.fontScale) }}
                        >
                          {prompt}
                        </Text>
                      </ScalePress>
                    </FadeInView>
                  ))}
                </View>
              </View>
            </FadeInView>
          )}

          {/* Receipt notification */}
          {lastReceipt && messages.length === 0 && (
            <FadeInView delay={100}>
              <View
                className="px-4 py-3 mb-3 border"
                style={{
                  borderRadius: getCornerRadius(design.radius, "card"),
                  borderColor: design.palette.primary,
                  backgroundColor: `${design.palette.primary}10`,
                }}
              >
                <Text
                  className="font-semibold"
                  style={{
                    color: design.palette.primary,
                    fontSize: scaleFont(13, design.fontScale),
                  }}
                  numberOfLines={2}
                >
                  Recibo adjunto: {lastReceipt.vendor ?? "Sin nombre"}
                  {lastReceipt.total !== null
                    ? ` — Total: $${lastReceipt.total.toLocaleString("es-CO")}`
                    : ""}
                </Text>
                <Text
                  className="text-candy-text-secondary mt-1"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  Escribe un mensaje o toca enviar para que Dumy lo analice.
                </Text>
              </View>
            </FadeInView>
          )}

          {/* Chat Messages */}
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <FadeInView
                key={msg.id}
                delay={idx > messages.length - 3 ? 50 : 0}
                slideFrom={isUser ? 0 : 10}
                duration={300}
              >
                <View
                  className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
                >
                  {isUser ? (
                    <LinearGradient
                      colors={design.gradients.hero.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="px-4 py-3"
                      style={{
                        borderRadius: getCornerRadius(design.radius, "card"),
                        borderBottomRightRadius: 6,
                        ...applyShadow(design.shadows.button),
                      }}
                    >
                      <Text
                        className="text-white"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                        selectable
                      >
                        {msg.content}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      className="px-4 py-3"
                      style={{
                        borderRadius: getCornerRadius(design.radius, "card"),
                        borderBottomLeftRadius: 6,
                        backgroundColor: toRgba(
                          design.palette.surfaceLight,
                          0.94,
                        ),
                        borderWidth: 1,
                        borderColor: design.palette.borderLight,
                        ...applyShadow(design.shadows.card),
                      }}
                    >
                      <Text
                        className="text-candy-text"
                        style={{ fontSize: scaleFont(13, design.fontScale) }}
                        selectable
                      >
                        {msg.content}
                      </Text>
                    </View>
                  )}
                  <Text
                    className={`text-xs text-candy-text-secondary mt-1 ${isUser ? "text-right" : "text-left"}`}
                  >
                    {getRelativeTimeLabel(msg.createdAt)}
                  </Text>
                </View>
              </FadeInView>
            );
          })}

          {/* Typing Indicator */}
          {isResponding && (
            <FadeInView slideFrom={8} duration={250}>
              <View className="self-start mb-3 max-w-[85%]">
                <View
                  className="rounded-bl-sm px-4 py-3 flex-row items-center gap-2"
                  style={{
                    borderRadius: getCornerRadius(design.radius, "card"),
                    backgroundColor: toRgba(design.palette.surfaceLight, 0.94),
                    borderWidth: 1,
                    borderColor: design.palette.borderLight,
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color={design.palette.primary}
                  />
                  <Text
                    className="text-candy-text-secondary"
                    style={{ fontSize: scaleFont(13, design.fontScale) }}
                  >
                    Dumy esta pensando...
                  </Text>
                </View>
              </View>
            </FadeInView>
          )}

          {/* Error */}
          {error && (
            <FadeInView>
              <View
                className="px-4 py-3 mb-3"
                style={{
                  borderRadius: getCornerRadius(design.radius, "card"),
                  backgroundColor: toRgba("#e53e3e", 0.1),
                  borderWidth: 1,
                  borderColor: toRgba("#e53e3e", 0.35),
                }}
              >
                <Text className="text-candy-error text-sm">{error}</Text>
              </View>
            </FadeInView>
          )}

          <View className="h-4" />
        </ScrollView>

        {/* Attached image preview */}
        {attachedImage && (
          <FadeInView duration={200} slideFrom={10}>
            <View
              className="px-4 pt-2 flex-row items-center gap-2"
              style={{ backgroundColor: design.palette.backgroundLight }}
            >
              <Image
                source={{ uri: attachedImage }}
                className="w-14 h-14"
                style={{
                  borderRadius: getCornerRadius(design.radius, "card"),
                }}
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(12, design.fontScale) }}
                >
                  Imagen adjunta — se procesara con OCR
                </Text>
              </View>
              <ScalePress onPress={handleRemoveImage}>
                <FontAwesome
                  name="times-circle"
                  size={20}
                  color={design.palette.borderDark}
                />
              </ScalePress>
            </View>
          </FadeInView>
        )}

        {/* Input Bar */}
        <View
          className="px-4 py-3 border-t"
          style={{
            borderColor: design.palette.borderLight,
            backgroundColor: design.palette.backgroundLight,
          }}
        >
          <View className="flex-row items-center gap-2">
            {/* Attach image button */}
            <ScalePress
              onPress={handleAttachImage}
              disabled={isResponding}
              className="w-11 h-11 items-center justify-center"
              style={{
                borderRadius: getCornerRadius(design.radius, "pill"),
                backgroundColor: design.palette.surfaceLight,
              }}
            >
              <FontAwesome
                name="camera"
                size={16}
                color={isResponding ? "#ccc" : design.palette.secondary}
              />
            </ScalePress>

            <View
              className="flex-1 flex-row items-center bg-white border px-4"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "pill"),
              }}
            >
              <TextInput
                className="flex-1 py-3 text-candy-text"
                style={{ fontSize: scaleFont(13, design.fontScale) }}
                placeholder="Escribe un mensaje..."
                placeholderTextColor={design.palette.borderDark}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                editable={!isResponding}
              />
            </View>
            <ScalePress
              onPress={handleSend}
              disabled={
                isResponding ||
                (!input.trim() && !attachedImage && !lastReceipt)
              }
              className="w-11 h-11 items-center justify-center"
              style={{
                borderRadius: getCornerRadius(design.radius, "pill"),
                backgroundColor:
                  (input.trim() || attachedImage || lastReceipt) &&
                  !isResponding
                    ? design.palette.primary
                    : design.palette.surfaceLight,
                ...((input.trim() || attachedImage || lastReceipt) &&
                !isResponding
                  ? applyShadow(design.shadows.button)
                  : {}),
              }}
            >
              <FontAwesome
                name="send"
                size={16}
                color={
                  (input.trim() || attachedImage || lastReceipt) &&
                  !isResponding
                    ? "#fff"
                    : design.palette.borderDark
                }
              />
            </ScalePress>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
