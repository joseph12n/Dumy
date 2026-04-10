import { BrandHeader, CandyCard } from "@/src/components/common";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanReceiptScreen() {
  const router = useRouter();

  const pendingMessage =
    "El flujo OCR se conecta en el siguiente paso. Ya dejamos la interfaz lista para probar la experiencia visual.";

  return (
    <SafeAreaView className="flex-1 bg-candy-bg">
      <BrandHeader
        title="Dumy"
        subtitle="Escaneo de recibos"
        rightIcon="close"
        onRightPress={() => router.back()}
      />

      <View className="px-5 mt-4 gap-4">
        <CandyCard variant="purple">
          <Text className="text-candy-text text-lg font-bold">
            Linea de captura
          </Text>
          <Text className="text-candy-text-secondary text-sm mt-1">
            Toma una foto o carga una imagen para extraer datos del recibo con
            IA.
          </Text>
        </CandyCard>

        <TouchableOpacity
          onPress={() => Alert.alert("Camara", pendingMessage)}
          className="rounded-candy bg-candy-purple-pale p-5 border border-candy-outline-light"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full bg-candy-purple items-center justify-center">
              <FontAwesome name="camera" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-candy-text text-base font-bold">
                Tomar foto del recibo
              </Text>
              <Text className="text-candy-text-secondary text-xs mt-1">
                Recomendado para tickets fisicos
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert("Galeria", pendingMessage)}
          className="rounded-candy bg-candy-blue-pale p-5 border border-candy-outline-light"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full bg-candy-blue items-center justify-center">
              <FontAwesome name="image" size={20} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-candy-text text-base font-bold">
                Cargar desde galeria
              </Text>
              <Text className="text-candy-text-secondary text-xs mt-1">
                Para facturas guardadas previamente
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
