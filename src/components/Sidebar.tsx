'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Columns, 
  Users, 
  BarChart3, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Deals Board', path: '/pipeline', icon: Columns },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <TrendingUp size={18} color="#000" strokeWidth={2.5} />
          </div>
          <h1 className={styles.logoText}>
            AETHER<span>CRM</span>
          </h1>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
              >
                <Icon className={styles.navIcon} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.userWidget}>
        <div className={styles.avatar}>AM</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Alex Mercer</span>
          <span className={styles.userRole}>Sales Director</span>
        </div>
      </div>
    </aside>
  );
}
