import { BrandHeader } from "@/src/components/common";
import { useChat } from "@/src/hooks/useChat";
import { useSetting } from "@/src/hooks/useSettings";
import { useSettingsStore } from "@/src/store/settingsStore";
import {
    getCornerRadius,
    resolveRuntimeDesign,
    scaleFont,
} from "@/src/theme/designRuntime";
import { getRelativeTimeLabel } from "@/src/utils/dates";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { messages, isResponding, error, sendMessage, clearSession } =
    useChat();
  const settings = useSettingsStore((s) => s.settings);
  const design = resolveRuntimeDesign(settings);
  const profileName = useSetting("profile_name", "");
  const [input, setInput] = useState("");
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
          label: "Listo en modo hibrido",
          dotClassName: "bg-candy-blue",
          textClassName: "text-candy-text-secondary",
        };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isResponding) return;
    setInput("");
    await sendMessage(text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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
            <View className="items-center py-8">
              <View className="w-16 h-16 rounded-full bg-candy-pink-pale items-center justify-center mb-4">
                <FontAwesome name="comments" size={28} color="#e040a0" />
              </View>
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
                Tu asistente financiero personal. Preguntame sobre tus gastos,
                ahorro o presupuestos.
              </Text>

              {/* Quick Prompts */}
              <View className="mt-6 gap-2 w-full">
                {[
                  "Como van mis gastos este mes?",
                  "En que categoria gasto mas?",
                  "Dame consejos para ahorrar",
                ].map((prompt) => (
                  <TouchableOpacity
                    key={prompt}
                    onPress={() => {
                      setInput(prompt);
                    }}
                    className="px-4 py-3 border"
                    style={{
                      backgroundColor: design.palette.surfaceLight,
                      borderColor: design.palette.borderLight,
                      borderRadius: getCornerRadius(design.radius, "card"),
                    }}
                  >
                    <Text
                      className="text-candy-text"
                      style={{ fontSize: scaleFont(13, design.fontScale) }}
                    >
                      {prompt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <View
                key={msg.id}
                className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
              >
                <View
                  className="px-4 py-3"
                  style={{
                    borderRadius: getCornerRadius(design.radius, "card"),
                    borderBottomRightRadius: isUser
                      ? 6
                      : getCornerRadius(design.radius, "card"),
                    borderBottomLeftRadius: isUser
                      ? getCornerRadius(design.radius, "card")
                      : 6,
                    backgroundColor: isUser
                      ? design.palette.primary
                      : "#ffffff",
                    borderWidth: isUser ? 0 : 1,
                    borderColor: isUser
                      ? "transparent"
                      : design.palette.borderLight,
                  }}
                >
                  <Text
                    className={isUser ? "text-white" : "text-candy-text"}
                    style={{ fontSize: scaleFont(13, design.fontScale) }}
                  >
                    {msg.content}
                  </Text>
                </View>
                <Text
                  className={`text-xs text-candy-text-secondary mt-1 ${isUser ? "text-right" : "text-left"}`}
                >
                  {getRelativeTimeLabel(msg.createdAt)}
                </Text>
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isResponding && (
            <View className="self-start mb-3 max-w-[85%]">
              <View className="bg-candy-white border border-candy-outline-light rounded-candy rounded-bl-sm px-4 py-3 flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#e040a0" />
                <Text
                  className="text-candy-text-secondary"
                  style={{ fontSize: scaleFont(13, design.fontScale) }}
                >
                  Dumy esta pensando...
                </Text>
              </View>
            </View>
          )}

          {/* Error */}
          {error && (
            <View className="bg-candy-error-bg rounded-candy px-4 py-3 mb-3">
              <Text className="text-candy-error text-sm">{error}</Text>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>

        {/* Input Bar */}
        <View
          className="px-4 py-3 border-t"
          style={{
            borderColor: design.palette.borderLight,
            backgroundColor: design.palette.backgroundLight,
          }}
        >
          <View className="flex-row items-center gap-2">
            <View
              className="flex-1 flex-row items-center bg-candy-white border px-4"
              style={{
                borderColor: design.palette.borderLight,
                borderRadius: getCornerRadius(design.radius, "pill"),
              }}
            >
              <TextInput
                className="flex-1 py-3 text-candy-text"
                style={{ fontSize: scaleFont(13, design.fontScale) }}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#907898"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                editable={!isResponding}
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={isResponding || !input.trim()}
              className="w-11 h-11 items-center justify-center"
              style={{
                borderRadius: getCornerRadius(design.radius, "pill"),
                backgroundColor:
                  input.trim() && !isResponding
                    ? design.palette.primary
                    : design.palette.surfaceLight,
              }}
            >
              <FontAwesome
                name="send"
                size={16}
                color={input.trim() && !isResponding ? "#fff" : "#907898"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
