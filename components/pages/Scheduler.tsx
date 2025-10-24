import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Calendar, Plus, Clock, Trash2 } from 'lucide-react-native';

export default function Scheduler() {
  const { state, addScheduledTask, deleteScheduledTask } = useApp();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTask = () => {
    if (title.trim()) {
      addScheduledTask(title, description, Date.now() + 86400000, 'content');
      setTitle('');
      setDescription('');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Scheduler</Text>
        <Text style={styles.subtitle}>Schedule automated tasks and content</Text>

        <View style={styles.addCard}>
          <View style={styles.addHeader}>
            <Calendar color="#00E5FF" size={24} />
            <Text style={styles.addTitle}>Schedule New Task</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Task title..."
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity style={styles.scheduleButton} onPress={handleAddTask}>
            <Plus size={20} color="#000" />
            <Text style={styles.scheduleButtonText}>Schedule Task</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Scheduled Tasks</Text>
        {state.scheduledTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No scheduled tasks</Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {state.scheduledTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <View style={styles.taskMeta}>
                    <Clock color="#666" size={14} />
                    <Text style={styles.taskTime}>
                      {new Date(task.scheduledTime).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteScheduledTask(task.id)}
                >
                  <Trash2 color="#EF4444" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  scheduleButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scheduleButtonText: {
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskTime: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
});
