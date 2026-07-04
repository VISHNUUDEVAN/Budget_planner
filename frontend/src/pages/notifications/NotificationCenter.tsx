import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notificationsApi';
import { GlassCard } from '../../components/GlassCard';
import { Skeleton } from '../../components/Skeleton';
import { Bell, CheckCheck, ShieldAlert, Award, Info, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function NotificationCenter() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => notificationsApi.getNotifications(false),
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-12 w-64" />
        <Skeleton variant="rect" count={4} className="h-20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-danger-500 font-semibold glass-card">
        Failed to fetch notifications. Please try again.
      </div>
    );
  }

  const { notifications, unreadCount } = data;

  const getIcon = (type: string) => {
    if (type === 'warning') return <ShieldAlert className="w-5 h-5 text-danger-500" />;
    if (type === 'success') return <Award className="w-5 h-5 text-secondary-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getBadgeColor = (type: string) => {
    if (type === 'warning') return 'bg-danger-50 dark:bg-danger-950/20';
    if (type === 'success') return 'bg-secondary-50 dark:bg-secondary-950/20';
    return 'bg-blue-50 dark:bg-blue-950/20';
  };

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary-500" />
            <span>Notification Center</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep track of automated decision checks, thresholds, and financial warnings.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-xl hover:bg-primary-100/50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <GlassCard className="p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[250px]">
            <Bell className="w-12 h-12 stroke-[1.5] mb-2 opacity-50 text-slate-400" />
            <span className="text-sm font-semibold">No notifications to display.</span>
          </GlassCard>
        ) : (
          notifications.map((notif) => (
            <GlassCard
              key={notif.id}
              onClick={() => !notif.read && markReadMutation.mutate(notif.id)}
              className={cn(
                'p-5 flex items-start gap-4 transition-all duration-200 border-l-4',
                notif.read
                  ? 'opacity-75 border-l-slate-300 dark:border-l-slate-700'
                  : 'border-l-primary-500 hover:bg-slate-100/20 dark:hover:bg-slate-850/20 cursor-pointer'
              )}
            >
              {/* Type Icon indicator */}
              <div className={cn('p-2.5 rounded-xl flex-shrink-0', getBadgeColor(notif.type))}>
                {getIcon(notif.type)}
              </div>

              {/* Msg Content */}
              <div className="flex-1 space-y-1 min-w-0">
                <p className={cn('text-sm text-slate-800 dark:text-slate-200 leading-normal', !notif.read && 'font-bold')}>
                  {notif.message}
                </p>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Unread circle badge */}
              {!notif.read && (
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 self-center animate-pulse" />
              )}
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
export default NotificationCenter;
