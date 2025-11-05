import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { Code, CheckCircle, XCircle, Clock, AlertCircle, FileCode, Trash2, Download, Settings } from 'lucide-react-native';
import SelfModificationService, { CodeChange, CodeSuggestion } from '@/services/SelfModificationService';
import JarvisPersonality from '@/services/personality/JarvisPersonality';
import { IronManTheme } from '@/constants/colors';

export default function CodeModifications() {
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'changes' | 'suggestions' | 'stats'>('changes');
  const [autonomousMode, setAutonomousMode] = useState(false);
  const [stats, setStats] = useState({
    totalChanges: 0,
    appliedChanges: 0,
    pendingChanges: 0,
    suggestionsCount: 0,
    componentsGenerated: 0,
    debugSessionsResolved: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCodeChanges(SelfModificationService.getCodeChanges());
    setSuggestions(SelfModificationService.getSuggestions());
    setStats(SelfModificationService.getStats());
    setAutonomousMode(SelfModificationService.isAutonomousMode());
  };

  const handleApprove = async (changeId: string) => {
    try {
      await SelfModificationService.approveCodeChange(changeId);
      Alert.alert('Success', 'Code change approved. Would you like to apply it now?', [
        { text: 'Later', style: 'cancel' },
        { text: 'Apply Now', onPress: () => handleApply(changeId) },
      ]);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleReject = async (changeId: string) => {
    Alert.prompt(
      'Reject Code Change',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (reason) {
          try {
            await SelfModificationService.rejectCodeChange(changeId, reason);
            Alert.alert('Success', 'Code change rejected');
            loadData();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    );
  };

  const handleApply = async (changeId: string) => {
    try {
      await SelfModificationService.applyCodeChange(changeId);
      Alert.alert('Success', 'Code change applied successfully!');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleExportChangelog = async () => {
    try {
      const changelog = await SelfModificationService.exportChangelog();
      Alert.alert('Changelog', changelog.substring(0, 500) + '...');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleToggleAutonomous = (value: boolean) => {
    if (value && !JarvisPersonality.canPerformAutonomousAction('modifyCode')) {
      Alert.alert(
        'Permission Required',
        'Autonomous code modification is disabled in Jarvis personality settings. Please enable it in the Persona Builder first.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      value ? 'Enable Autonomous Mode' : 'Disable Autonomous Mode',
      value
        ? 'JARVIS will automatically apply approved code modifications without requiring your explicit approval. Are you sure?'
        : 'JARVIS will require your explicit approval before applying any code modifications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            SelfModificationService.setAutonomousMode(value);
            setAutonomousMode(value);
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color={IronManTheme.warning} />;
      case 'approved':
        return <CheckCircle size={20} color={IronManTheme.success} />;
      case 'applied':
        return <CheckCircle size={20} color={IronManTheme.jarvisGreen} />;
      case 'rejected':
        return <XCircle size={20} color={IronManTheme.danger} />;
      default:
        return <AlertCircle size={20} color={IronManTheme.textSecondary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return IronManTheme.warning;
      case 'approved':
        return IronManTheme.success;
      case 'applied':
        return IronManTheme.jarvisGreen;
      case 'rejected':
        return IronManTheme.danger;
      default:
        return IronManTheme.textSecondary;
    }
  };

  const renderCodeChange = (change: CodeChange) => (
    <View key={change.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.statusRow}>
          {getStatusIcon(change.status)}
          <Text style={[styles.statusText, { color: getStatusColor(change.status) }]}>
            {change.status.toUpperCase()}
          </Text>
        </View>
        <View style={styles.typeRow}>
          <FileCode size={16} color={IronManTheme.arcReactorBlue} />
          <Text style={styles.typeText}>{change.changeType}</Text>
        </View>
      </View>

      <Text style={styles.fileName}>{change.fileName}</Text>
      <Text style={styles.description}>{change.description}</Text>
      <Text style={styles.reason}>Reason: {change.reason}</Text>
      <Text style={styles.impact}>Impact: {change.impact}</Text>

      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          Created: {new Date(change.timestamp).toLocaleString()}
        </Text>
        {change.appliedAt && (
          <Text style={styles.metadataText}>
            Applied: {new Date(change.appliedAt).toLocaleString()}
          </Text>
        )}
      </View>

      {change.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(change.id)}
          >
            <CheckCircle size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(change.id)}
          >
            <XCircle size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {change.status === 'approved' && !change.applied && (
        <TouchableOpacity
          style={[styles.actionButton, styles.applyButton]}
          onPress={() => handleApply(change.id)}
        >
          <CheckCircle size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Apply Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSuggestion = (suggestion: CodeSuggestion) => (
    <View key={suggestion.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{suggestion.category}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(suggestion.priority) }]}>
          <Text style={styles.priorityText}>{suggestion.priority}</Text>
        </View>
      </View>

      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
      <Text style={styles.description}>{suggestion.description}</Text>
      <Text style={styles.fileName}>File: {suggestion.fileName}</Text>
      <Text style={styles.impact}>Expected: {suggestion.expectedImpact}</Text>
      <Text style={styles.metadataText}>Effort: {suggestion.estimatedEffort}</Text>

      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          Status: {suggestion.status}
        </Text>
      </View>
    </View>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ff0000';
      case 'high':
        return IronManTheme.ironManRed;
      case 'medium':
        return IronManTheme.warning;
      case 'low':
        return IronManTheme.arcReactorBlue;
      default:
        return IronManTheme.textSecondary;
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{stats.totalChanges}</Text>
        <Text style={styles.statsLabel}>Total Changes</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={[styles.statsNumber, { color: IronManTheme.jarvisGreen }]}>
          {stats.appliedChanges}
        </Text>
        <Text style={styles.statsLabel}>Applied</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={[styles.statsNumber, { color: IronManTheme.warning }]}>
          {stats.pendingChanges}
        </Text>
        <Text style={styles.statsLabel}>Pending</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{stats.suggestionsCount}</Text>
        <Text style={styles.statsLabel}>Suggestions</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{stats.componentsGenerated}</Text>
        <Text style={styles.statsLabel}>Components</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{stats.debugSessionsResolved}</Text>
        <Text style={styles.statsLabel}>Debug Sessions</Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Autonomous Mode</Text>
            <Text style={styles.settingDescription}>
              Auto-apply approved modifications
            </Text>
          </View>
          <Switch
            value={autonomousMode}
            onValueChange={handleToggleAutonomous}
            trackColor={{ false: '#333', true: IronManTheme.jarvisGreen }}
            thumbColor={autonomousMode ? '#fff' : '#ccc'}
          />
        </View>

        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportChangelog}
        >
          <Download size={20} color={IronManTheme.arcReactorBlue} />
          <Text style={styles.exportButtonText}>Export Changelog</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Code size={28} color={IronManTheme.jarvisGreen} />
          <Text style={styles.title}>Code Modifications</Text>
        </View>
        <Text style={styles.subtitle}>JARVIS Self-Modification System</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'changes' && styles.activeTab]}
          onPress={() => setActiveTab('changes')}
        >
          <Text style={[styles.tabText, activeTab === 'changes' && styles.activeTabText]}>
            Changes ({codeChanges.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
          onPress={() => setActiveTab('suggestions')}
        >
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
            Suggestions ({suggestions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Statistics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'changes' && (
          <View>
            {codeChanges.length === 0 ? (
              <View style={styles.emptyState}>
                <FileCode size={48} color={IronManTheme.textSecondary} />
                <Text style={styles.emptyText}>No code modifications yet</Text>
                <Text style={styles.emptySubtext}>
                  Ask JARVIS to propose improvements or generate components
                </Text>
              </View>
            ) : (
              codeChanges.map(renderCodeChange)
            )}
          </View>
        )}

        {activeTab === 'suggestions' && (
          <View>
            {suggestions.length === 0 ? (
              <View style={styles.emptyState}>
                <AlertCircle size={48} color={IronManTheme.textSecondary} />
                <Text style={styles.emptyText}>No improvement suggestions</Text>
                <Text style={styles.emptySubtext}>
                  Ask JARVIS to analyze the codebase for improvements
                </Text>
              </View>
            ) : (
              suggestions.map(renderSuggestion)
            )}
          </View>
        )}

        {activeTab === 'stats' && renderStats()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.jarvisGreen + '30',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
  },
  subtitle: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: IronManTheme.jarvisGreen,
  },
  tabText: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: IronManTheme.jarvisGreen,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen + '20',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    color: IronManTheme.arcReactorBlue,
    fontWeight: '600',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: IronManTheme.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  reason: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
    marginBottom: 4,
  },
  impact: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
    marginBottom: 8,
  },
  metadata: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: IronManTheme.success,
  },
  rejectButton: {
    backgroundColor: IronManTheme.danger,
  },
  applyButton: {
    backgroundColor: IronManTheme.jarvisGreen,
    marginTop: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryBadge: {
    backgroundColor: IronManTheme.arcReactorBlue + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: IronManTheme.arcReactorBlue,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    marginTop: 8,
  },
  statsContainer: {
    gap: 16,
  },
  statsCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen + '20',
  },
  statsNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen + '20',
    gap: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: IronManTheme.arcReactorBlue,
  },
  exportButtonText: {
    color: IronManTheme.arcReactorBlue,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: IronManTheme.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
