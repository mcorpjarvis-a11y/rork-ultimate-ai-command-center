import { useEffect, useRef } from 'react';
import {
  AIService,
  SocialMediaService,
  ContentService,
  AnalyticsService,
  TrendService,
  WorkflowService,
  UserService,
  MonitoringService,
  SchedulerService,
  WebSocketService,
} from '@/services';

export function useAIService() {
  return AIService;
}

export function useSocialMediaService() {
  return SocialMediaService;
}

export function useContentService() {
  return ContentService;
}

export function useAnalyticsService() {
  return AnalyticsService;
}

export function useTrendService() {
  return TrendService;
}

export function useWorkflowService() {
  return WorkflowService;
}

export function useUserService() {
  return UserService;
}

export function useMonitoringService() {
  return MonitoringService;
}

export function useSchedulerService() {
  return SchedulerService;
}

export function useWebSocketService() {
  return WebSocketService;
}

export function useScheduler() {
  const schedulerStarted = useRef(false);

  useEffect(() => {
    if (!schedulerStarted.current) {
      SchedulerService.start();
      schedulerStarted.current = true;
    }

    return () => {
      if (schedulerStarted.current) {
        SchedulerService.stop();
        schedulerStarted.current = false;
      }
    };
  }, []);

  return SchedulerService;
}

export function useWebSocket(token?: string) {
  const wsConnected = useRef(false);

  useEffect(() => {
    if (!wsConnected.current) {
      WebSocketService.connect(token).then(() => {
        wsConnected.current = true;
      }).catch(error => {
        console.error('WebSocket connection failed:', error);
      });
    }

    return () => {
      if (wsConnected.current) {
        WebSocketService.disconnect();
        wsConnected.current = false;
      }
    };
  }, [token]);

  return WebSocketService;
}

export function useSystemMonitoring(category?: string) {
  const unsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    const id = category || 'global';
    unsubscribe.current = MonitoringService.subscribe(id, (log) => {
      if (category && log.category !== category) return;
    });

    return () => {
      if (unsubscribe.current) {
        unsubscribe.current();
      }
    };
  }, [category]);

  return MonitoringService;
}
