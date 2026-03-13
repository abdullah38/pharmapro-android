import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator,
  BackHandler, StatusBar, Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { useEffect } from 'react';

// ─── App HTML loaded from bundled index.html ─────────────────────────────────
export default function App() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlUri, setHtmlUri] = useState(null);

  // Load the bundled HTML file
  useEffect(() => {
    async function loadHtml() {
      try {
        // Copy bundled html to a readable location
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

  // Android back button — navigate back in WebView
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
        <Text style={styles.errorText}>App load karne mein masla aaya</Text>
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
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              originWhitelist={['*']}
              mixedContentMode="always"
              cacheEnabled={true}
              startInLoadingState={false}
              scalesPageToFit={false}
              allowsFullscreenVideo={false}
              mediaPlaybackRequiresUserAction={false}
              onMessage={(event) => {
                // Handle messages from web app if needed
                console.log('WebView message:', event.nativeEvent.data);
              }}
              injectedJavaScript={`
                // Fix viewport for mobile
                var meta = document.querySelector('meta[name="viewport"]');
                if (!meta) {
                  meta = document.createElement('meta');
                  meta.name = 'viewport';
                  document.head.appendChild(meta);
                }
                meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                true;
              `}
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
