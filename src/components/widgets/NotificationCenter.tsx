"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bell, X, CheckCircle2, AlertTriangle, Info, CreditCard, Calendar, TrendingUp, Shield } from "lucide-react";
import { useAppStore } from "@/state/app-store";
import { formatCurrency } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const creditCards = useAppStore((s) => s.creditCards);
  const calendarEvents = useAppStore((s) => s.calendarEvents);
  const transactions = useAppStore((s) => s.transactions);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const loans = useAppStore((s) => s.loans);

  // Generate notifications based on data
  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Credit card due dates
    creditCards.forEach(card => {
      if (card.billDueDate) {
        const dueDate = new Date(card.billDueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7 && daysUntilDue >= 0) {
          newNotifications.push({
            id: `card-due-${card.id}`,
            type: daysUntilDue <= 3 ? 'alert' : 'warning',
            title: `Credit Card Payment Due`,
            message: `${card.brand} •••• ${card.last4} payment of ${card.billAmount ? formatCurrency(card.billAmount) : 'N/A'} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
            timestamp: new Date(),
            read: false,
            actionUrl: '/cards',
            actionLabel: 'View Card'
          });
        }
      }
    });

    // Upcoming bills
    const upcomingBills = calendarEvents
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    upcomingBills.forEach(bill => {
      const daysUntil = Math.ceil((new Date(bill.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        newNotifications.push({
          id: `bill-${bill.id}`,
          type: daysUntil <= 2 ? 'alert' : 'info',
          title: `Upcoming Bill`,
          message: `${bill.title} of ${bill.amount ? formatCurrency(bill.amount) : 'N/A'} due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          timestamp: new Date(bill.date),
          read: false,
          actionUrl: '/calendar',
          actionLabel: 'View Calendar'
        });
      }
    });

    // High credit utilization
    creditCards.forEach(card => {
      const utilization = card.limit > 0 ? (card.balance / card.limit) * 100 : 0;
      if (utilization > 80) {
        newNotifications.push({
          id: `utilization-${card.id}`,
          type: 'warning',
          title: `High Credit Utilization`,
          message: `${card.brand} •••• ${card.last4} is at ${utilization.toFixed(0)}% utilization`,
          timestamp: new Date(),
          read: false,
          actionUrl: '/cards',
          actionLabel: 'Manage Cards'
        });
      }
    });

    // Subscription renewals
    subscriptions.forEach(sub => {
      const nextCharge = new Date(sub.nextChargeDate);
      const daysUntil = Math.ceil((nextCharge.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 3 && daysUntil >= 0) {
        newNotifications.push({
          id: `subscription-${sub.id}`,
          type: 'info',
          title: `Subscription Renewal`,
          message: `${sub.name} will charge ${formatCurrency(sub.amount)} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          timestamp: nextCharge,
          read: false,
          actionUrl: '/subscriptions',
          actionLabel: 'View Subscriptions'
        });
      }
    });

    // Loan payment reminders
    loans.forEach(loan => {
      // Check if payment is overdue (simplified - assumes monthly payments)
      newNotifications.push({
        id: `loan-${loan.id}`,
        type: 'info',
        title: `Loan Payment`,
        message: `${loan.name} - Monthly payment of ${formatCurrency(loan.monthlyPayment)} due`,
        timestamp: new Date(),
        read: false,
        actionUrl: '/debt',
        actionLabel: 'View Loans'
      });
    });

    // Sort by timestamp (newest first)
    newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setNotifications(prev => {
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(prev.map(n => n.id));
      const toAdd = newNotifications.filter(n => !existingIds.has(n.id));
      return [...toAdd, ...prev].slice(0, 50); // Keep last 50
    });
  }, [creditCards, calendarEvents, subscriptions, loans]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      default:
        return <Info className="h-5 w-5 text-cyan-400" />;
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed right-4 top-16 z-50 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
            >
              <Card className="border-0 bg-transparent">
                <CardHeader className="border-b border-white/5 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-white">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-1 hover:bg-white/10"
                      >
                        <X className="h-4 w-4 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-zinc-500">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 transition-colors hover:bg-white/5 ${
                              !notification.read ? 'bg-cyan-500/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 shrink-0">
                                {getIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm font-medium text-white">
                                        {notification.title}
                                      </h4>
                                      {!notification.read && (
                                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                                      )}
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-400">
                                      {notification.message}
                                    </p>
                                    <div className="mt-2 flex items-center gap-3">
                                      <span className="text-[10px] text-zinc-500">
                                        {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {notification.actionUrl && (
                                        <a
                                          href={notification.actionUrl}
                                          className="text-[10px] text-cyan-400 hover:text-cyan-300"
                                          onClick={() => {
                                            markAsRead(notification.id);
                                            setIsOpen(false);
                                          }}
                                        >
                                          {notification.actionLabel || 'View'}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {!notification.read && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="rounded-full p-1 hover:bg-white/10"
                                        title="Mark as read"
                                      >
                                        <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="rounded-full p-1 hover:bg-white/10"
                                      title="Delete"
                                    >
                                      <X className="h-4 w-4 text-zinc-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
