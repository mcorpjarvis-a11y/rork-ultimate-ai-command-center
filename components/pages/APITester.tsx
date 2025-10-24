import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TestTube, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { FREE_AI_MODELS } from '@/config/api.config';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
  details?: string;
}

export default function APITester() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, skipped: 0 });



  const testGroqAPI = async (): Promise<TestResult> => {
    const test: TestResult = {
      id: 'groq_api',
      name: 'Groq API (FREE - Hardcoded)',
      status: 'running',
    };
    
    const startTime = Date.now();
    
    try {
      if (!FREE_AI_MODELS.groq.apiKey) {
        return {
          ...test,
          status: 'skipped',
          message: 'No API key configured',
          duration: Date.now() - startTime,
        };
      }

      const response = await fetch(`${FREE_AI_MODELS.groq.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FREE_AI_MODELS.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Say "test"' }],
          max_tokens: 5,
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          ...test,
          status: 'passed',
          message: 'API key working! Fast inference speed',
          duration,
          details: `Response: ${data.choices[0]?.message?.content || 'OK'}`,
        };
      } else {
        const error = await response.text();
        return {
          ...test,
          status: 'failed',
          message: `HTTP ${response.status}`,
          duration,
          details: error,
        };
      }
    } catch (error: any) {
      return {
        ...test,
        status: 'failed',
        message: error.message,
        duration: Date.now() - startTime,
      };
    }
  };

  const testHuggingFaceAPI = async (): Promise<TestResult> => {
    const test: TestResult = {
      id: 'huggingface_api',
      name: 'Hugging Face API (FREE - Hardcoded)',
      status: 'running',
    };
    
    const startTime = Date.now();
    
    try {
      if (!FREE_AI_MODELS.huggingface.apiKey) {
        return {
          ...test,
          status: 'skipped',
          message: 'No API key configured',
          duration: Date.now() - startTime,
        };
      }

      const model = FREE_AI_MODELS.huggingface.models.text?.['mistral-7b'];
      const response = await fetch(`${FREE_AI_MODELS.huggingface.baseURL}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FREE_AI_MODELS.huggingface.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: { max_new_tokens: 5 },
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          ...test,
          status: 'passed',
          message: 'API key working! 100+ models available',
          duration,
          details: `Model: ${model}`,
        };
      } else {
        const error = await response.text();
        return {
          ...test,
          status: 'failed',
          message: `HTTP ${response.status}`,
          duration,
          details: error,
        };
      }
    } catch (error: any) {
      return {
        ...test,
        status: 'failed',
        message: error.message,
        duration: Date.now() - startTime,
      };
    }
  };

  const testGeminiAPI = async (): Promise<TestResult> => {
    const test: TestResult = {
      id: 'gemini_api',
      name: 'Google Gemini API (FREE)',
      status: 'running',
    };
    
    const startTime = Date.now();
    
    try {
      const geminiKey = state.apiKeys.find(k => 
        k.name.toLowerCase().includes('gemini') || 
        k.name.toLowerCase().includes('google')
      );

      if (!geminiKey) {
        return {
          ...test,
          status: 'skipped',
          message: 'No Gemini API key found in stored keys',
          duration: Date.now() - startTime,
          details: 'Add key with name "Google Gemini" in API Keys page',
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey.key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Say "test"' }]
            }],
            generationConfig: {
              maxOutputTokens: 10,
            },
          }),
        }
      );

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          ...test,
          status: 'passed',
          message: 'Gemini API working! Free tier active',
          duration,
          details: `Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'}`,
        };
      } else {
        const error = await response.json();
        return {
          ...test,
          status: 'failed',
          message: `HTTP ${response.status}`,
          duration,
          details: error.error?.message || JSON.stringify(error),
        };
      }
    } catch (error: any) {
      return {
        ...test,
        status: 'failed',
        message: error.message,
        duration: Date.now() - startTime,
      };
    }
  };

  const testTogetherAIAPI = async (): Promise<TestResult> => {
    const test: TestResult = {
      id: 'togetherai_api',
      name: 'Together AI (FREE $5 Credit)',
      status: 'running',
    };
    
    const startTime = Date.now();
    
    try {
      const togetherKey = state.apiKeys.find(k => 
        k.name.toLowerCase().includes('together')
      );

      if (!togetherKey && !FREE_AI_MODELS.togetherai.apiKey) {
        return {
          ...test,
          status: 'skipped',
          message: 'No Together AI API key configured',
          duration: Date.now() - startTime,
          details: 'Add key with name "Together AI" in API Keys page',
        };
      }

      const apiKey = togetherKey?.key || FREE_AI_MODELS.togetherai.apiKey;

      const response = await fetch(`${FREE_AI_MODELS.togetherai.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
          messages: [{ role: 'user', content: 'Say "test"' }],
          max_tokens: 5,
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          ...test,
          status: 'passed',
          message: 'Together AI working! FLUX image gen available',
          duration,
          details: `Response: ${data.choices[0]?.message?.content || 'OK'}`,
        };
      } else {
        const error = await response.text();
        return {
          ...test,
          status: 'failed',
          message: `HTTP ${response.status}`,
          duration,
          details: error,
        };
      }
    } catch (error: any) {
      return {
        ...test,
        status: 'failed',
        message: error.message,
        duration: Date.now() - startTime,
      };
    }
  };

  const testDeepSeekAPI = async (): Promise<TestResult> => {
    const test: TestResult = {
      id: 'deepseek_api',
      name: 'DeepSeek (FREE - Best for Code)',
      status: 'running',
    };
    
    const startTime = Date.now();
    
    try {
      const deepseekKey = state.apiKeys.find(k => 
        k.name.toLowerCase().includes('deepseek')
      );

      if (!deepseekKey && !FREE_AI_MODELS.deepseek.apiKey) {
        return {
          ...test,
          status: 'skipped',
          message: 'No DeepSeek API key configured',
          duration: Date.now() - startTime,
          details: 'Add key with name "DeepSeek" in API Keys page',
        };
      }

      const apiKey = deepseekKey?.key || FREE_AI_MODELS.deepseek.apiKey;

      const response = await fetch(`${FREE_AI_MODELS.deepseek.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Say "test"' }],
          max_tokens: 5,
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          ...test,
          status: 'passed',
          message: 'DeepSeek working! Best for code generation',
          duration,
          details: `Response: ${data.choices[0]?.message?.content || 'OK'}`,
        };
      } else {
        const error = await response.text();
        return {
          ...test,
          status: 'failed',
          message: `HTTP ${response.status}`,
          duration,
          details: error,
        };
      }
    } catch (error: any) {
      return {
        ...test,
        status: 'failed',
        message: error.message,
        duration: Date.now() - startTime,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);
    setSummary({ total: 0, passed: 0, failed: 0, skipped: 0 });

    const testFunctions = [
      testGroqAPI,
      testHuggingFaceAPI,
      testGeminiAPI,
      testTogetherAIAPI,
      testDeepSeekAPI,
    ];

    const results: TestResult[] = [];

    for (const testFn of testFunctions) {
      const result = await testFn();
      results.push(result);
      setTests([...results]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    setSummary({
      total: results.length,
      passed,
      failed,
      skipped,
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle color="#10B981" size={24} />;
      case 'failed':
        return <XCircle color="#EF4444" size={24} />;
      case 'running':
        return <ActivityIndicator color="#00E5FF" size={24} />;
      case 'skipped':
        return <AlertCircle color="#F59E0B" size={24} />;
      default:
        return <Clock color="#666" size={24} />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return '#10B981';
      case 'failed': return '#EF4444';
      case 'running': return '#00E5FF';
      case 'skipped': return '#F59E0B';
      default: return '#666';
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>API Endpoint Tester</Text>
        <Text style={styles.subtitle}>Test all API integrations and get pass/fail results</Text>

        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.runButtonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <ActivityIndicator color="#000" />
              <Text style={styles.runButtonText}>Running Tests...</Text>
            </>
          ) : (
            <>
              <TestTube size={20} color="#000" />
              <Text style={styles.runButtonText}>Run All Tests</Text>
            </>
          )}
        </TouchableOpacity>

        {tests.length > 0 && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Test Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={styles.summaryValue}>{summary.total}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Passed</Text>
                  <Text style={[styles.summaryValue, { color: '#10B981' }]}>{summary.passed}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Failed</Text>
                  <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{summary.failed}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: '#F59E0B' }]}>Skipped</Text>
                  <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{summary.skipped}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Test Results</Text>
            {tests.map((test) => (
              <View key={test.id} style={styles.testCard}>
                <View style={styles.testHeader}>
                  {getStatusIcon(test.status)}
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.name}</Text>
                    {test.message && (
                      <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
                        {test.message}
                      </Text>
                    )}
                    {test.duration && (
                      <Text style={styles.testDuration}>{test.duration}ms</Text>
                    )}
                  </View>
                </View>
                {test.details && (
                  <View style={styles.testDetails}>
                    <Text style={styles.testDetailsText}>{test.details}</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {tests.length === 0 && !isRunning && (
          <View style={styles.emptyState}>
            <TestTube size={48} color="#666" />
            <Text style={styles.emptyText}>No tests run yet</Text>
            <Text style={styles.emptyHint}>Click &quot;Run All Tests&quot; to start testing your API endpoints</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Hardcoded API Keys</Text>
          <View style={styles.infoItem}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.infoText}>
              Groq API: {FREE_AI_MODELS.groq.apiKey ? '✓ Configured' : '✗ Not configured'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.infoText}>
              Hugging Face: {FREE_AI_MODELS.huggingface.apiKey ? '✓ Configured' : '✗ Not configured'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.infoText}>
              Together AI: {FREE_AI_MODELS.togetherai.apiKey ? '✓ Configured' : '✗ Not configured (add in API Keys)'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.infoText}>
              DeepSeek: {FREE_AI_MODELS.deepseek.apiKey ? '✓ Configured' : '✗ Not configured (add in API Keys)'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.infoText}>
              Google Gemini: {state.apiKeys.find(k => k.name.toLowerCase().includes('gemini')) ? '✓ Configured' : '✗ Not configured (add in API Keys)'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  runButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  summaryCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#111',
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  testMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  testDuration: {
    fontSize: 12,
    color: '#666',
  },
  testDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  testDetailsText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace' as const,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#00E5FF',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#ccc',
  },
});
