import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { IronManTheme } from '@/constants/colors';
import CollabFinderService, { Influencer } from '@/services/CollabFinderService';

export default function CollabFinder() {
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'active'>('discover');
  const [influencers, setInfluencers] = useState(CollabFinderService.getInfluencers());
  const [requests, setRequests] = useState(CollabFinderService.getRequests());
  const [collaborations, setCollaborations] = useState(CollabFinderService.getActiveCollaborations());
  const [stats, setStats] = useState(CollabFinderService.getStats());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [requestForm, setRequestForm] = useState({
    type: 'sponsored_post' as const,
    budget: '',
    message: '',
  });

  const refreshData = () => {
    setInfluencers(CollabFinderService.getInfluencers());
    setRequests(CollabFinderService.getRequests());
    setCollaborations(CollabFinderService.getActiveCollaborations());
    setStats(CollabFinderService.getStats());
  };

  const handleSendRequest = async () => {
    if (selectedInfluencer && requestForm.budget) {
      await CollabFinderService.sendCollabRequest(
        selectedInfluencer.id,
        requestForm.type,
        parseFloat(requestForm.budget),
        requestForm.message
      );
      refreshData();
      setShowRequestModal(false);
      setRequestForm({ type: 'sponsored_post', budget: '', message: '' });
      setSelectedInfluencer(null);
    }
  };

  const handleMarkDeliverable = async (collabId: string) => {
    await CollabFinderService.markDeliverable(collabId);
    refreshData();
  };

  const filteredInfluencers = influencers.filter(inf =>
    inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inf.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return IronManTheme.success;
      case 'pending': return IronManTheme.accent;
      case 'declined': return IronManTheme.error;
      case 'completed': return IronManTheme.jarvisGreen;
      default: return IronManTheme.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeCollabs}</Text>
          <Text style={styles.statLabel}>Active Collabs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${formatNumber(stats.totalSpent)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatNumber(stats.totalReach)}</Text>
          <Text style={styles.statLabel}>Total Reach</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['discover', 'requests', 'active'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search influencers..."
            placeholderTextColor={IronManTheme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.section}>
            {filteredInfluencers.map((influencer) => (
              <View key={influencer.id} style={styles.influencerCard}>
                <View style={styles.influencerHeader}>
                  <View style={styles.influencerInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.influencerName}>{influencer.name}</Text>
                      {influencer.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                    </View>
                    <Text style={styles.influencerUsername}>{influencer.username}</Text>
                    <View style={styles.matchScoreContainer}>
                      <View style={[styles.matchScoreBar, { width: `${influencer.matchScore}%` }]} />
                      <Text style={styles.matchScoreText}>{influencer.matchScore}% Match</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.influencerStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{formatNumber(influencer.followers)}</Text>
                    <Text style={styles.statItemLabel}>Followers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{influencer.engagementRate}%</Text>
                    <Text style={styles.statItemLabel}>Engagement</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{influencer.responseRate}%</Text>
                    <Text style={styles.statItemLabel}>Response</Text>
                  </View>
                </View>

                <View style={styles.influencerDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Platform:</Text>
                    <Text style={styles.detailValue}>{influencer.platform}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Niche:</Text>
                    <Text style={styles.detailValue}>{influencer.niche}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rate:</Text>
                    <Text style={styles.detailValue}>{influencer.rateRange}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Avg Response:</Text>
                    <Text style={styles.detailValue}>{influencer.avgResponseTime}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => {
                    setSelectedInfluencer(influencer);
                    setShowRequestModal(true);
                  }}
                >
                  <Text style={styles.contactButtonText}>Send Collab Request</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <View style={styles.section}>
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📬</Text>
              <Text style={styles.emptyStateText}>No requests yet</Text>
            </View>
          ) : (
            requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestInfluencer}>{request.influencerName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                      {request.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestDetails}>
                  <Text style={styles.requestType}>{request.type.replace('_', ' ')}</Text>
                  <Text style={styles.requestBudget}>${request.proposedBudget.toLocaleString()}</Text>
                </View>
                <Text style={styles.requestMessage}>{request.message}</Text>
                <Text style={styles.requestTime}>
                  Sent {Math.floor((Date.now() - request.sentAt) / (24 * 60 * 60 * 1000))} days ago
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Active Collabs Tab */}
      {activeTab === 'active' && (
        <View style={styles.section}>
          {collaborations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🤝</Text>
              <Text style={styles.emptyStateText}>No active collaborations</Text>
            </View>
          ) : (
            collaborations.map((collab) => (
              <View key={collab.id} style={styles.collabCard}>
                <View style={styles.collabHeader}>
                  <Text style={styles.collabInfluencer}>{collab.influencerName}</Text>
                  <Text style={styles.collabBudget}>${collab.budget.toLocaleString()}</Text>
                </View>
                
                <View style={styles.collabType}>
                  <Text style={styles.collabTypeText}>{collab.type.replace('_', ' ')}</Text>
                </View>

                <View style={styles.deliverablesContainer}>
                  <Text style={styles.deliverablesTitle}>
                    Deliverables ({collab.deliveredCount}/{collab.deliverables.length})
                  </Text>
                  {collab.deliverables.map((deliverable, idx) => (
                    <View key={idx} style={styles.deliverableRow}>
                      <View style={[
                        styles.checkbox,
                        idx < collab.deliveredCount && styles.checkboxChecked
                      ]}>
                        {idx < collab.deliveredCount && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[
                        styles.deliverableText,
                        idx < collab.deliveredCount && styles.deliverableTextCompleted
                      ]}>
                        {deliverable}
                      </Text>
                    </View>
                  ))}
                </View>

                {collab.deliveredCount < collab.deliverables.length && (
                  <TouchableOpacity
                    style={styles.markButton}
                    onPress={() => handleMarkDeliverable(collab.id)}
                  >
                    <Text style={styles.markButtonText}>Mark Next as Completed</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.collabMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Expected Reach</Text>
                    <Text style={styles.metricValue}>{formatNumber(collab.expectedReach)}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Started</Text>
                    <Text style={styles.metricValue}>
                      {new Date(collab.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Request Modal */}
      <Modal
        visible={showRequestModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Collab Request</Text>
            
            {selectedInfluencer && (
              <View style={styles.selectedInfluencer}>
                <Text style={styles.selectedName}>{selectedInfluencer.name}</Text>
                <Text style={styles.selectedUsername}>{selectedInfluencer.username}</Text>
                <Text style={styles.selectedRate}>Rate: {selectedInfluencer.rateRange}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Collaboration Type</Text>
            <View style={styles.typeButtons}>
              {(['sponsored_post', 'product_review', 'giveaway', 'joint_video'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    requestForm.type === type && styles.typeButtonActive
                  ]}
                  onPress={() => setRequestForm({ ...requestForm, type })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    requestForm.type === type && styles.typeButtonTextActive
                  ]}>
                    {type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Budget ($)</Text>
            <TextInput
              style={styles.input}
              value={requestForm.budget}
              onChangeText={(text) => setRequestForm({ ...requestForm, budget: text })}
              placeholder="Enter budget amount"
              placeholderTextColor={IronManTheme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={requestForm.message}
              onChangeText={(text) => setRequestForm({ ...requestForm, message: text })}
              placeholder="Tell them about your collaboration idea..."
              placeholderTextColor={IronManTheme.textSecondary}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowRequestModal(false);
                  setSelectedInfluencer(null);
                  setRequestForm({ type: 'sponsored_post', budget: '', message: '' });
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, (!requestForm.budget || !requestForm.message) && styles.modalButtonDisabled]}
                onPress={handleSendRequest}
                disabled={!requestForm.budget || !requestForm.message}
              >
                <Text style={styles.modalButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
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
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
  searchInput: {
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
    borderRadius: 12,
    padding: 14,
    color: IronManTheme.text,
    fontSize: 14,
    marginBottom: 16,
  },
  section: {
    gap: 12,
  },
  influencerCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  influencerHeader: {
    marginBottom: 12,
  },
  influencerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  influencerName: {
    fontSize: 18,
    fontWeight: '700',
    color: IronManTheme.text,
  },
  verifiedBadge: {
    backgroundColor: IronManTheme.accent,
    color: IronManTheme.text,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  influencerUsername: {
    fontSize: 14,
    color: IronManTheme.accent,
    marginBottom: 8,
  },
  matchScoreContainer: {
    position: 'relative',
    height: 8,
    backgroundColor: IronManTheme.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  matchScoreBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IronManTheme.jarvisGreen,
    borderRadius: 4,
  },
  matchScoreText: {
    fontSize: 11,
    color: IronManTheme.jarvisGreen,
    fontWeight: '600',
    marginTop: 4,
  },
  influencerStats: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: IronManTheme.accent + '20',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 2,
  },
  statItemLabel: {
    fontSize: 10,
    color: IronManTheme.textSecondary,
  },
  influencerDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    color: IronManTheme.text,
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: IronManTheme.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  requestCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestInfluencer: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.text,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  requestType: {
    fontSize: 13,
    color: IronManTheme.accent,
    textTransform: 'capitalize',
  },
  requestBudget: {
    fontSize: 13,
    color: IronManTheme.jarvisGreen,
    fontWeight: '600',
  },
  requestMessage: {
    fontSize: 13,
    color: IronManTheme.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  requestTime: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
  },
  collabCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen + '40',
  },
  collabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collabInfluencer: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.text,
  },
  collabBudget: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
  },
  collabType: {
    alignSelf: 'flex-start',
    backgroundColor: IronManTheme.accent + '20',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  collabTypeText: {
    fontSize: 11,
    color: IronManTheme.accent,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deliverablesContainer: {
    marginBottom: 12,
  },
  deliverablesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: IronManTheme.text,
    marginBottom: 8,
  },
  deliverableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: IronManTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: IronManTheme.jarvisGreen,
    borderColor: IronManTheme.jarvisGreen,
  },
  checkmark: {
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  deliverableText: {
    fontSize: 13,
    color: IronManTheme.text,
  },
  deliverableTextCompleted: {
    textDecorationLine: 'line-through',
    color: IronManTheme.textSecondary,
  },
  markButton: {
    backgroundColor: IronManTheme.jarvisGreen + '20',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen,
  },
  markButtonText: {
    color: IronManTheme.jarvisGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  collabMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: IronManTheme.accent,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: IronManTheme.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedInfluencer: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  selectedUsername: {
    fontSize: 14,
    color: IronManTheme.accent,
    marginBottom: 4,
  },
  selectedRate: {
    fontSize: 13,
    color: IronManTheme.jarvisGreen,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: IronManTheme.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
    borderRadius: 8,
    padding: 12,
    color: IronManTheme.text,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.textSecondary,
  },
  typeButtonActive: {
    backgroundColor: IronManTheme.accent + '20',
    borderColor: IronManTheme.accent,
  },
  typeButtonText: {
    color: IronManTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: IronManTheme.accent,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    backgroundColor: IronManTheme.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: IronManTheme.surfaceLight,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.textSecondary,
  },
  modalButtonSecondaryText: {
    color: IronManTheme.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
