import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Cpu, Plus, Search, Power, Trash2, Zap, CheckCircle, Printer, Home, Thermometer, Lightbulb } from 'lucide-react-native';
import { IronManTheme } from '@/constants/colors';
import IoTDeviceService from '@/services/IoTDeviceService';

export default function IoTDevices() {
  const [devices, setDevices] = useState(IoTDeviceService.getAllDevices());
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);

  const [newDevice, setNewDevice] = useState({
    name: '',
    type: '3d_printer' as const,
    manufacturer: '',
    model: '',
    ipAddress: '',
    apiKey: '',
  });

  const handleAddDevice = async () => {
    if (!newDevice.name || !newDevice.ipAddress) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (newDevice.type === '3d_printer') {
        const commands = [
          { id: 'print_file', name: 'Start Print', description: 'Start printing', parameters: [{ name: 'filename', type: 'string' as const, required: true }] },
          { id: 'pause_print', name: 'Pause Print', description: 'Pause print job', parameters: [] },
          { id: 'cancel_print', name: 'Cancel Print', description: 'Cancel print job', parameters: [] },
          { id: 'preheat_bed', name: 'Preheat Bed', description: 'Preheat bed', parameters: [{ name: 'temperature', type: 'number' as const, required: true, default: 60 }] },
          { id: 'get_status', name: 'Get Status', description: 'Get printer status', parameters: [] },
        ];

        await IoTDeviceService.addDevice({
          name: newDevice.name,
          type: '3d_printer',
          manufacturer: newDevice.manufacturer,
          model: newDevice.model,
          ipAddress: newDevice.ipAddress,
          apiKey: newDevice.apiKey,
          protocol: 'http',
          apiEndpoint: `http://${newDevice.ipAddress}`,
          capabilities: ['print', 'pause', 'cancel', 'preheat', 'status'],
          currentState: { status: 'idle' },
          commands,
        });
      } else {
        const deviceConfig = IoTDeviceService.createSmartHomeDevice(newDevice.name, newDevice.type);
        await IoTDeviceService.addDevice({
          ...deviceConfig,
          ipAddress: newDevice.ipAddress,
          apiKey: newDevice.apiKey,
          apiEndpoint: `http://${newDevice.ipAddress}`,
        });
      }

      setDevices(IoTDeviceService.getAllDevices());
      setShowAddModal(false);
      setNewDevice({ name: '', type: '3d_printer', manufacturer: '', model: '', ipAddress: '', apiKey: '' });
      Alert.alert('Success', `Device "${newDevice.name}" has been added successfully`);
    } catch (error) {
      console.error('Failed to add device:', error);
      Alert.alert('Error', 'Failed to add device. Please try again.');
    }
  };

  const handleExecuteCommand = async (deviceId: string, commandId: string, parameters: Record<string, any> = {}) => {
    setIsExecutingCommand(true);
    try {
      await IoTDeviceService.executeCommand(deviceId, commandId, parameters);
      setDevices(IoTDeviceService.getAllDevices());
      Alert.alert('Success', 'Command executed successfully');
    } catch (error: any) {
      console.error('Failed to execute command:', error);
      Alert.alert('Error', error.message || 'Failed to execute command');
    } finally {
      setIsExecutingCommand(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    Alert.alert(
      'Remove Device',
      'Are you sure you want to remove this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await IoTDeviceService.removeDevice(deviceId);
            setDevices(IoTDeviceService.getAllDevices());
          },
        },
      ]
    );
  };

  const filteredDevices = devices.filter((d: any) => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case '3d_printer':
        return Printer;
      case 'smart_light':
        return Lightbulb;
      case 'smart_plug':
        return Power;
      case 'thermostat':
        return Thermometer;
      default:
        return Home;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'idle':
      case 'on':
        return IronManTheme.success;
      case 'offline':
      case 'error':
        return IronManTheme.danger;
      case 'printing':
      case 'busy':
        return IronManTheme.warning;
      default:
        return IronManTheme.textMuted;
    }
  };

  const renderDeviceCard = (device: any) => {
    const DeviceIcon = getDeviceIcon(device.type);
    const statusColor = getStatusColor(device.currentState.status);
    const isExpanded = selectedDevice === device.id;

    return (
      <View key={device.id} style={styles.deviceCard}>
        <TouchableOpacity 
          style={styles.deviceHeader}
          onPress={() => setSelectedDevice(isExpanded ? null : device.id)}
        >
          <View style={[styles.deviceIconContainer, { borderColor: statusColor }]}>
            <DeviceIcon size={28} color={statusColor} />
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          </View>
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceDetails}>
              {device.manufacturer} {device.model} • {device.currentState.status}
            </Text>
            <Text style={styles.deviceAddress}>{device.ipAddress}</Text>
          </View>

          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveDevice(device.id)}
          >
            <Trash2 size={18} color={IronManTheme.danger} />
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.deviceControls}>
            <Text style={styles.controlsTitle}>Available Commands</Text>
            {device.commands.map((command: any) => (
              <TouchableOpacity
                key={command.id}
                style={styles.commandButton}
                onPress={() => handleExecuteCommand(device.id, command.id)}
                disabled={isExecutingCommand}
              >
                <View style={styles.commandInfo}>
                  <Text style={styles.commandName}>{command.name}</Text>
                  <Text style={styles.commandDescription}>{command.description}</Text>
                </View>
                {isExecutingCommand ? (
                  <ActivityIndicator size="small" color={IronManTheme.jarvisGreen} />
                ) : (
                  <Zap size={20} color={IronManTheme.jarvisGreen} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.deviceStatus}>
              <Text style={styles.statusTitle}>Current State</Text>
              {Object.entries(device.currentState).map(([key, value]) => (
                <View key={key} style={styles.statusRow}>
                  <Text style={styles.statusKey}>{key}:</Text>
                  <Text style={styles.statusValue}>{String(value)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.deviceCapabilities}>
              <Text style={styles.capabilitiesTitle}>Capabilities</Text>
              <View style={styles.capabilitiesList}>
                {device.capabilities.map((cap: string) => (
                  <View key={cap} style={styles.capabilityTag}>
                    <CheckCircle size={12} color={IronManTheme.success} />
                    <Text style={styles.capabilityText}>{cap}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Cpu size={32} color={IronManTheme.secondary} />
            <Text style={styles.title}>IoT Device Control</Text>
          </View>
          <Text style={styles.subtitle}>
            Manage and control your connected devices - 3D printers, smart home, and more
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{devices.length}</Text>
            <Text style={styles.statLabel}>Total Devices</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: IronManTheme.success }]}>
              {devices.filter((d: any) => d.currentState.status === 'online' || d.currentState.status === 'idle').length}
            </Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: IronManTheme.warning }]}>
              {devices.filter((d: any) => d.currentState.status === 'printing' || d.currentState.status === 'busy').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Search size={20} color={IronManTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search devices..."
            placeholderTextColor={IronManTheme.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {filteredDevices.length === 0 ? (
        <View style={styles.emptyState}>
          <Cpu size={64} color={IronManTheme.textMuted} />
          <Text style={styles.emptyTitle}>No Devices Found</Text>
          <Text style={styles.emptyText}>
            {search ? 'No devices match your search' : 'Add your first IoT device to get started'}
          </Text>
          {!search && (
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Plus size={20} color="#000" />
              <Text style={styles.emptyButtonText}>Add Device</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.devicesList}>
          {filteredDevices.map(renderDeviceCard)}
        </View>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Device</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Device Type</Text>
                <View style={styles.typeSelector}>
                  {[
                    { value: '3d_printer', label: '3D Printer', icon: Printer },
                    { value: 'smart_light', label: 'Smart Light', icon: Lightbulb },
                    { value: 'smart_plug', label: 'Smart Plug', icon: Power },
                    { value: 'thermostat', label: 'Thermostat', icon: Thermometer },
                  ].map((type) => {
                    const TypeIcon = type.icon;
                    return (
                      <TouchableOpacity
                        key={type.value}
                        style={[styles.typeOption, newDevice.type === type.value && styles.typeOptionActive]}
                        onPress={() => setNewDevice({ ...newDevice, type: type.value as any })}
                      >
                        <TypeIcon size={24} color={newDevice.type === type.value ? IronManTheme.secondary : IronManTheme.textMuted} />
                        <Text style={[styles.typeLabel, newDevice.type === type.value && styles.typeLabelActive]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Device Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="My 3D Printer"
                  placeholderTextColor={IronManTheme.textMuted}
                  value={newDevice.name}
                  onChangeText={(text) => setNewDevice({ ...newDevice, name: text })}
                />
              </View>

              {newDevice.type === '3d_printer' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Manufacturer</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Prusa, Creality, etc."
                      placeholderTextColor={IronManTheme.textMuted}
                      value={newDevice.manufacturer}
                      onChangeText={(text) => setNewDevice({ ...newDevice, manufacturer: text })}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Model</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MK3S, Ender 3, etc."
                      placeholderTextColor={IronManTheme.textMuted}
                      value={newDevice.model}
                      onChangeText={(text) => setNewDevice({ ...newDevice, model: text })}
                    />
                  </View>
                </>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>IP Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="192.168.1.100"
                  placeholderTextColor={IronManTheme.textMuted}
                  value={newDevice.ipAddress}
                  onChangeText={(text) => setNewDevice({ ...newDevice, ipAddress: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>API Key (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter API key if required"
                  placeholderTextColor={IronManTheme.textMuted}
                  value={newDevice.apiKey}
                  onChangeText={(text) => setNewDevice({ ...newDevice, apiKey: text })}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddDevice}>
                <Plus size={20} color="#000" />
                <Text style={styles.submitButtonText}>Add Device</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IronManTheme.background,
  },
  header: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: IronManTheme.text,
  },
  subtitle: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: IronManTheme.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: IronManTheme.secondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: IronManTheme.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: IronManTheme.jarvisGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: IronManTheme.glow.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: IronManTheme.jarvisGreen,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
  },
  devicesList: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  deviceCard: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
    overflow: 'hidden',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  deviceIconContainer: {
    position: 'relative' as const,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: IronManTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  statusIndicator: {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: IronManTheme.surface,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  deviceDetails: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
    marginBottom: 2,
  },
  deviceAddress: {
    fontSize: 11,
    color: IronManTheme.textMuted,
    fontFamily: 'monospace',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IronManTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceControls: {
    borderTopWidth: 1,
    borderTopColor: IronManTheme.surfaceLight,
    padding: 16,
    gap: 16,
  },
  controlsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 8,
  },
  commandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: IronManTheme.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  commandInfo: {
    flex: 1,
  },
  commandName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 2,
  },
  commandDescription: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  deviceStatus: {
    backgroundColor: IronManTheme.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statusKey: {
    fontSize: 12,
    color: IronManTheme.textMuted,
    textTransform: 'capitalize' as const,
  },
  statusValue: {
    fontSize: 12,
    color: IronManTheme.text,
    fontWeight: '600' as const,
  },
  deviceCapabilities: {
    backgroundColor: IronManTheme.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  capabilitiesTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 8,
  },
  capabilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  capabilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: IronManTheme.success + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  capabilityText: {
    fontSize: 11,
    color: IronManTheme.success,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: IronManTheme.background,
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: IronManTheme.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.surfaceLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: IronManTheme.text,
  },
  modalClose: {
    fontSize: 24,
    color: IronManTheme.textMuted,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: IronManTheme.surfaceLight,
  },
  typeOptionActive: {
    borderColor: IronManTheme.secondary,
    backgroundColor: IronManTheme.secondary + '10',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: IronManTheme.textMuted,
  },
  typeLabelActive: {
    color: IronManTheme.secondary,
  },
  input: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: IronManTheme.text,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: IronManTheme.jarvisGreen,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
});
