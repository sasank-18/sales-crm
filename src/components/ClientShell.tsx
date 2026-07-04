'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '@/context/CRMContext';
import { 
  Search, 
  Bell, 
  Sparkles, 
  X, 
  Home, 
  Columns, 
  Users, 
  BarChart3, 
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import Sidebar from './Sidebar';
import styles from '../app/layout.module.css';

interface NotificationItem {
  id: string;
  text: string;
  time: string;
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // States
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Mock notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      text: 'AI Alert: Stark Industries "Grid Integration" deal closed Won (+$750,000)!',
      time: '10 mins ago'
    },
    {
      id: 'n2',
      text: 'Risk Alert: Sarah Connor (Cyberdyne) has been inactive for 6 days.',
      time: '1 hour ago'
    },
    {
      id: 'n3',
      text: 'Meeting Scheduled: Project walkthrough with Eldon Tyrell at 4:30 PM.',
      time: '3 hours ago'
    }
  ]);

  const spotlightRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Spotlight Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsSpotlightOpen(false);
    setSpotlightQuery('');
  };

  const handleClearNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  // Commands filtered by search query
  const commands = [
    { label: 'Go to Dashboard', shortcut: 'G + D', action: () => handleNavigate('/'), icon: Home },
    { label: 'Go to Deals Board', shortcut: 'G + P', action: () => handleNavigate('/pipeline'), icon: Columns },
    { label: 'Go to Contacts Database', shortcut: 'G + C', action: () => handleNavigate('/contacts'), icon: Users },
    { label: 'Go to Analytics Ledger', shortcut: 'G + A', action: () => handleNavigate('/analytics'), icon: BarChart3 },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(spotlightQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Sidebar />
      
      <main className={styles.main}>
        {/* Global Top Header Bar */}
        <div className={styles.globalHeader}>
          {/* Spotlight triggering search bar */}
          <div className={styles.searchBarWrapper} onClick={() => setIsSpotlightOpen(true)}>
            <Search size={16} className={styles.searchIcon} />
            <div className={styles.searchInputFake}>
              <span>Search dashboard (Cmd + K)</span>
              <div className={styles.keycaps}>
                <kbd className={styles.keycap}>⌘</kbd>
                <kbd className={styles.keycap}>K</kbd>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            {/* Notifications drop menu */}
            <div className={styles.notificationWrapper} ref={notifRef}>
              <button className={styles.bellBtn} onClick={() => setIsNotifOpen(!isNotifOpen)}>
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className={styles.bellBadgePulse} />
                )}
              </button>

              {isNotifOpen && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifHeader}>
                    <span className={styles.notifTitle}>Notifications</span>
                    {notifications.length > 0 && (
                      <button className={styles.clearAllBtn} onClick={handleClearAllNotifs}>
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className={styles.notifList}>
                    {notifications.map((n) => (
                      <div key={n.id} className={styles.notifItem}>
                        <button className={styles.notifDismiss} onClick={(e) => handleClearNotif(n.id, e)}>
                          <X size={10} />
                        </button>
                        <div className={styles.notifDot} />
                        <div className={styles.notifContent}>
                          <span className={styles.notifText}>{n.text}</span>
                          <span className={styles.notifTime}>{n.time}</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '16px 0' }}>
                        All caught up! No notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        {children}
      </main>

      {/* --- SPOTLIGHT COMMAND PALETTE OVERLAY --- */}
      {isSpotlightOpen && (
        <div className={styles.spotlightOverlay} onClick={() => setIsSpotlightOpen(false)}>
          <div 
            className={styles.spotlightCard} 
            ref={spotlightRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.spotlightInputWrapper}>
              <Search size={18} style={{ color: 'var(--clr-cyan)' }} />
              <input 
                type="text" 
                placeholder="Type a command or search page..." 
                className={styles.spotlightInput}
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
                autoFocus
              />
              <button 
                className={styles.closeBtn} 
                style={{ padding: 0 }}
                onClick={() => setIsSpotlightOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.spotlightBody}>
              <div className={styles.spotlightSection}>
                <span className={styles.spotlightSecTitle}>Quick Navigation Commands</span>
                {filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <div 
                      key={cmd.label} 
                      className={styles.spotlightItem}
                      onClick={cmd.action}
                    >
                      <span className={styles.itemLabel}>
                        <Icon size={16} />
                        {cmd.label}
                      </span>
                      <span className={styles.itemShortcut}>{cmd.shortcut}</span>
                    </div>
                  );
                })}

                {filteredCommands.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '8px 12px' }}>
                    No commands match "{spotlightQuery}"
                  </div>
                )}
              </div>
            </div>

            <div className={styles.spotlightFooter}>
              <span>Navigate with <kbd>↑</kbd><kbd>↓</kbd> and <kbd>Enter</kbd></span>
              <span><kbd>ESC</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
