'use client';

import React from 'react';
import { useCRM, Deal } from '@/context/CRMContext';
import { TrendingUp, DollarSign, Target, BarChart2, Award } from 'lucide-react';
import styles from './page.module.css';

export default function AnalyticsDashboard() {
  const { deals } = useCRM();

  // --- TOP STATS CALCULATIONS ---

  // 1. Total Pipeline Value
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);

  // 2. Expected (Weighted) Revenue
  // Sum of (Deal Value * Probability)
  const expectedRevenue = activeDeals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);

  // 3. Average Deal Size
  const allDealsCount = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const avgDealSize = allDealsCount > 0 ? Math.round(totalValue / allDealsCount) : 0;

  // 4. Closed-Won Value
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  // --- FUNNEL STAGE CALCULATIONS ---
  // A deal is assumed to have progressed through all stages up to its current stage
  // Lead -> Qualified -> Proposal -> Negotiation -> Won
  const getStageCumulativeCount = (stage: Deal['stage']) => {
    const stageOrder: Deal['stage'][] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
    const targetIdx = stageOrder.indexOf(stage);
    
    if (targetIdx === -1) return 0;

    // A deal counts for a stage if its current stage index in stageOrder is >= targetIdx
    return deals.filter(d => {
      // Exclude lost deals from the successful progression funnel
      if (d.stage === 'Lost') return false;
      const currentIdx = stageOrder.indexOf(d.stage);
      return currentIdx >= targetIdx;
    }).length;
  };

  const leadCount = getStageCumulativeCount('Lead');
  const qualifiedCount = getStageCumulativeCount('Qualified');
  const proposalCount = getStageCumulativeCount('Proposal');
  const negotiationCount = getStageCumulativeCount('Negotiation');
  const wonCount = getStageCumulativeCount('Won');

  const getPercentage = (count: number) => {
    return leadCount > 0 ? Math.round((count / leadCount) * 100) : 0;
  };

  const funnelStages = [
    { name: 'Leads Created', count: leadCount, percent: getPercentage(leadCount), color: '#3b82f6' },
    { name: 'Qualified Stage', count: qualifiedCount, percent: getPercentage(qualifiedCount), color: '#6366f1' },
    { name: 'Proposal Offered', count: proposalCount, percent: getPercentage(proposalCount), color: '#a855f7' },
    { name: 'Negotiation', count: negotiationCount, percent: getPercentage(negotiationCount), color: '#ec4899' },
    { name: 'Deals Won', count: wonCount, percent: getPercentage(wonCount), color: '#10b981' },
  ];

  // --- REPRESENTATIVE LEADERBOARD CALCULATIONS ---
  // Identify unique reps in the system
  const representatives = ['Alex Mercer', 'Sarah Chen', 'Marcus Vance'];

  const repLeaderboard = representatives.map(repName => {
    const repDeals = deals.filter(d => d.owner === repName);
    const repWonDeals = repDeals.filter(d => d.stage === 'Won');
    const repLostDeals = repDeals.filter(d => d.stage === 'Lost');
    
    const wonValue = repWonDeals.reduce((sum, d) => sum + d.value, 0);
    const activeDealsCount = repDeals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
    
    const closedCount = repWonDeals.length + repLostDeals.length;
    const winRate = closedCount > 0 ? Math.round((repWonDeals.length / closedCount) * 100) : 0;

    return {
      name: repName,
      wonValue,
      activeDealsCount,
      winRate
    };
  }).sort((a, b) => b.wonValue - a.wonValue); // Sort by won value descending

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Analytics & Funnel Performance</h2>
          <p>Real-time statistics, funnel conversion drop-offs, and sales team rankings.</p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className={styles.topStats}>
        {/* Expected Revenue */}
        <div className="glass-panel col-span-1 animate-fade-in">
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Weighted Pipeline</span>
            <div className={styles.statValue} style={{ color: 'var(--clr-cyan)' }}>
              ${Math.round(expectedRevenue).toLocaleString()}
            </div>
            <p className={styles.statSubtext}>
              Sum of (value × stage probability)
            </p>
          </div>
        </div>

        {/* Avg Deal Size */}
        <div className="glass-panel col-span-1 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Avg Deal Size</span>
            <div className={styles.statValue}>
              ${avgDealSize.toLocaleString()}
            </div>
            <p className={styles.statSubtext}>
              Across {allDealsCount} total registered deals
            </p>
          </div>
        </div>

        {/* Total Pipeline */}
        <div className="glass-panel col-span-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Open Value</span>
            <div className={styles.statValue}>
              ${pipelineValue.toLocaleString()}
            </div>
            <p className={styles.statSubtext}>
              Unweighted pipeline value of active deals
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Main Sections */}
      <div className={styles.bodyGrid}>
        {/* Conversion Funnel */}
        <div className={`glass-panel ${styles.card} animate-fade-in`} style={{ animationDelay: '0.15s' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Sales Funnel Conversion</h3>
            <p className={styles.cardSub}>Cumulative deal counts and percentage conversion rate from lead creation to close-won.</p>
          </div>

          <div className={styles.funnelList}>
            {funnelStages.map((stage, idx) => (
              <div key={stage.name} className={styles.funnelRow}>
                <span className={styles.funnelLabel}>{stage.name}</span>
                <span className={styles.funnelPercent}>{stage.percent}%</span>
                <div className={styles.funnelTrack}>
                  <div 
                    className={styles.funnelBar}
                    style={{ 
                      width: `${stage.percent}%`,
                      // Render a tapered effect: make lower parts of the funnel narrower/darker purple
                      background: `linear-gradient(90deg, var(--clr-blue) 0%, ${stage.color} 100%)`
                    }}
                  >
                    {stage.percent > 15 && (
                      <span className={styles.funnelBarText}>
                        {stage.count} {stage.count === 1 ? 'deal' : 'deals'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rep Leaderboard */}
        <div className={`glass-panel ${styles.card} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Sales Leaderboard</h3>
            <p className={styles.cardSub}>Sales directors ranked by closed-won deals.</p>
          </div>

          <div className={styles.leaderboardList}>
            {repLeaderboard.map((rep, idx) => (
              <div key={rep.name} className={styles.repCard}>
                <div className={`${styles.repRank} ${
                  idx === 0 ? styles.rank1 :
                  idx === 1 ? styles.rank2 :
                  styles.rank3
                }`}>
                  {idx + 1}
                </div>
                <div className={styles.avatar}>
                  {getInitials(rep.name)}
                </div>
                <div className={styles.repInfo}>
                  <span className={rep.name === 'Alex Mercer' ? `${styles.repName} gradient-text` : styles.repName}>
                    {rep.name}
                  </span>
                  <div className={styles.repStats}>
                    <span>Active: <strong>{rep.activeDealsCount}</strong></span>
                    <span>Win Rate: <strong>{rep.winRate}%</strong></span>
                  </div>
                </div>
                <div className={styles.repValue}>
                  <span className={styles.repValueAmount}>
                    ${rep.wonValue.toLocaleString()}
                  </span>
                  <span className={styles.repValueLabel}>Closed-Won</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
