import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';
import { IronManTheme } from '@/constants/colors';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={64} color={IronManTheme.danger} />
            
            <Text style={styles.title}>System Error Detected</Text>
            <Text style={styles.subtitle}>J.A.R.V.I.S. encountered an unexpected issue</Text>
            
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <ScrollView style={styles.errorScroll}>
                <Text style={styles.errorText}>
                  {this.state.error?.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={this.handleReset}
              >
                <RefreshCw size={20} color="#000" />
                <Text style={styles.primaryButtonText}>Restart System</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => {
                  this.handleReset();
                }}
              >
                <Home size={20} color={IronManTheme.text} />
                <Text style={styles.secondaryButtonText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helpText}>
              If this issue persists, try clearing app data or reinstalling.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IronManTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 500,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: IronManTheme.textSecondary,
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  errorBox: {
    width: '100%',
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: IronManTheme.danger,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.danger,
    marginBottom: 8,
  },
  errorScroll: {
    maxHeight: 150,
  },
  errorText: {
    fontSize: 12,
    color: IronManTheme.text,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 11,
    color: IronManTheme.textMuted,
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: IronManTheme.jarvisGreen,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: IronManTheme.glow.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: IronManTheme.surface,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: IronManTheme.text,
  },
  helpText: {
    fontSize: 12,
    color: IronManTheme.textMuted,
    textAlign: 'center' as const,
    marginTop: 24,
    lineHeight: 18,
  },
});
