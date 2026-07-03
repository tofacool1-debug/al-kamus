import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onActivated: (msg: string) => void;
}

const BENEFITS = [
  "Analisis Sifat Musyabihat lengkap 6 wazan",
  "Jamak Taksir mendalam dengan sanad rujukan",
  "Kaidah I'lal komprehensif tanpa batas kosa kata",
  "Favorit tak terhingga tersimpan luring",
];

const PLANS = [
  { name: "Bulanan Shorof Digital", price: "Rp 15.000 / bulan", desc: "Akses penuh selama 30 hari" },
  { name: "Tahunan Shorof Digital", price: "Rp 99.000 / tahun", desc: "Hemat 45% dari bulanan" },
  { name: "Seumur Hidup Shorof Digital", price: "Rp 299.000 selamanya", desc: "Bayar sekali, pakai selamanya" },
];

export default function PremiumModal({ visible, onClose, onActivated }: Props) {
  const { isPremium, setIsPremium } = useAppContext();
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState("");

  const handleClose = () => {
    setActivationCode("");
    setActivationError("");
    setSelectedPlan("");
    setSimulating(false);
    setSimMessage("");
    onClose();
  };

  const handleCodeActivate = () => {
    if (activationCode.trim().toLowerCase() === "premium-shorof" || activationCode.trim() === "123456") {
      setIsPremium(true);
      onActivated("Lisensi Premium berhasil diaktifkan!");
      handleClose();
    } else {
      setActivationError("Kode Lisensi tidak valid atau kedaluwarsa.");
    }
  };

  const handleSimulatePayment = (planName: string) => {
    setSelectedPlan(planName);
    setSimulating(true);
    setSimMessage("Menghubungkan ke Midtrans Snap...");
    setTimeout(() => {
      setSimMessage(`[Midtrans] Membuat token transaksi untuk ${planName}...`);
    }, 800);
    setTimeout(() => {
      setSimulating(false);
    }, 1800);
  };

  const handleSimComplete = (success: boolean) => {
    if (success) {
      setIsPremium(true);
      onActivated(`Premium aktif! Paket "${selectedPlan}" diaktifkan.`);
      handleClose();
    } else {
      setSelectedPlan("");
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: "#0f172a", borderWidth: 1, borderColor: "rgba(245,158,11,0.25)", borderRadius: 24, padding: 20, gap: 14, maxHeight: "90%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Feather name="star" size={14} color="#fbbf24" />
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#fbbf24", textTransform: "uppercase" }}>
                {isPremium ? "Premium Aktif" : "Lisensi Sharaf Premium"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {isPremium ? (
            <View style={{ paddingVertical: 24, alignItems: "center", gap: 10 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", alignItems: "center", justifyContent: "center" }}>
                <Feather name="award" size={28} color="#fbbf24" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#fbbf24" }}>Premium Terverifikasi</Text>
              <Text style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", lineHeight: 15, paddingHorizontal: 16 }}>
                Semua fitur premium telah aktif. Nikmati akses penuh Shorof Digital Pro!
              </Text>
              <TouchableOpacity
                onPress={() => { setIsPremium(false); handleClose(); }}
                style={{ marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#374151", borderRadius: 10 }}
              >
                <Text style={{ fontSize: 9, color: "#64748b" }}>Nonaktifkan Premium</Text>
              </TouchableOpacity>
            </View>
          ) : selectedPlan ? (
            <View style={{ gap: 12 }}>
              <View style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", backgroundColor: "rgba(2,6,23,0.6)", padding: 14, borderRadius: 16, alignItems: "center", gap: 6 }}>
                <Feather name="credit-card" size={24} color="#10b981" />
                <Text style={{ fontSize: 10, fontWeight: "900", color: "#fff" }}>Midtrans Snap</Text>
                <Text style={{ fontSize: 9, color: "#94a3b8", textAlign: "center" }}>
                  Paket: <Text style={{ color: "#fff", fontWeight: "700" }}>{selectedPlan}</Text>
                </Text>
              </View>
              {simulating ? (
                <View style={{ paddingVertical: 12, alignItems: "center", gap: 6 }}>
                  <Feather name="refresh-cw" size={16} color="#10b981" />
                  <Text style={{ fontSize: 9, color: "#94a3b8" }}>{simMessage}</Text>
                </View>
              ) : (
                <View style={{ gap: 8, alignItems: "center" }}>
                  <Text style={{ fontSize: 9, color: "#94a3b8" }}>Simulasikan Midtrans Callback:</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => handleSimComplete(true)} style={{ flex: 1, backgroundColor: "rgba(16,185,129,0.1)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", paddingVertical: 10, borderRadius: 12, alignItems: "center" }}>
                      <Text style={{ fontSize: 9, fontWeight: "900", color: "#10b981" }}>✔ Simulasi Lunas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSimComplete(false)} style={{ flex: 1, backgroundColor: "rgba(244,63,94,0.1)", borderWidth: 1, borderColor: "rgba(244,63,94,0.2)", paddingVertical: 10, borderRadius: 12, alignItems: "center" }}>
                      <Text style={{ fontSize: 9, fontWeight: "900", color: "#f43f5e" }}>✘ Simulasi Batal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {/* Benefits */}
              <View style={{ backgroundColor: "#020617", padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#1e293b", gap: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: "900", color: "#fff" }}>Benefit Shorof Digital Pro:</Text>
                {BENEFITS.map((b, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                    <Feather name="check-circle" size={11} color="#10b981" style={{ marginTop: 1 }} />
                    <Text style={{ fontSize: 9, color: "#94a3b8", flex: 1 }}>{b}</Text>
                  </View>
                ))}
              </View>

              {/* Plans */}
              <View style={{ gap: 6 }}>
                {PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.name}
                    onPress={() => handleSimulatePayment(plan.name)}
                    style={{ backgroundColor: "rgba(245,158,11,0.05)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: "900", color: "#fbbf24" }}>{plan.price}</Text>
                      <Text style={{ fontSize: 8, color: "#94a3b8", marginTop: 2 }}>{plan.desc}</Text>
                    </View>
                    <Feather name="chevron-right" size={14} color="#fbbf24" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Activation code */}
              <View style={{ borderTopWidth: 1, borderTopColor: "rgba(148,163,184,0.1)", paddingTop: 10, gap: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Kode Aktivasi</Text>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TextInput
                    value={activationCode}
                    onChangeText={(v) => { setActivationCode(v); setActivationError(""); }}
                    placeholder="Masukkan kode lisensi..."
                    placeholderTextColor="#475569"
                    style={{ flex: 1, backgroundColor: "#020617", borderWidth: 1, borderColor: activationError ? "#f43f5e" : "#1e293b", borderRadius: 10, padding: 10, fontSize: 11, color: "#fff" }}
                  />
                  <TouchableOpacity onPress={handleCodeActivate} style={{ backgroundColor: "#059669", paddingHorizontal: 14, borderRadius: 10, justifyContent: "center" }}>
                    <Text style={{ fontSize: 10, fontWeight: "900", color: "#fff" }}>Aktifkan</Text>
                  </TouchableOpacity>
                </View>
                {activationError ? <Text style={{ fontSize: 8, color: "#f43f5e" }}>{activationError}</Text> : null}
                <Text style={{ fontSize: 8, color: "#475569", textAlign: "center" }}>Coba kode: premium-shorof atau 123456</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
