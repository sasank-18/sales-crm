'use client';

import React, { useState } from 'react';
import { useCRM, Deal } from '@/context/CRMContext';
import { TrendingUp, DollarSign, BarChart2, Filter } from 'lucide-react';
import styles from './page.module.css';

export default function AnalyticsDashboard() {
  const { deals } = useCRM();

  // Interactive Forecast State
  const [probabilityThreshold, setProbabilityThreshold] = useState(0);

  // --- TOP STATS CALCULATIONS ---

  // Filter active deals based on probability threshold
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const filteredActiveDeals = activeDeals.filter(d => d.probability >= probabilityThreshold);
  
  // 1. Total Pipeline Value (Filtered)
  const pipelineValue = filteredActiveDeals.reduce((sum, d) => sum + d.value, 0);

  // 2. Expected (Weighted) Revenue (Filtered)
  const expectedRevenue = filteredActiveDeals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);

  // 3. Average Deal Size (All deals satisfying threshold)
  const filteredAllDeals = deals.filter(d => d.stage === 'Won' || d.stage === 'Lost' || d.probability >= probabilityThreshold);
  const allDealsCount = filteredAllDeals.length;
  const totalValue = filteredAllDeals.reduce((sum, d) => sum + d.value, 0);
  const avgDealSize = allDealsCount > 0 ? Math.round(totalValue / allDealsCount) : 0;

  // 4. Closed-Won Value (Unfiltered, represents static closed goals)
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  // --- FUNNEL STAGE CALCULATIONS ---
  // A deal qualifies for the funnel if it's Won or satisfies the probability threshold
  const filteredDealsForFunnel = deals.filter(d => {
    if (d.stage === 'Lost') return false;
    if (d.stage === 'Won') return true; // Won deals are 100% and always included
    return d.probability >= probabilityThreshold;
  });

  const getStageCumulativeCount = (stage: Deal['stage']) => {
    const stageOrder: Deal['stage'][] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
    const targetIdx = stageOrder.indexOf(stage);
    
    if (targetIdx === -1) return 0;

    return filteredDealsForFunnel.filter(d => {
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
    { name: 'Leads Qualified', count: leadCount, percent: getPercentage(leadCount), color: '#3b82f6' },
    { name: 'Qualified Stage', count: qualifiedCount, percent: getPercentage(qualifiedCount), color: '#6366f1' },
    { name: 'Proposal Offered', count: proposalCount, percent: getPercentage(proposalCount), color: '#a855f7' },
    { name: 'Negotiation', count: negotiationCount, percent: getPercentage(negotiationCount), color: '#ec4899' },
    { name: 'Deals Won', count: wonCount, percent: getPercentage(wonCount), color: '#10b981' },
  ];

  // --- REPRESENTATIVE LEADERBOARD CALCULATIONS ---
  const representatives = ['Alex Mercer', 'Sarah Chen', 'Marcus Vance'];

  const repLeaderboard = representatives.map(repName => {
    const repDeals = deals.filter(d => d.owner === repName);
    const repWonDeals = repDeals.filter(d => d.stage === 'Won');
    const repLostDeals = repDeals.filter(d => d.stage === 'Lost');
    
    const wonValue = repWonDeals.reduce((sum, d) => sum + d.value, 0);
    // Active deals satisfying probability filter
    const activeDealsCount = repDeals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost' && d.probability >= probabilityThreshold).length;
    
    const closedCount = repWonDeals.length + repLostDeals.length;
    const winRate = closedCount > 0 ? Math.round((repWonDeals.length / closedCount) * 100) : 0;

    return {
      name: repName,
      wonValue,
      activeDealsCount,
      winRate
    };
  }).sort((a, b) => b.wonValue - a.wonValue);

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

      {/* Dynamic Forecast Slider */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} />
            AI Forecast Probability Filter
          </span>
          <span style={{ fontWeight: 700, color: 'var(--clr-cyan)', fontFamily: 'Outfit' }}>
            Deals with Probability &ge; {probabilityThreshold}%
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="range" 
            min="0" 
            max="90" 
            step="10" 
            value={probabilityThreshold}
            onChange={(e) => setProbabilityThreshold(Number(e.target.value))}
            style={{ flex: 1, height: '4px', cursor: 'pointer', accentColor: 'var(--clr-cyan)' }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
            {probabilityThreshold}%
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Adjust slider to exclude deals with lower success ratings. Recalculates funnel drop-offs and revenue pipelines instantly.
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
              Across {allDealsCount} qualifying deals
            </p>
          </div>
        </div>

        {/* Total Pipeline */}
        <div className="glass-panel col-span-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Open Pipeline Value</span>
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
                    <span>Active filtered: <strong>{rep.activeDealsCount}</strong></span>
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
