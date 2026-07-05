import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { dbKamus } from "../lib/db";
import { PRESET_DICTIONARY } from "../data/dictionary";
import * as Haptics from "expo-haptics";

export default function DownloadDataButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    await dbKamus.clear();
    await dbKamus.bulkPut(PRESET_DICTIONARY, (done, total) => {
      setProgress(Math.round((done / total) * 100));
    });
    setIsDownloading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Selesai", "Data offline sudah siap");
  };

  return (
    <TouchableOpacity onPress={handleDownload} disabled={isDownloading} style={{ backgroundColor: "#10b981", padding: 14, margin: 16, borderRadius: 12, alignItems: 'center' }}>
      {isDownloading? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: '800' }}>Download Data Offline {isDownloading? `${progress}%` : ''}</Text>}
    </TouchableOpacity>
  );
}