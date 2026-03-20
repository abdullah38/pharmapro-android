import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator,
  BackHandler, StatusBar, Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Asset } from 'expo-asset';
import { useEffect } from 'react';

// ─── Firebase config — yeh WebView mein inject hoga ─────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDazMqh2qVyD6vyfvqgPuSvKzhrPecdEds",
  authDomain:        "ibrahim-medical-store.firebaseapp.com",
  projectId:         "ibrahim-medical-store",
  storageBucket:     "ibrahim-medical-store.firebasestorage.app",
  messagingSenderId: "55534174504",
  appId:             "1:55534174504:web:9e114464429aedc113501d"
};

// ─── Injected JS — sabse pehle run hoga, Firebase se pehle ──────────────────
const INJECTED_JS = `
(function() {
  // Firebase config set karo
  window.PHARMA_USE_FIREBASE = true;
  window.PHARMA_CONFIG = null;
  window.PHARMA_FIREBASE_CONFIG = ${JSON.stringify(FIREBASE_CONFIG)};

  // Android WebView mein localStorage sometimes restricted hota hai — fix
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
  } catch(e) {
    // localStorage unavailable — use memory fallback
    var store = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: function(k) { return store[k] || null; },
        setItem: function(k, v) { store[k] = String(v); },
        removeItem: function(k) { delete store[k]; },
        clear: function() { store = {}; },
        get length() { return Object.keys(store).length; },
        key: function(i) { return Object.keys(store)[i]; }
      }
    });
  }

  // Viewport fix
  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'viewport';
    document.head.appendChild(meta);
  }
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

  true;
})();
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlUri, setHtmlUri] = useState(null);

  // Load bundled HTML
  useEffect(() => {
    async function loadHtml() {
      try {
        const asset = Asset.fromModule(require('./assets/index.html'));
        await asset.downloadAsync();
        setHtmlUri(asset.localUri || asset.uri);
      } catch (e) {
        console.log('Asset load error:', e);
        setError(true);
      }
    }
    loadHtml();
  }, []);

  // Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webRef.current) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>App load karne mein masla aaya{'\n'}Internet check karein</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />
        <SafeAreaView style={styles.container} edges={['top']}>
          {loading && (
            <View style={styles.splash}>
              <Text style={styles.splashIcon}>💊</Text>
              <Text style={styles.splashTitle}>PharmaPro</Text>
              <Text style={styles.splashSub}>Pharmacy Management System</Text>
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
            </View>
          )}
          {htmlUri && (
            <WebView
              ref={webRef}
              source={{ uri: htmlUri }}
              style={[styles.webview, loading && { opacity: 0 }]}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}

              // ✅ Firebase config inject — page load se PEHLE
              injectedJavaScriptBeforeContentLoaded={INJECTED_JS}
              injectedJavaScript={INJECTED_JS}

              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              originWhitelist={['*']}
              mixedContentMode="always"
              cacheEnabled={false}
              startInLoadingState={false}
              scalesPageToFit={false}
              allowsFullscreenVideo={false}
              mediaPlaybackRequiresUserAction={false}

              // WebView → React Native messages
              onMessage={(event) => {
                console.log('WebView message:', event.nativeEvent.data);
              }}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d4ed8',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashIcon: { fontSize: 64, marginBottom: 12 },
  splashTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 6 },
  splashSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1d4ed8',
  },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorText: { fontSize: 16, color: '#fff', textAlign: 'center', padding: 20 },
});
