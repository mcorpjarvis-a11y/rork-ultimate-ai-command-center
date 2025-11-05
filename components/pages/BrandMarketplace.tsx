import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { IronManTheme } from '@/constants/colors';
import BrandMarketplaceService from '@/services/BrandMarketplaceService';

export default function BrandMarketplace() {
  const [activeTab, setActiveTab] = useState<'deals' | 'applications' | 'contracts'>('deals');
  const [deals, setDeals] = useState(BrandMarketplaceService.getDeals());
  const [applications, setApplications] = useState(BrandMarketplaceService.getApplications());
  const [contracts, setContracts] = useState(BrandMarketplaceService.getContracts());
  const [stats, setStats] = useState(BrandMarketplaceService.getStats());
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [applicationForm, setApplicationForm] = useState({
    message: '',
    portfolio: '',
    proposedRate: '',
  });

  const refreshData = () => {
    setDeals(BrandMarketplaceService.getDeals());
    setApplications(BrandMarketplaceService.getApplications());
    setContracts(BrandMarketplaceService.getContracts());
    setStats(BrandMarketplaceService.getStats());
  };

  const handleApply = async () => {
    if (selectedDeal && applicationForm.message) {
      const portfolioLinks = applicationForm.portfolio.split(',').map(s => s.trim()).filter(Boolean);
      await BrandMarketplaceService.applyToDeal(
        selectedDeal.id,
        applicationForm.message,
        portfolioLinks,
        applicationForm.proposedRate ? parseFloat(applicationForm.proposedRate) : undefined
      );
      refreshData();
      setShowApplyModal(false);
      setApplicationForm({ message: '', portfolio: '', proposedRate: '' });
      setSelectedDeal(null);
    }
  };

  const handleCompleteMilestone = async (contractId: string, milestoneId: string) => {
    await BrandMarketplaceService.completeMilestone(contractId, milestoneId);
    refreshData();
  };

  const filteredDeals = deals.filter(deal =>
    deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      sponsorship: IronManTheme.primary,
      affiliate: IronManTheme.accent,
      ambassador: IronManTheme.jarvisGreen,
      product_placement: IronManTheme.secondary,
      event: IronManTheme.warning,
    };
    return colors[type] || IronManTheme.textSecondary;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return IronManTheme.success;
      case 'pending': return IronManTheme.accent;
      case 'rejected': return IronManTheme.error;
      case 'interview': return IronManTheme.warning;
      case 'completed': return IronManTheme.jarvisGreen;
      case 'active': return IronManTheme.accent;
      default: return IronManTheme.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalDeals}</Text>
          <Text style={styles.statLabel}>Open Deals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeContracts}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${formatNumber(Math.round(stats.totalEarned))}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.successRate.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['deals', 'applications', 'contracts'] as const).map((tab) => (
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

      {/* Deals Tab */}
      {activeTab === 'deals' && (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search brands..."
            placeholderTextColor={IronManTheme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.section}>
            {filteredDeals.map((deal) => (
              <View key={deal.id} style={styles.dealCard}>
                <View style={styles.dealHeader}>
                  <View style={styles.dealHeaderLeft}>
                    <Text style={styles.brandName}>{deal.brandName}</Text>
                    {deal.verified && <Text style={styles.verifiedBadge}>✓</Text>}
                  </View>
                  <Text style={styles.dealBudget}>${formatNumber(deal.budget)}</Text>
                </View>

                <View style={[styles.dealTypeBadge, { backgroundColor: getDealTypeColor(deal.dealType) + '20' }]}>
                  <Text style={[styles.dealTypeText, { color: getDealTypeColor(deal.dealType) }]}>
                    {deal.dealType.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>

                <View style={styles.dealDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{deal.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{deal.duration}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Min Followers:</Text>
                    <Text style={styles.detailValue}>{formatNumber(deal.minFollowers)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Platforms:</Text>
                    <Text style={styles.detailValue}>{deal.platforms.join(', ')}</Text>
                  </View>
                </View>

                <View style={styles.requirementsBox}>
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                  {deal.requirements.slice(0, 3).map((req, idx) => (
                    <Text key={idx} style={styles.requirementItem}>• {req}</Text>
                  ))}
                </View>

                <View style={styles.dealStats}>
                  <View style={styles.dealStat}>
                    <Text style={styles.dealStatValue}>{deal.applications}</Text>
                    <Text style={styles.dealStatLabel}>Applications</Text>
                  </View>
                  <View style={styles.dealStat}>
                    <Text style={styles.dealStatValue}>{deal.acceptanceRate}%</Text>
                    <Text style={styles.dealStatLabel}>Accept Rate</Text>
                  </View>
                  <View style={styles.dealStat}>
                    <Text style={styles.dealStatValue}>{deal.avgPayoutTime}</Text>
                    <Text style={styles.dealStatLabel}>Avg Payout</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => {
                    setSelectedDeal(deal);
                    setShowApplyModal(true);
                  }}
                >
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <View style={styles.section}>
          {applications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📝</Text>
              <Text style={styles.emptyStateText}>No applications yet</Text>
            </View>
          ) : (
            applications.map((app) => (
              <View key={app.id} style={styles.applicationCard}>
                <View style={styles.appHeader}>
                  <Text style={styles.appBrand}>{app.brandName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                      {app.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.appMessage}>{app.message}</Text>
                {app.proposedRate && (
                  <Text style={styles.appRate}>Proposed Rate: ${app.proposedRate.toLocaleString()}</Text>
                )}
                <Text style={styles.appTime}>
                  Applied {Math.floor((Date.now() - app.appliedAt) / (24 * 60 * 60 * 1000))} days ago
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <View style={styles.section}>
          {contracts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📄</Text>
              <Text style={styles.emptyStateText}>No contracts yet</Text>
            </View>
          ) : (
            contracts.map((contract) => (
              <View key={contract.id} style={styles.contractCard}>
                <View style={styles.contractHeader}>
                  <View>
                    <Text style={styles.contractBrand}>{contract.brandName}</Text>
                    <Text style={styles.contractType}>{contract.dealType.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.contractAmount}>${contract.amount.toLocaleString()}</Text>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {
                    width: `${(contract.totalPaid / contract.amount) * 100}%`
                  }]} />
                </View>
                <Text style={styles.progressText}>
                  ${contract.totalPaid.toLocaleString()} of ${contract.amount.toLocaleString()} paid
                </Text>

                <View style={styles.milestonesContainer}>
                  <Text style={styles.milestonesTitle}>Milestones:</Text>
                  {contract.milestones.map((milestone) => (
                    <View key={milestone.id} style={styles.milestoneRow}>
                      <TouchableOpacity
                        style={[
                          styles.milestoneCheckbox,
                          milestone.status === 'completed' && styles.milestoneCheckboxChecked
                        ]}
                        onPress={() => {
                          if (milestone.status === 'pending') {
                            handleCompleteMilestone(contract.id, milestone.id);
                          }
                        }}
                        disabled={milestone.status === 'completed'}
                      >
                        {milestone.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                      <View style={styles.milestoneDetails}>
                        <Text style={[
                          styles.milestoneDescription,
                          milestone.status === 'completed' && styles.milestoneDescriptionCompleted
                        ]}>
                          {milestone.description}
                        </Text>
                        <Text style={styles.milestoneAmount}>${milestone.amount.toLocaleString()}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={[styles.contractStatusBadge, {
                  backgroundColor: getStatusColor(contract.status) + '20'
                }]}>
                  <Text style={[styles.contractStatusText, { color: getStatusColor(contract.status) }]}>
                    {contract.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Apply Modal */}
      <Modal
        visible={showApplyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Apply to Deal</Text>
              
              {selectedDeal && (
                <View style={styles.selectedDeal}>
                  <Text style={styles.selectedBrand}>{selectedDeal.brandName}</Text>
                  <Text style={styles.selectedAmount}>${formatNumber(selectedDeal.budget)}</Text>
                  <Text style={styles.selectedType}>{selectedDeal.dealType.replace('_', ' ')}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Why are you a good fit?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={applicationForm.message}
                onChangeText={(text) => setApplicationForm({ ...applicationForm, message: text })}
                placeholder="Tell them why you're perfect for this deal..."
                placeholderTextColor={IronManTheme.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Portfolio Links (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={applicationForm.portfolio}
                onChangeText={(text) => setApplicationForm({ ...applicationForm, portfolio: text })}
                placeholder="instagram.com/you, youtube.com/you"
                placeholderTextColor={IronManTheme.textSecondary}
              />

              <Text style={styles.inputLabel}>Your Rate (Optional - leave blank to accept theirs)</Text>
              <TextInput
                style={styles.input}
                value={applicationForm.proposedRate}
                onChangeText={(text) => setApplicationForm({ ...applicationForm, proposedRate: text })}
                placeholder="Enter your rate in $"
                placeholderTextColor={IronManTheme.textSecondary}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => {
                    setShowApplyModal(false);
                    setSelectedDeal(null);
                    setApplicationForm({ message: '', portfolio: '', proposedRate: '' });
                  }}
                >
                  <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, !applicationForm.message && styles.modalButtonDisabled]}
                  onPress={handleApply}
                  disabled={!applicationForm.message}
                >
                  <Text style={styles.modalButtonText}>Submit Application</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  dealCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  brandName: {
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
  dealBudget: {
    fontSize: 20,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
  },
  dealTypeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  dealTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dealDetails: {
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
  requirementsBox: {
    backgroundColor: IronManTheme.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: IronManTheme.text,
    marginBottom: 6,
  },
  requirementItem: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    marginBottom: 3,
  },
  dealStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  dealStat: {
    flex: 1,
  },
  dealStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 2,
  },
  dealStatLabel: {
    fontSize: 10,
    color: IronManTheme.textSecondary,
  },
  applyButton: {
    backgroundColor: IronManTheme.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  applicationCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appBrand: {
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
  appMessage: {
    fontSize: 13,
    color: IronManTheme.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  appRate: {
    fontSize: 14,
    color: IronManTheme.jarvisGreen,
    fontWeight: '600',
    marginBottom: 8,
  },
  appTime: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
  },
  contractCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen + '40',
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contractBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  contractType: {
    fontSize: 13,
    color: IronManTheme.accent,
    textTransform: 'capitalize',
  },
  contractAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
  },
  progressBar: {
    height: 8,
    backgroundColor: IronManTheme.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: IronManTheme.jarvisGreen,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    marginBottom: 12,
  },
  milestonesContainer: {
    marginBottom: 12,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: IronManTheme.text,
    marginBottom: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  milestoneCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: IronManTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneCheckboxChecked: {
    backgroundColor: IronManTheme.jarvisGreen,
    borderColor: IronManTheme.jarvisGreen,
  },
  checkmark: {
    color: IronManTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  milestoneDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneDescription: {
    fontSize: 13,
    color: IronManTheme.text,
    flex: 1,
  },
  milestoneDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: IronManTheme.textSecondary,
  },
  milestoneAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: IronManTheme.jarvisGreen,
  },
  contractStatusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  contractStatusText: {
    fontSize: 11,
    fontWeight: '700',
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
  },
  modalScrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  modalContent: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedDeal: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  selectedAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
    marginBottom: 4,
  },
  selectedType: {
    fontSize: 13,
    color: IronManTheme.accent,
    textTransform: 'capitalize',
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
