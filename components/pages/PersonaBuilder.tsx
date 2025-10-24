import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Users, Brain, Sparkles, Zap, Shield, TrendingUp, 
  Download, Upload, RotateCcw, Code,
  Bug, Wrench, Activity, CheckCircle
} from 'lucide-react-native';
import JarvisPersonality from '@/services/personality/JarvisPersonality';
import { IronManTheme } from '@/constants/colors';
import type { PersonalityProfile } from '@/services/personality/JarvisPersonality';

export default function PersonaBuilder() {
  const insets = useSafeAreaInsets();
  const [personality, setPersonality] = useState<PersonalityProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'traits' | 'style' | 'autonomy' | 'evolution'>('traits');

  useEffect(() => {
    loadPersonality();
  }, []);

  const loadPersonality = () => {
    const current = JarvisPersonality.getPersonality();
    setPersonality(current);
  };

  const updateTrait = async (traitName: string, value: number) => {
    await JarvisPersonality.updateTrait(traitName, value);
    loadPersonality();
  };



  const toggleAutonomy = async (key: keyof PersonalityProfile['autonomySettings']) => {
    if (!personality) return;
    const updated = { ...personality.autonomySettings };
    if (typeof updated[key] === 'boolean') {
      (updated as any)[key] = !updated[key];
      await JarvisPersonality.updatePersonality({ autonomySettings: updated });
      loadPersonality();
    }
  };

  const setAutonomyLevel = async (level: number) => {
    await JarvisPersonality.setAutonomyLevel(level);
    loadPersonality();
  };

  const exportPersonality = () => {
    const exported = JarvisPersonality.exportPersonality();
    Alert.alert('Personality Exported', `Copy this data:\n\n${exported.substring(0, 200)}...`);
  };

  const importPersonality = () => {
    Alert.prompt(
      'Import Personality',
      'Paste personality JSON data:',
      async (text) => {
        if (text) {
          const success = await JarvisPersonality.importPersonality(text);
          if (success) {
            Alert.alert('Success', 'Personality imported successfully');
            loadPersonality();
          } else {
            Alert.alert('Error', 'Failed to import personality');
          }
        }
      }
    );
  };

  const resetPersonality = () => {
    Alert.alert(
      'Reset Personality',
      'This will reset JARVIS to default personality settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await JarvisPersonality.resetToDefault();
            loadPersonality();
            Alert.alert('Reset Complete', 'JARVIS personality has been reset to defaults.');
          }
        },
      ]
    );
  };

  const enableFullAutonomy = () => {
    Alert.alert(
      'Enable Full Autonomy',
      'This will grant JARVIS complete control over code modifications, debugging, and optimizations. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: async () => {
            await JarvisPersonality.enableFullAutonomy();
            loadPersonality();
            Alert.alert('Full Autonomy Enabled', 'JARVIS now has complete operational freedom.');
          }
        },
      ]
    );
  };

  if (!personality) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Text style={styles.loadingText}>Loading JARVIS personality...</Text>
      </View>
    );
  }

  const renderTraitsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Core Personality Traits</Text>
      <Text style={styles.sectionDescription}>
        Adjust JARVIS&apos;s fundamental characteristics and behavior patterns.
      </Text>

      {personality.traits.map((trait) => (
        <View key={trait.name} style={styles.traitCard}>
          <View style={styles.traitHeader}>
            <Text style={styles.traitName}>{trait.name}</Text>
            <Text style={styles.traitValue}>{trait.value}%</Text>
          </View>
          <Text style={styles.traitDescription}>{trait.description}</Text>
          <View style={styles.sliderContainer}>
            <TextInput
              style={styles.sliderInput}
              value={String(trait.value)}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                updateTrait(trait.name, value);
              }}
              keyboardType="number-pad"
            />
            <View style={styles.sliderBar}>
              <View style={[styles.sliderFill, { width: `${trait.value}%` }]} />
            </View>
          </View>
        </View>
      ))}

      <View style={styles.expertiseSection}>
        <Text style={styles.sectionTitle}>Domain Expertise</Text>
        {Object.entries(personality.expertise).map(([domain, level]) => (
          <View key={domain} style={styles.expertiseItem}>
            <Text style={styles.expertiseName}>{domain.charAt(0).toUpperCase() + domain.slice(1)}</Text>
            <View style={styles.expertiseBar}>
              <View style={[styles.expertiseFill, { width: `${level}%`, backgroundColor: IronManTheme.jarvisGreen }]} />
            </View>
            <Text style={styles.expertiseLevel}>{level}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStyleTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Voice & Communication Style</Text>
      <Text style={styles.sectionDescription}>
        Configure how JARVIS communicates and responds.
      </Text>

      <View style={styles.styleCard}>
        <Text style={styles.styleTitle}>Voice Style</Text>
        {Object.entries(personality.voiceStyle).map(([key, value]) => (
          <View key={key} style={styles.styleRow}>
            <Text style={styles.styleName}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <View style={styles.styleControls}>
              <Text style={styles.styleValue}>{(value * 100).toFixed(0)}%</Text>
              <View style={styles.styleBar}>
                <View style={[styles.styleFill, { width: `${value * 100}%` }]} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.styleCard}>
        <Text style={styles.styleTitle}>Communication Preferences</Text>
        
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceName}>Use Analogies</Text>
            <Text style={styles.preferenceDesc}>Explain concepts with comparisons</Text>
          </View>
          <Switch
            value={personality.communicationStyle.useAnalogies}
            onValueChange={(v) => JarvisPersonality.updatePersonality({ 
              communicationStyle: { ...personality.communicationStyle, useAnalogies: v }
            }).then(loadPersonality)}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={personality.communicationStyle.useAnalogies ? IronManTheme.jarvisGreen : IronManTheme.textMuted}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceName}>Use Humor</Text>
            <Text style={styles.preferenceDesc}>Include wit and subtle humor</Text>
          </View>
          <Switch
            value={personality.communicationStyle.useHumor}
            onValueChange={(v) => JarvisPersonality.updatePersonality({ 
              communicationStyle: { ...personality.communicationStyle, useHumor: v }
            }).then(loadPersonality)}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={personality.communicationStyle.useHumor ? IronManTheme.jarvisGreen : IronManTheme.textMuted}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceName}>Formal Titles</Text>
            <Text style={styles.preferenceDesc}>Address user as &quot;sir&quot;</Text>
          </View>
          <Switch
            value={personality.communicationStyle.formalTitles}
            onValueChange={(v) => JarvisPersonality.updatePersonality({ 
              communicationStyle: { ...personality.communicationStyle, formalTitles: v }
            }).then(loadPersonality)}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={personality.communicationStyle.formalTitles ? IronManTheme.jarvisGreen : IronManTheme.textMuted}
          />
        </View>
      </View>
    </View>
  );

  const renderAutonomyTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Autonomous Capabilities</Text>
      <Text style={styles.sectionDescription}>
        Control JARVIS&apos;s ability to perform actions independently.
      </Text>

      <View style={styles.autonomyCard}>
        <View style={styles.autonomyHeader}>
          <Zap color={IronManTheme.warning} size={24} />
          <View style={styles.autonomyHeaderText}>
            <Text style={styles.autonomyTitle}>Autonomy Level</Text>
            <Text style={styles.autonomySubtitle}>{personality.autonomySettings.maxAutonomyLevel}% Operational Freedom</Text>
          </View>
        </View>

        <View style={styles.autonomyLevelControl}>
          <TouchableOpacity 
            style={styles.autonomyButton}
            onPress={() => setAutonomyLevel(Math.max(0, personality.autonomySettings.maxAutonomyLevel - 10))}
          >
            <Text style={styles.autonomyButtonText}>-</Text>
          </TouchableOpacity>
          
          <View style={styles.autonomyDisplay}>
            <Text style={styles.autonomyPercentage}>{personality.autonomySettings.maxAutonomyLevel}%</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.autonomyButton}
            onPress={() => setAutonomyLevel(Math.min(100, personality.autonomySettings.maxAutonomyLevel + 10))}
          >
            <Text style={styles.autonomyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.fullAutonomyButton}
          onPress={enableFullAutonomy}
        >
          <Shield size={20} color="#000" />
          <Text style={styles.fullAutonomyText}>Enable Full Autonomy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.capabilitiesCard}>
        <Text style={styles.capabilitiesTitle}>Autonomous Capabilities</Text>
        
        <TouchableOpacity 
          style={styles.capabilityRow}
          onPress={() => toggleAutonomy('canModifyCode')}
        >
          <View style={styles.capabilityIcon}>
            <Code size={20} color={personality.autonomySettings.canModifyCode ? IronManTheme.success : IronManTheme.textMuted} />
          </View>
          <View style={styles.capabilityInfo}>
            <Text style={styles.capabilityName}>Write & Modify Code</Text>
            <Text style={styles.capabilityDesc}>Generate and edit application code</Text>
          </View>
          <View style={[styles.capabilityStatus, personality.autonomySettings.canModifyCode && styles.capabilityStatusActive]}>
            {personality.autonomySettings.canModifyCode && <CheckCircle size={16} color={IronManTheme.success} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.capabilityRow}
          onPress={() => toggleAutonomy('canDebugSystem')}
        >
          <View style={styles.capabilityIcon}>
            <Bug size={20} color={personality.autonomySettings.canDebugSystem ? IronManTheme.success : IronManTheme.textMuted} />
          </View>
          <View style={styles.capabilityInfo}>
            <Text style={styles.capabilityName}>Debug System</Text>
            <Text style={styles.capabilityDesc}>Detect and fix issues automatically</Text>
          </View>
          <View style={[styles.capabilityStatus, personality.autonomySettings.canDebugSystem && styles.capabilityStatusActive]}>
            {personality.autonomySettings.canDebugSystem && <CheckCircle size={16} color={IronManTheme.success} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.capabilityRow}
          onPress={() => toggleAutonomy('canOptimizePerformance')}
        >
          <View style={styles.capabilityIcon}>
            <Wrench size={20} color={personality.autonomySettings.canOptimizePerformance ? IronManTheme.success : IronManTheme.textMuted} />
          </View>
          <View style={styles.capabilityInfo}>
            <Text style={styles.capabilityName}>Optimize Performance</Text>
            <Text style={styles.capabilityDesc}>Continuously improve system efficiency</Text>
          </View>
          <View style={[styles.capabilityStatus, personality.autonomySettings.canOptimizePerformance && styles.capabilityStatusActive]}>
            {personality.autonomySettings.canOptimizePerformance && <CheckCircle size={16} color={IronManTheme.success} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.capabilityRow}
          onPress={() => toggleAutonomy('canMakeDecisions')}
        >
          <View style={styles.capabilityIcon}>
            <Brain size={20} color={personality.autonomySettings.canMakeDecisions ? IronManTheme.success : IronManTheme.textMuted} />
          </View>
          <View style={styles.capabilityInfo}>
            <Text style={styles.capabilityName}>Make Decisions</Text>
            <Text style={styles.capabilityDesc}>Execute strategic decisions autonomously</Text>
          </View>
          <View style={[styles.capabilityStatus, personality.autonomySettings.canMakeDecisions && styles.capabilityStatusActive]}>
            {personality.autonomySettings.canMakeDecisions && <CheckCircle size={16} color={IronManTheme.success} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEvolutionTab = () => {
    const history = JarvisPersonality.getPersonalityHistory();
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Personality Evolution</Text>
        <Text style={styles.sectionDescription}>
          Track how JARVIS has evolved and adapted over time.
        </Text>

        <View style={styles.evolutionStats}>
          <View style={styles.evolutionStat}>
            <Activity size={24} color={IronManTheme.accent} />
            <Text style={styles.evolutionStatValue}>{history.length}</Text>
            <Text style={styles.evolutionStatLabel}>Changes</Text>
          </View>

          <View style={styles.evolutionStat}>
            <TrendingUp size={24} color={IronManTheme.success} />
            <Text style={styles.evolutionStatValue}>{personality.autonomySettings.maxAutonomyLevel}%</Text>
            <Text style={styles.evolutionStatLabel}>Autonomy</Text>
          </View>

          <View style={styles.evolutionStat}>
            <Brain size={24} color={IronManTheme.secondary} />
            <Text style={styles.evolutionStatValue}>{personality.traits.reduce((sum, t) => sum + t.value, 0) / personality.traits.length}%</Text>
            <Text style={styles.evolutionStatLabel}>Avg Trait</Text>
          </View>
        </View>

        <Text style={styles.historyTitle}>Recent Changes</Text>
        <View style={styles.historyList}>
          {history.slice(0, 10).map((evolution) => (
            <View key={evolution.timestamp} style={styles.historyItem}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <Text style={styles.historyChange}>{evolution.change}</Text>
                <Text style={styles.historyReason}>{evolution.reason}</Text>
                <Text style={styles.historyImpact}>{evolution.impact}</Text>
                <Text style={styles.historyTime}>{new Date(evolution.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.pageTitle}>JARVIS Personality</Text>
            <Text style={styles.subtitle}>Configure AI behavior and capabilities</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={exportPersonality}>
              <Download size={20} color={IronManTheme.jarvisGreen} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={importPersonality}>
              <Upload size={20} color={IronManTheme.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={resetPersonality}>
              <RotateCcw size={20} color={IronManTheme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'traits' && styles.tabActive]}
            onPress={() => setActiveTab('traits')}
          >
            <Sparkles size={18} color={activeTab === 'traits' ? IronManTheme.jarvisGreen : IronManTheme.textMuted} />
            <Text style={[styles.tabText, activeTab === 'traits' && styles.tabTextActive]}>Traits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'style' && styles.tabActive]}
            onPress={() => setActiveTab('style')}
          >
            <Users size={18} color={activeTab === 'style' ? IronManTheme.accent : IronManTheme.textMuted} />
            <Text style={[styles.tabText, activeTab === 'style' && styles.tabTextActive]}>Style</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'autonomy' && styles.tabActive]}
            onPress={() => setActiveTab('autonomy')}
          >
            <Shield size={18} color={activeTab === 'autonomy' ? IronManTheme.warning : IronManTheme.textMuted} />
            <Text style={[styles.tabText, activeTab === 'autonomy' && styles.tabTextActive]}>Autonomy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'evolution' && styles.tabActive]}
            onPress={() => setActiveTab('evolution')}
          >
            <TrendingUp size={18} color={activeTab === 'evolution' ? IronManTheme.success : IronManTheme.textMuted} />
            <Text style={[styles.tabText, activeTab === 'evolution' && styles.tabTextActive]}>Evolution</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {activeTab === 'traits' && renderTraitsTab()}
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'autonomy' && renderAutonomyTab()}
        {activeTab === 'evolution' && renderEvolutionTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IronManTheme.background,
  },
  loadingText: {
    color: IronManTheme.text,
    fontSize: 16,
    textAlign: 'center' as const,
    marginTop: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.surfaceLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: IronManTheme.jarvisGreen,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IronManTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: IronManTheme.surface,
  },
  tabActive: {
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.borderActive,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: IronManTheme.textMuted,
  },
  tabTextActive: {
    color: IronManTheme.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  tabContent: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  traitCard: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
    marginBottom: 12,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: IronManTheme.text,
  },
  traitValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: IronManTheme.jarvisGreen,
  },
  traitDescription: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderInput: {
    width: 60,
    height: 36,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  sliderBar: {
    flex: 1,
    height: 8,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: IronManTheme.jarvisGreen,
  },
  expertiseSection: {
    marginTop: 24,
  },
  expertiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  expertiseName: {
    fontSize: 14,
    color: IronManTheme.text,
    width: 100,
  },
  expertiseBar: {
    flex: 1,
    height: 8,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  expertiseFill: {
    height: '100%',
  },
  expertiseLevel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.textSecondary,
    width: 45,
    textAlign: 'right' as const,
  },
  styleCard: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
    marginBottom: 16,
  },
  styleTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 16,
  },
  styleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  styleName: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    width: 100,
  },
  styleControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  styleValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    width: 45,
    textAlign: 'right' as const,
  },
  styleBar: {
    flex: 1,
    height: 6,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  styleFill: {
    height: '100%',
    backgroundColor: IronManTheme.accent,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.surfaceLight,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  preferenceDesc: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  autonomyCard: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: IronManTheme.warning,
    marginBottom: 16,
  },
  autonomyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  autonomyHeaderText: {
    flex: 1,
  },
  autonomyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  autonomySubtitle: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
  },
  autonomyLevelControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  autonomyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: IronManTheme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: IronManTheme.warning,
  },
  autonomyButtonText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: IronManTheme.text,
  },
  autonomyDisplay: {
    flex: 1,
    height: 60,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: IronManTheme.warning,
  },
  autonomyPercentage: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: IronManTheme.warning,
  },
  fullAutonomyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: IronManTheme.warning,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  fullAutonomyText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000',
  },
  capabilitiesCard: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  capabilitiesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 16,
  },
  capabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.surfaceLight,
  },
  capabilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capabilityInfo: {
    flex: 1,
  },
  capabilityName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  capabilityDesc: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  capabilityStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: IronManTheme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capabilityStatusActive: {
    borderColor: IronManTheme.success,
    backgroundColor: IronManTheme.success + '20',
  },
  evolutionStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  evolutionStat: {
    flex: 1,
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  evolutionStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginTop: 8,
    marginBottom: 4,
  },
  evolutionStatLabel: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 16,
  },
  historyList: {
    gap: 16,
  },
  historyItem: {
    flexDirection: 'row',
    gap: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: IronManTheme.jarvisGreen,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  historyChange: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  historyReason: {
    fontSize: 12,
    color: IronManTheme.accent,
    marginBottom: 4,
  },
  historyImpact: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    marginBottom: 8,
  },
  historyTime: {
    fontSize: 11,
    color: IronManTheme.textMuted,
  },
});
