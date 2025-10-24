import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Workflow, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react-native';

export default function WorkflowRules() {
  const { state, toggleWorkflowRule, addWorkflowRule, deleteWorkflowRule } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');

  const handleAdd = () => {
    if (name.trim() && trigger.trim() && action.trim()) {
      addWorkflowRule(name, trigger, action);
      setName('');
      setTrigger('');
      setAction('');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Workflow Rules</Text>
        <Text style={styles.subtitle}>Automate your influencer operations</Text>

        <View style={styles.addCard}>
          <View style={styles.addHeader}>
            <Workflow color="#00E5FF" size={24} />
            <Text style={styles.addTitle}>Create New Rule</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Rule name..."
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Trigger condition..."
            placeholderTextColor="#666"
            value={trigger}
            onChangeText={setTrigger}
          />
          <TextInput
            style={styles.input}
            placeholder="Action to perform..."
            placeholderTextColor="#666"
            value={action}
            onChangeText={setAction}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleAdd}>
            <Plus size={20} color="#000" />
            <Text style={styles.createButtonText}>Create Rule</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Active Rules</Text>
        <View style={styles.rulesList}>
          {state.workflowRules.map((rule) => (
            <View key={rule.id} style={styles.ruleCard}>
              <View style={styles.ruleInfo}>
                <View style={styles.ruleHeader}>
                  <Text style={styles.ruleName}>{rule.name}</Text>
                  <TouchableOpacity onPress={() => toggleWorkflowRule(rule.id)}>
                    {rule.enabled ? (
                      <ToggleRight color="#10B981" size={32} />
                    ) : (
                      <ToggleLeft color="#666" size={32} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.ruleDetails}>
                  <View style={styles.ruleDetailItem}>
                    <Text style={styles.ruleDetailLabel}>Trigger:</Text>
                    <Text style={styles.ruleDetailValue}>{rule.trigger}</Text>
                  </View>
                  <View style={styles.ruleDetailItem}>
                    <Text style={styles.ruleDetailLabel}>Action:</Text>
                    <Text style={styles.ruleDetailValue}>{rule.action}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteWorkflowRule(rule.id)}
              >
                <Trash2 color="#EF4444" size={20} />
              </TouchableOpacity>
            </View>
          ))}
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
  addCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
  },
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  rulesList: {
    gap: 12,
  },
  ruleCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  ruleInfo: {
    flex: 1,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  ruleDetails: {
    gap: 8,
  },
  ruleDetailItem: {
    flexDirection: 'row',
    gap: 8,
  },
  ruleDetailLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500' as const,
  },
  ruleDetailValue: {
    fontSize: 13,
    color: '#ccc',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
});
