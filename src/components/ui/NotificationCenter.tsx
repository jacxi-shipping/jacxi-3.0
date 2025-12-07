'use client';

import { useState } from 'react';
import { Bell, X, Check, Package, Ship, FileText, AlertCircle } from 'lucide-react';
import { IconButton, Badge, Drawer, Box, Typography, Divider } from '@mui/material';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Container Arrived',
    description: 'Container ABCU1234567 has arrived at destination port',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: '2',
    title: 'New Shipment Created',
    description: 'Shipment #12345 has been added to the system',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    icon: <Ship className="w-4 h-4" />,
  },
  {
    id: '3',
    title: 'Invoice Generated',
    description: 'Invoice INV-2025-001 is ready for review',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    icon: <FileText className="w-4 h-4" />,
  },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[var(--error)]" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--accent-gold)]" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          color: 'var(--text-secondary)',
          p: 1,
          '&:hover': {
            bgcolor: 'rgba(var(--border-rgb), 0.4)',
            color: 'var(--text-primary)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Bell className="w-5 h-5" />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            bgcolor: 'var(--panel)',
            color: 'var(--text-primary)',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
              {unreadCount} unread
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[var(--accent-gold)] hover:underline"
              >
                Mark all read
              </button>
            )}
            <IconButton onClick={() => setOpen(false)} size="small">
              <X className="w-5 h-5" />
            </IconButton>
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                textAlign: 'center',
              }}
            >
              <Bell className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-3" />
              <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <Box
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    bgcolor: notification.read ? 'transparent' : 'rgba(var(--accent-gold-rgb), 0.05)',
                    '&:hover': {
                      bgcolor: 'var(--background)',
                    },
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    >
                      {notification.icon || getNotificationIcon(notification.type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 2 }}>
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            fontWeight: notification.read ? 500 : 700,
                            color: 'var(--text-primary)',
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          sx={{ mt: -1 }}
                        >
                          <X className="w-4 h-4" />
                        </IconButton>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          mt: 0.5,
                        }}
                      >
                        {notification.description}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          mt: 1,
                        }}
                      >
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {index < notifications.length - 1 && <Divider sx={{ borderColor: 'var(--border)' }} />}
              </div>
            ))
          )}
        </Box>
      </Drawer>
    </>
  );
}
