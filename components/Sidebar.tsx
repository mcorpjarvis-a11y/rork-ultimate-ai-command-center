import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { IronManTheme } from '@/constants/colors';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Sparkles,
  Zap,
  Users,
  Image as ImageIcon,
  Video,
  Link,
  Calendar,
  Workflow,
  DollarSign,
  Wrench,
  User,
  BarChart3,
  MessageCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Shield,
  Cpu,
  Code,
  Mail,
  TrendingUp,
  Handshake,
  Store,
  Scissors,
} from 'lucide-react-native';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    submenu: [
      { id: 'overview-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'overview-logs', label: 'System Logs', icon: FileText },
      { id: 'overview-validator', label: 'Validator', icon: CheckSquare },
    ],
  },
  {
    id: 'ai-modules',
    label: 'AI Modules',
    icon: Sparkles,
    submenu: [
      { id: 'ai-content-engine', label: 'Content Engine', icon: Sparkles },
      { id: 'ai-trend-analysis', label: 'Trend Analysis', icon: BarChart3 },
      { id: 'ai-persona-builder', label: 'Persona Builder', icon: Users },
      { id: 'ai-media-generator', label: 'Media Generator', icon: ImageIcon },
      { id: 'ai-media-studio', label: 'Media Studio', icon: Video },
      { id: 'ai-video-editor', label: 'Smart Video Editor', icon: Scissors },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Link,
    submenu: [
      { id: 'integrations-api-keys', label: 'API Keys', icon: Link },
      { id: 'integrations-social-connect', label: 'Social Connect', icon: Users },
      { id: 'integrations-data-sources', label: 'Data Sources', icon: FileText },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Zap,
    submenu: [
      { id: 'automation-scheduler', label: 'Scheduler', icon: Calendar },
      { id: 'automation-workflow-rules', label: 'Workflow Rules', icon: Workflow },
    ],
  },
  {
    id: 'growth',
    label: 'Growth',
    icon: TrendingUp,
    submenu: [
      { id: 'growth-email-marketing', label: 'Email Marketing', icon: Mail },
      { id: 'growth-competitor-radar', label: 'Competitor Radar', icon: TrendingUp },
      { id: 'growth-collab-finder', label: 'Collab Finder', icon: Handshake },
      { id: 'growth-brand-marketplace', label: 'Brand Marketplace', icon: Store },
    ],
  },
  { id: 'monetization', label: 'Monetization', icon: DollarSign },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    submenu: [
      { id: 'tools-backup-restore', label: 'Backup / Restore', icon: FileText },
      { id: 'tools-developer-console', label: 'Developer Console', icon: Wrench },
      { id: 'tools-cloud-storage', label: 'Cloud Storage', icon: Cloud },
      { id: 'tools-security', label: 'Security', icon: Shield },
      { id: 'tools-iot-devices', label: 'IoT Devices', icon: Cpu },
      { id: 'tools-code-modifications', label: 'Code Modifications', icon: Code },
    ],
  },
  { id: 'profiles', label: 'Profiles', icon: User },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ai-assistant', label: 'AI Assistant', icon: MessageCircle },
  { id: 'tutorial', label: 'Tutorial', icon: BookOpen },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  expandedSections: string[];
  onToggleSection: (section: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  expandedSections,
  onToggleSection,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedSections.includes(item.id);
    const isActive = currentPage === item.id;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[
            styles.menuItem,
            level > 0 && styles.submenuItem,
            isActive && level === 0 && styles.activeMenuItem,
            isActive && level > 0 && styles.activeSubmenuItem,
          ]}
          onPress={() => {
            if (hasSubmenu) {
              onToggleSection(item.id);
            } else {
              onNavigate(item.id);
            }
          }}
          testID={`menu-item-${item.id}`}
        >
          <View style={styles.menuItemContent}>
            {level > 0 && <View style={styles.submenuIndent} />}
            <item.icon
              color={isActive ? IronManTheme.secondary : level > 0 ? IronManTheme.textSecondary : IronManTheme.textMuted}
              size={level > 0 ? 18 : 20}
            />
            <Text
              style={[
                styles.menuItemText,
                level > 0 && styles.submenuItemText,
                isActive && styles.activeMenuItemText,
              ]}
            >
              {item.label}
            </Text>
          </View>
        </TouchableOpacity>

        {hasSubmenu && isExpanded && (
          <View>
            {item.submenu!.map((subItem) => renderMenuItem(subItem, level + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <LinearGradient
        colors={[IronManTheme.glow.red, 'rgba(0, 0, 0, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {onToggleCollapse && (
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={onToggleCollapse}
          testID="collapse-button"
        >
          {collapsed ? (
            <ChevronRight color={IronManTheme.accent} size={20} />
          ) : (
            <ChevronLeft color={IronManTheme.accent} size={20} />
          )}
        </TouchableOpacity>
      )}
      <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
        {collapsed ? (
          menuItems.map((item) => {
            if (item.submenu) {
              return item.submenu.map((subItem) => (
                <TouchableOpacity
                  key={subItem.id}
                  style={[
                    styles.collapsedMenuItem,
                    currentPage === subItem.id && styles.collapsedMenuItemActive,
                  ]}
                  onPress={() => onNavigate(subItem.id)}
                  testID={`menu-item-${subItem.id}`}
                >
                  <subItem.icon
                    color={currentPage === subItem.id ? IronManTheme.secondary : IronManTheme.textMuted}
                    size={20}
                  />
                </TouchableOpacity>
              ));
            }
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.collapsedMenuItem,
                  currentPage === item.id && styles.collapsedMenuItemActive,
                ]}
                onPress={() => onNavigate(item.id)}
                testID={`menu-item-${item.id}`}
              >
                <item.icon
                  color={currentPage === item.id ? IronManTheme.secondary : IronManTheme.textMuted}
                  size={20}
                />
              </TouchableOpacity>
            );
          })
        ) : (
          menuItems.map((item) => renderMenuItem(item))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: IronManTheme.background,
    borderRightWidth: 2,
    borderRightColor: IronManTheme.primary,
    position: 'relative' as const,
  },
  sidebarCollapsed: {
    width: 70,
  },
  gradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.05,
  },
  collapseButton: {
    position: 'absolute' as const,
    top: 12,
    right: 8,
    zIndex: 10,
    padding: 8,
    backgroundColor: IronManTheme.surface,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: IronManTheme.accent,
  },
  collapsedMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  collapsedMenuItemActive: {
    backgroundColor: IronManTheme.glow.gold,
    borderLeftWidth: 3,
    borderLeftColor: IronManTheme.secondary,
  },
  menuList: {
    paddingVertical: 8,
    zIndex: 1,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  submenuItem: {
    paddingVertical: 12,
    paddingLeft: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submenuIndent: {
    width: 16,
  },
  menuItemText: {
    fontSize: 15,
    color: IronManTheme.textMuted,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  submenuItemText: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    fontWeight: '500' as const,
  },
  activeMenuItem: {
    backgroundColor: IronManTheme.glow.gold,
    borderLeftWidth: 4,
    borderLeftColor: IronManTheme.secondary,
  },
  activeSubmenuItem: {
    backgroundColor: IronManTheme.glow.red,
    borderLeftWidth: 3,
    borderLeftColor: IronManTheme.primary,
  },
  activeMenuItemText: {
    color: IronManTheme.secondary,
    fontWeight: '700' as const,
  },
});
