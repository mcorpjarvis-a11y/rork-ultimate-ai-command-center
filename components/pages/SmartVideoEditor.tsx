import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { IronManTheme } from '@/constants/colors';

export default function SmartVideoEditor() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'effects' | 'ai'>('edit');

  const aiFeatures = [
    {
      id: '1',
      name: 'Auto Captions',
      description: 'AI-generated captions in 40+ languages',
      icon: '📝',
    },
    {
      id: '2',
      name: 'Smart Crop',
      description: 'Auto-resize for different platforms',
      icon: '✂️',
    },
    {
      id: '3',
      name: 'Background Removal',
      description: 'Remove background with AI',
      icon: '🎭',
    },
    {
      id: '4',
      name: 'Auto Highlights',
      description: 'AI finds best moments',
      icon: '⭐',
    },
    {
      id: '5',
      name: 'Face Enhancement',
      description: 'Beauty filter and lighting adjustment',
      icon: '✨',
    },
    {
      id: '6',
      name: 'Scene Detection',
      description: 'Auto-detect and split scenes',
      icon: '🎬',
    },
    {
      id: '7',
      name: 'Audio Cleanup',
      description: 'Remove noise and enhance voice',
      icon: '🎧',
    },
    {
      id: '8',
      name: 'Auto B-Roll',
      description: 'AI suggests relevant B-roll footage',
      icon: '🎥',
    },
  ];

  const basicEdits = [
    { id: '1', name: 'Trim', icon: '✂️' },
    { id: '2', name: 'Split', icon: '⚡' },
    { id: '3', name: 'Merge', icon: '🔗' },
    { id: '4', name: 'Speed', icon: '⏩' },
    { id: '5', name: 'Reverse', icon: '⏪' },
    { id: '6', name: 'Rotate', icon: '🔄' },
  ];

  const effects = [
    { id: '1', name: 'Filters', icon: '🎨', count: 50 },
    { id: '2', name: 'Transitions', icon: '🌟', count: 30 },
    { id: '3', name: 'Text Styles', icon: '📱', count: 100 },
    { id: '4', name: 'Stickers', icon: '😊', count: 200 },
    { id: '5', name: 'Music', icon: '🎵', count: 500 },
    { id: '6', name: 'Sound FX', icon: '🔊', count: 150 },
  ];

  const templates = [
    {
      id: '1',
      name: 'Instagram Reel',
      platform: 'Instagram',
      ratio: '9:16',
      duration: '15-90s',
      trending: true,
    },
    {
      id: '2',
      name: 'TikTok',
      platform: 'TikTok',
      ratio: '9:16',
      duration: '15-60s',
      trending: true,
    },
    {
      id: '3',
      name: 'YouTube Short',
      platform: 'YouTube',
      ratio: '9:16',
      duration: '15-60s',
      trending: true,
    },
    {
      id: '4',
      name: 'YouTube Video',
      platform: 'YouTube',
      ratio: '16:9',
      duration: '5-15min',
      trending: false,
    },
    {
      id: '5',
      name: 'Instagram Story',
      platform: 'Instagram',
      ratio: '9:16',
      duration: '15s',
      trending: false,
    },
    {
      id: '6',
      name: 'Twitter Video',
      platform: 'Twitter',
      ratio: '16:9',
      duration: '2:20',
      trending: false,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Video Editor</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Video Editing</Text>
      </View>

      {/* Upload Section */}
      {!selectedVideo && (
        <TouchableOpacity style={styles.uploadBox} onPress={() => setSelectedVideo('demo')}>
          <Text style={styles.uploadIcon}>📹</Text>
          <Text style={styles.uploadTitle}>Select or Record Video</Text>
          <Text style={styles.uploadSubtitle}>Import from gallery or record new</Text>
        </TouchableOpacity>
      )}

      {/* Video Preview */}
      {selectedVideo && (
        <View style={styles.videoPreview}>
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewIcon}>▶️</Text>
            <Text style={styles.previewText}>Video Preview</Text>
          </View>
          <View style={styles.videoControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏮️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButtonLarge}>
              <Text style={styles.controlIconLarge}>▶️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏭️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Templates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Quick Templates</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
          {templates.map((template) => (
            <TouchableOpacity key={template.id} style={styles.templateCard}>
              {template.trending && (
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingText}>🔥 TRENDING</Text>
                </View>
              )}
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templatePlatform}>{template.platform}</Text>
              <View style={styles.templateDetails}>
                <Text style={styles.templateDetail}>{template.ratio}</Text>
                <Text style={styles.templateDetail}>{template.duration}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['edit', 'effects', 'ai'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'ai' ? 'AI Tools' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Edit Tab */}
      {activeTab === 'edit' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✂️ Basic Edits</Text>
          <View style={styles.grid}>
            {basicEdits.map((edit) => (
              <TouchableOpacity key={edit.id} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{edit.icon}</Text>
                <Text style={styles.featureName}>{edit.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Effects & Assets</Text>
          <View style={styles.grid}>
            {effects.map((effect) => (
              <TouchableOpacity key={effect.id} style={styles.effectCard}>
                <Text style={styles.effectIcon}>{effect.icon}</Text>
                <Text style={styles.effectName}>{effect.name}</Text>
                <Text style={styles.effectCount}>{effect.count}+ options</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI-Powered Tools</Text>
          <Text style={styles.sectionSubtitle}>Let AI do the heavy lifting</Text>
          <View style={styles.aiGrid}>
            {aiFeatures.map((feature) => (
              <TouchableOpacity key={feature.id} style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Text style={styles.aiIcon}>{feature.icon}</Text>
                  <View style={styles.aiCardBadge}>
                    <Text style={styles.aiCardBadgeText}>AI</Text>
                  </View>
                </View>
                <Text style={styles.aiCardName}>{feature.name}</Text>
                <Text style={styles.aiCardDescription}>{feature.description}</Text>
                <TouchableOpacity style={styles.aiCardButton}>
                  <Text style={styles.aiCardButtonText}>Apply</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Export Section */}
      {selectedVideo && (
        <View style={styles.exportSection}>
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportButtonText}>⬇️ Export Video</Text>
          </TouchableOpacity>
          <View style={styles.exportOptions}>
            <TouchableOpacity style={styles.exportOption}>
              <Text style={styles.exportOptionText}>📱 Save to Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportOption}>
              <Text style={styles.exportOptionText}>📤 Share Directly</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IronManTheme.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
  },
  uploadBox: {
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 2,
    borderColor: IronManTheme.accent,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
  },
  videoPreview: {
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
  },
  previewPlaceholder: {
    aspectRatio: 9 / 16,
    backgroundColor: IronManTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 16,
    color: IronManTheme.textSecondary,
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: IronManTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: IronManTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 20,
  },
  controlIconLarge: {
    fontSize: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    marginBottom: 16,
  },
  templatesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  templateCard: {
    width: 140,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  trendingBadge: {
    backgroundColor: IronManTheme.warning + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: IronManTheme.warning,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  templatePlatform: {
    fontSize: 12,
    color: IronManTheme.accent,
    marginBottom: 8,
  },
  templateDetails: {
    gap: 4,
  },
  templateDetail: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: IronManTheme.accent + '20',
    borderWidth: 1,
    borderColor: IronManTheme.accent,
  },
  tabText: {
    color: IronManTheme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: IronManTheme.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '30%',
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 13,
    fontWeight: '600',
    color: IronManTheme.text,
    textAlign: 'center',
  },
  effectCard: {
    width: '47%',
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  effectIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  effectName: {
    fontSize: 14,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  effectCount: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
  },
  aiGrid: {
    gap: 12,
  },
  aiCard: {
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen + '40',
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIcon: {
    fontSize: 32,
  },
  aiCardBadge: {
    backgroundColor: IronManTheme.jarvisGreen + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  aiCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
  },
  aiCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  aiCardDescription: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  aiCardButton: {
    backgroundColor: IronManTheme.jarvisGreen + '20',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen,
  },
  aiCardButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
  },
  exportSection: {
    marginTop: 20,
    gap: 12,
  },
  exportButton: {
    backgroundColor: IronManTheme.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: IronManTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  exportOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportOption: {
    flex: 1,
    backgroundColor: IronManTheme.surfaceLight,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
  },
  exportOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: IronManTheme.text,
  },
});
