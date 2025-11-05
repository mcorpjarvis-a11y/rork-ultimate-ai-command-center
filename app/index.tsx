import { View, StyleSheet } from 'react-native';
import { useState, useMemo, useEffect, useCallback } from 'react';

import { StatusBar } from 'expo-status-bar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

import OverviewDashboard from '@/components/pages/OverviewDashboard';
import SystemLogs from '@/components/pages/SystemLogs';
import Validator from '@/components/pages/Validator';
import ContentEngine from '@/components/pages/ContentEngine';
import TrendAnalysis from '@/components/pages/TrendAnalysis';
import PersonaBuilder from '@/components/pages/PersonaBuilder';
import MediaGenerator from '@/components/pages/MediaGenerator';
import MediaStudio from '@/components/pages/MediaStudio';
import APIKeys from '@/components/pages/APIKeys';
import SocialConnect from '@/components/pages/SocialConnect';
import DataSources from '@/components/pages/DataSources';
import Scheduler from '@/components/pages/Scheduler';
import WorkflowRules from '@/components/pages/WorkflowRules';
import Monetization from '@/components/pages/Monetization';
import BackupRestore from '@/components/pages/BackupRestore';
import DeveloperConsole from '@/components/pages/DeveloperConsole';
import Profiles from '@/components/pages/Profiles';
import Analytics from '@/components/pages/Analytics';
import AIAssistant from '@/components/pages/AIAssistant';
import Tutorial from '@/components/pages/Tutorial';
import CloudStorage from '@/components/pages/CloudStorage';
import Security from '@/components/pages/Security';
import IoTDevices from '@/components/pages/IoTDevices';
import CodeModifications from '@/components/pages/CodeModifications';
import EmailMarketing from '@/components/pages/EmailMarketing';
import CompetitorRadar from '@/components/pages/CompetitorRadar';
import CollabFinder from '@/components/pages/CollabFinder';
import BrandMarketplace from '@/components/pages/BrandMarketplace';
import SmartVideoEditor from '@/components/pages/SmartVideoEditor';
import FloatingButtons from '@/components/FloatingButtons';
import EnhancedAIAssistantModal from '@/components/EnhancedAIAssistantModal';
import { JarvisOnboarding } from '@/components/JarvisOnboarding';
import LoginScreen from '@/components/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [currentPage, setCurrentPage] = useState('overview-dashboard');
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  const checkOnboarding = useCallback(async () => {
    try {
      const completed = await AsyncStorage.getItem('jarvis-onboarding-completed');
      if (!completed) {
        setTimeout(() => setShowOnboarding(true), 1000);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await AsyncStorage.getItem('authenticated');
      if (!authenticated) {
        setShowLoginScreen(true);
      } else {
        checkOnboarding();
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setShowLoginScreen(true);
    }
  }, [checkOnboarding]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLoginSuccess = async () => {
    setShowLoginScreen(false);
    checkOnboarding();
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const { pageTitle, sectionTitle } = useMemo(() => {
    const pageMap: Record<string, { title: string; section: string }> = {
      'overview-dashboard': { title: 'AI Influencer', section: 'Overview / Dashboard' },
      'overview-logs': { title: 'AI Influencer', section: 'Overview / System Logs' },
      'overview-validator': { title: 'AI Influencer', section: 'Overview / Validator' },
      'ai-content-engine': { title: 'AI Influencer', section: 'AI Modules / Content Engine' },
      'ai-trend-analysis': { title: 'AI Influencer', section: 'AI Modules / Trend Analysis' },
      'ai-persona-builder': { title: 'AI Influencer', section: 'AI Modules / Persona Builder' },
      'ai-media-generator': { title: 'AI Influencer', section: 'AI Modules / Media Generator' },
      'ai-media-studio': { title: 'AI Influencer', section: 'AI Modules / Media Studio' },
      'integrations-api-keys': { title: 'AI Influencer', section: 'Integrations / API Keys' },
      'integrations-social-connect': { title: 'AI Influencer', section: 'Integrations / Social Connect' },
      'integrations-data-sources': { title: 'AI Influencer', section: 'Integrations / Data Sources' },
      'automation-scheduler': { title: 'AI Influencer', section: 'Automation / Scheduler' },
      'automation-workflow-rules': { title: 'AI Influencer', section: 'Automation / Workflow Rules' },
      'monetization': { title: 'AI Influencer', section: 'Monetization / Dashboard' },
      'tools-backup-restore': { title: 'AI Influencer', section: 'Tools / Backup & Restore' },
      'tools-developer-console': { title: 'AI Influencer', section: 'Tools / Developer Console' },
      'profiles': { title: 'AI Influencer', section: 'Profiles / Management' },
      'analytics': { title: 'AI Influencer', section: 'Analytics / Dashboard' },
      'ai-assistant': { title: 'AI Influencer', section: 'AI Assistant / Chat' },
      'tutorial': { title: 'AI Influencer', section: 'Tutorial / Guide' },
      'tools-cloud-storage': { title: 'AI Influencer', section: 'Tools / Cloud Storage' },
      'tools-security': { title: 'AI Influencer', section: 'Tools / Security' },
      'tools-iot-devices': { title: 'AI Influencer', section: 'Tools / IoT Devices' },
      'tools-code-modifications': { title: 'AI Influencer', section: 'Tools / Code Modifications' },
      'growth-email-marketing': { title: 'AI Influencer', section: 'Growth / Email Marketing' },
      'growth-competitor-radar': { title: 'AI Influencer', section: 'Growth / Competitor Radar' },
      'growth-collab-finder': { title: 'AI Influencer', section: 'Growth / Collab Finder' },
      'growth-brand-marketplace': { title: 'AI Influencer', section: 'Growth / Brand Marketplace' },
      'ai-video-editor': { title: 'AI Influencer', section: 'AI Modules / Smart Video Editor' },
    };

    const info = pageMap[currentPage] || { title: 'AI Influencer', section: 'Dashboard' };
    return { pageTitle: info.title, sectionTitle: info.section };
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'overview-dashboard':
        return <OverviewDashboard />;
      case 'overview-logs':
        return <SystemLogs />;
      case 'overview-validator':
        return <Validator />;
      case 'ai-content-engine':
        return <ContentEngine />;
      case 'ai-trend-analysis':
        return <TrendAnalysis />;
      case 'ai-persona-builder':
        return <PersonaBuilder />;
      case 'ai-media-generator':
        return <MediaGenerator />;
      case 'ai-media-studio':
        return <MediaStudio />;
      case 'integrations-api-keys':
        return <APIKeys />;
      case 'integrations-social-connect':
        return <SocialConnect />;
      case 'integrations-data-sources':
        return <DataSources />;
      case 'automation-scheduler':
        return <Scheduler />;
      case 'automation-workflow-rules':
        return <WorkflowRules />;
      case 'monetization':
        return <Monetization />;
      case 'tools-backup-restore':
        return <BackupRestore />;
      case 'tools-developer-console':
        return <DeveloperConsole />;
      case 'profiles':
        return <Profiles />;
      case 'analytics':
        return <Analytics />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'tutorial':
        return <Tutorial />;
      case 'tools-cloud-storage':
        return <CloudStorage />;
      case 'tools-security':
        return <Security />;
      case 'tools-iot-devices':
        return <IoTDevices />;
      case 'tools-code-modifications':
        return <CodeModifications />;
      case 'growth-email-marketing':
        return <EmailMarketing />;
      case 'growth-competitor-radar':
        return <CompetitorRadar />;
      case 'growth-collab-finder':
        return <CollabFinder />;
      case 'growth-brand-marketplace':
        return <BrandMarketplace />;
      case 'ai-video-editor':
        return <SmartVideoEditor />;
      default:
        return <OverviewDashboard />;
    }
  };

  if (showLoginScreen) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.safeArea}>
        <Header
          title={pageTitle}
          section={sectionTitle}
        />
        <View style={styles.content}>
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <View style={styles.pageContainer}>{renderPage()}</View>
        </View>
        <FloatingButtons
          onChatPress={() => {}} 
          onBrainPress={() => setShowAIModal(true)}
        />
        <EnhancedAIAssistantModal
          visible={showAIModal}
          onClose={() => setShowAIModal(false)}
        />
        <JarvisOnboarding
          visible={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  pageContainer: {
    flex: 1,
  },

});
