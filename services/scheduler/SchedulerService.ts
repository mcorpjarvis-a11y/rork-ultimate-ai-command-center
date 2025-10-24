import ContentService from '@/services/content/ContentService';
import SocialMediaService from '@/services/social/SocialMediaService';
import MonitoringService from '@/services/monitoring/MonitoringService';
import { ScheduledPost } from '@/types/models.types';

interface SchedulerTask {
  id: string;
  execute: () => Promise<void>;
  scheduledFor: number;
  retries: number;
  maxRetries: number;
}

class SchedulerService {
  private tasks: Map<string, SchedulerTask>;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.tasks = new Map();
  }

  start(): void {
    if (this.isRunning) {
      console.log('[SchedulerService] Already running');
      return;
    }

    console.log('[SchedulerService] Starting scheduler...');
    this.isRunning = true;

    this.checkInterval = setInterval(() => {
      this.processPendingTasks();
    }, 60000);

    this.processPendingTasks();
  }

  stop(): void {
    console.log('[SchedulerService] Stopping scheduler...');
    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async processPendingTasks(): Promise<void> {
    if (!this.isRunning) return;

    const now = Date.now();
    const pendingPosts = ContentService.getPendingPosts();

    console.log(`[SchedulerService] Processing ${pendingPosts.length} pending posts`);

    for (const post of pendingPosts) {
      if (post.scheduledFor <= now) {
        await this.executeScheduledPost(post);
      }
    }

    const pendingTasks = Array.from(this.tasks.values()).filter(
      task => task.scheduledFor <= now
    );

    for (const task of pendingTasks) {
      await this.executeTask(task);
    }
  }

  private async executeScheduledPost(post: ScheduledPost): Promise<void> {
    console.log(`[SchedulerService] Executing scheduled post: ${post.id}`);

    try {
      const content = await ContentService.getContent(post.contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      for (const platform of post.platforms) {
        const accounts = SocialMediaService.getAccountsByPlatform(platform);
        if (accounts.length === 0) {
          MonitoringService.warn(
            'SchedulerService',
            `No accounts found for platform: ${platform}`,
            { postId: post.id }
          );
          continue;
        }

        for (const account of accounts) {
          try {
            const variation = post.variations[platform];
            await SocialMediaService.post(account.id, {
              content: variation.content,
              mediaUrls: variation.mediaUrls,
              hashtags: variation.hashtags,
              mentions: variation.mentions,
              autoOptimize: post.autoOptimize,
            });

            MonitoringService.info(
              'SchedulerService',
              `Posted to ${platform} successfully`,
              { postId: post.id, accountId: account.id }
            );
          } catch (error: any) {
            MonitoringService.error(
              'SchedulerService',
              `Failed to post to ${platform}`,
              { postId: post.id, accountId: account.id, error: error.message }
            );
          }
        }
      }

      post.status = 'published';
      await ContentService.updateContent(content.id, {
        status: 'published',
        publishedAt: Date.now(),
      });

      MonitoringService.info(
        'SchedulerService',
        'Scheduled post executed successfully',
        { postId: post.id }
      );
    } catch (error: any) {
      post.retryAttempts++;

      if (post.retryAttempts < 3) {
        post.scheduledFor = Date.now() + 5 * 60 * 1000;
        MonitoringService.warn(
          'SchedulerService',
          'Scheduled post failed, retrying',
          { postId: post.id, attempt: post.retryAttempts, error: error.message }
        );
      } else {
        post.status = 'failed';
        MonitoringService.error(
          'SchedulerService',
          'Scheduled post failed after max retries',
          { postId: post.id, error: error.message }
        );
      }
    }
  }

  private async executeTask(task: SchedulerTask): Promise<void> {
    console.log(`[SchedulerService] Executing task: ${task.id}`);

    try {
      await task.execute();
      this.tasks.delete(task.id);
      MonitoringService.info('SchedulerService', 'Task executed successfully', { taskId: task.id });
    } catch (error: any) {
      task.retries++;

      if (task.retries < task.maxRetries) {
        task.scheduledFor = Date.now() + 5 * 60 * 1000;
        MonitoringService.warn(
          'SchedulerService',
          'Task failed, retrying',
          { taskId: task.id, attempt: task.retries, error: error.message }
        );
      } else {
        this.tasks.delete(task.id);
        MonitoringService.error(
          'SchedulerService',
          'Task failed after max retries',
          { taskId: task.id, error: error.message }
        );
      }
    }
  }

  scheduleTask(
    id: string,
    execute: () => Promise<void>,
    scheduledFor: number,
    maxRetries: number = 3
  ): void {
    const task: SchedulerTask = {
      id,
      execute,
      scheduledFor,
      retries: 0,
      maxRetries,
    };

    this.tasks.set(id, task);
    console.log(`[SchedulerService] Task scheduled: ${id} for ${new Date(scheduledFor).toISOString()}`);
  }

  cancelTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      console.log(`[SchedulerService] Task cancelled: ${id}`);
    }
    return deleted;
  }

  getScheduledTasks(): SchedulerTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => a.scheduledFor - b.scheduledFor);
  }

  getUpcomingTasks(limit: number = 10): SchedulerTask[] {
    return this.getScheduledTasks().slice(0, limit);
  }

  isTaskScheduled(id: string): boolean {
    return this.tasks.has(id);
  }

  getTaskCount(): number {
    return this.tasks.size;
  }
}

export default new SchedulerService();
