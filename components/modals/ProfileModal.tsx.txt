import React from "react";
import { Modal, View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import { AppTheme } from "@/types";
import { dbBackup } from "@/lib/db";
import { Alert } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AVATARS = [
  { key: "avatar1", color: "#10b981" },
  { key: "avatar2", color: "#3b82f6" },
  { key: "avatar3", color: "#f59e0b" },
  { key: "avatar4", color: "#d946ef" },
  { key: "avatar5", color: "#f43f5e" },
  { key: "avatar6", color: "#8b5cf6" },
];

const THEMES: { key: AppTheme; label: string }[] = [
  { key: "dark", label: "Slate Dark" },
  { key: "light", label: "Clean Light" },
  { key: "green", label: "Emerald Green" },
];

export default function ProfileModal({ visible, onClose }: Props) {
  const { username, profilePhoto, appTheme, setUsername, setProfilePhoto, setAppTheme } = useAppContext();

  const avatarColor = AVATARS.find((a) => a.key === profilePhoto)?.color ?? "#10b981";
  const letter = username.charAt(0).toUpperCase() || "S";

  const handleSave = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#1e293b", borderRadius: 24, padding: 20, gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 12, fontWeight: "900", color: "#ffffff", textTransform: "uppercase" }}>Sesuaikan Akun</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Avatar preview */}
          <View style={{ alignItems: "center" }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: avatarColor, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#10b981" }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 24 }}>{letter}</Text>
            </View>
          </View>

          {/* Username */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Nama Panggilan</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={{ backgroundColor: "#020617", borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, padding: 10, fontSize: 12, color: "#ffffff" }}
              placeholderTextColor="#64748b"
              placeholder="Masukkan nama..."
            />
          </View>

          {/* Avatar picker */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Avatar Warna</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {AVATARS.map((av) => (
                <TouchableOpacity
                  key={av.key}
                  onPress={() => setProfilePhoto(av.key)}
                  style={{ padding: 2, borderWidth: profilePhoto === av.key ? 2 : 1, borderColor: profilePhoto === av.key ? "#10b981" : "#1e293b", borderRadius: 12 }}
                >
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: av.color, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{letter}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme selector */}
          <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: "rgba(148,163,184,0.1)", paddingTop: 12 }}>
            <Text style={{ fontSize: 9, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Tema Aplikasi</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {THEMES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setAppTheme(t.key)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: appTheme === t.key ? "#10b981" : "#1e293b",
                    backgroundColor: appTheme === t.key ? "rgba(16,185,129,0.1)" : "transparent",
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: "900", color: appTheme === t.key ? "#10b981" : "#94a3b8" }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Backup & Restore */}
          <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: "rgba(148,163,184,0.1)", paddingTop: 12 }}>
            <Text style={{ fontSize: 9, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Cadangkan & Pemulihan</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await dbBackup.exportDB();
                    Alert.alert("Sukses", "File backup berhasil diunduh");
                  } catch (err) {
                    Alert.alert("Gagal", "Gagal mengunduh file backup");
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: "#1e293b",
                  backgroundColor: "rgba(37,99,235,0.15)",
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 4
                }}
              >
                <Feather name="download" size={11} color="#3b82f6" />
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#3b82f6" }}>Ekspor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  try {
                    const ok = await dbBackup.importDB();
                    if (ok) {
                      Alert.alert("Sukses", "Data berhasil dipulihkan!");
                    }
                  } catch (err) {
                    Alert.alert("Gagal", "Gagal memulihkan cadangan");
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: "#1e293b",
                  backgroundColor: "rgba(16,185,129,0.15)",
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 4
                }}
              >
                <Feather name="upload" size={11} color="#10b981" />
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#10b981" }}>Impor</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            style={{ backgroundColor: "#059669", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ fontSize: 11, fontWeight: "900", color: "#ffffff" }}>Simpan Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
