import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import { X, Check, ChevronDown } from 'lucide-react-native';
import { IronManTheme } from '@/constants/colors';
import { ALL_PLATFORMS } from '@/constants/platforms';

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onSelectPlatforms: (platforms: string[]) => void;
  multiSelect?: boolean;
}

export function PlatformSelector({
  selectedPlatforms,
  onSelectPlatforms,
  multiSelect = true,
}: PlatformSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [localSelection, setLocalSelection] = useState<string[]>(selectedPlatforms);

  const categories = [
    { key: 'social', name: 'Social Media', color: IronManTheme.primary },
    { key: 'video', name: 'Video Platforms', color: IronManTheme.secondary },
    { key: 'gaming', name: 'Gaming', color: IronManTheme.accent },
    { key: 'ecommerce', name: 'E-commerce', color: IronManTheme.jarvisGreen },
    { key: 'messaging', name: 'Messaging', color: IronManTheme.primary },
    { key: 'professional', name: 'Professional', color: IronManTheme.secondary },
    { key: 'other', name: 'Other', color: IronManTheme.textSecondary },
  ];

  const togglePlatform = (platformId: string) => {
    if (multiSelect) {
      if (localSelection.includes(platformId)) {
        setLocalSelection(localSelection.filter((id) => id !== platformId));
      } else {
        setLocalSelection([...localSelection, platformId]);
      }
    } else {
      setLocalSelection([platformId]);
    }
  };

  const selectAll = () => {
    setLocalSelection(ALL_PLATFORMS.map((p) => p.id));
  };

  const clearAll = () => {
    setLocalSelection([]);
  };

  const applySelection = () => {
    onSelectPlatforms(localSelection);
    setModalVisible(false);
  };

  const getSelectedNames = () => {
    if (selectedPlatforms.length === 0) return 'Select platforms';
    if (selectedPlatforms.length === ALL_PLATFORMS.length) return 'All platforms';
    if (selectedPlatforms.length <= 3) {
      return selectedPlatforms
        .map((id) => ALL_PLATFORMS.find((p) => p.id === id)?.name)
        .join(', ');
    }
    return `${selectedPlatforms.length} platforms selected`;
  };

  return (
    <View>
      <TouchableOpacity style={styles.selectorButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectorButtonText}>{getSelectedNames()}</Text>
        <ChevronDown size={20} color={IronManTheme.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Platforms</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={IronManTheme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={selectAll}>
                <Text style={styles.actionButtonText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
                <Text style={styles.actionButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.platformList}>
              {categories.map((category) => {
                const categoryPlatforms = ALL_PLATFORMS.filter(
                  (p) => p.category === category.key
                );

                if (categoryPlatforms.length === 0) return null;

                return (
                  <View key={category.key} style={styles.categorySection}>
                    <Text style={[styles.categoryTitle, { color: category.color }]}>
                      {category.name}
                    </Text>
                    <View style={styles.platformGrid}>
                      {categoryPlatforms.map((platform) => {
                        const isSelected = localSelection.includes(platform.id);
                        return (
                          <TouchableOpacity
                            key={platform.id}
                            style={[
                              styles.platformItem,
                              isSelected && styles.platformItemSelected,
                            ]}
                            onPress={() => togglePlatform(platform.id)}
                          >
                            {isSelected && (
                              <View style={styles.checkIcon}>
                                <Check size={16} color={IronManTheme.background} />
                              </View>
                            )}
                            <Text
                              style={[
                                styles.platformName,
                                isSelected && styles.platformNameSelected,
                              ]}
                            >
                              {platform.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.selectionCount}>
                {localSelection.length} platform{localSelection.length !== 1 ? 's' : ''} selected
              </Text>
              <TouchableOpacity style={styles.applyButton} onPress={applySelection}>
                <Text style={styles.applyButtonText}>Apply Selection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: IronManTheme.surfaceLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: IronManTheme.border,
  },
  selectorButtonText: {
    color: IronManTheme.text,
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)' as const,
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: IronManTheme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%' as const,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.border,
  },
  modalTitle: {
    color: IronManTheme.text,
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 10,
    padding: 15,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  actionButtonText: {
    color: IronManTheme.secondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  platformList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  platformGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  platformItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: IronManTheme.border,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  platformItemSelected: {
    backgroundColor: IronManTheme.secondary,
    borderColor: IronManTheme.secondary,
  },
  platformName: {
    color: IronManTheme.text,
    fontSize: 13,
  },
  platformNameSelected: {
    color: IronManTheme.background,
    fontWeight: '600' as const,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: IronManTheme.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: IronManTheme.border,
  },
  selectionCount: {
    color: IronManTheme.textSecondary,
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: IronManTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
});
