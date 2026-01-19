import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Global error catcher to print startup errors to the screen
if (typeof window !== 'undefined') {
  window.onerror = function (message, source, lineno, colno, error) {
    // Attempt to show error on screen if React fails
    const root = document.getElementById('root') || document.body;
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:black; color:red; padding:20px; z-index:9999; overflow:auto;';
    errorMsg.innerHTML = `<h1>CRITICAL ERROR</h1><pre>${message}\n${source}:${lineno}</pre>`;
    root.appendChild(errorMsg);
  };
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ CONEXIÓN EXITOSA</Text>
      <Text style={styles.subtext}>Si ves esto, el servidor funciona perfectamente.</Text>
      <Text style={styles.note}>Ahora restauraremos la app pieza por pieza para encontrar el bug.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC', // Bright blue to standard out
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtext: {
    fontSize: 18,
    color: 'white', // White text
    textAlign: 'center',
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
  },
});
