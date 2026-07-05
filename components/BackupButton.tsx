import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { dbBackup } from "../lib/db";

export default function BackupButtons() {
  const handleExport = async () => {
    await dbBackup.exportDB();
    Alert.alert("Sukses", "File backup sudah dibuat");
  };
  const handleImport = async () => {
    const ok = await dbBackup.importDB();
    if(ok) Alert.alert("Sukses", "Data berhasil dipulihkan. Restart app");
  };

  return (
    <View style={{ gap: 10, padding: 16 }}>
      <TouchableOpacity onPress={handleExport} style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 10 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Export Backup</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleImport} style={{ backgroundColor: '#10b981', padding: 12, borderRadius: 10 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Import Backup</Text>
      </TouchableOpacity>
    </View>
  );
}