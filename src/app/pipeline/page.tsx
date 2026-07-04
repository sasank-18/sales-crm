'use client';

import React, { useState } from 'react';
import { useCRM, Deal } from '@/context/CRMContext';
import { Plus, X, Calendar, Download, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';

const STAGES: Deal['stage'][] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function PipelineBoard() {
  const { deals, moveDeal, addDeal } = useCRM();
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealCompany, setDealCompany] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [dealStage, setDealStage] = useState<Deal['stage']>('Lead');
  const [dealOwner, setDealOwner] = useState('Alex Mercer');
  const [dealCloseDate, setDealCloseDate] = useState('2026-08-31');

  // Group deals by stage
  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {} as Record<Deal['stage'], Deal[]>);

  // Stage calculations
  const getStageTotal = (stage: Deal['stage']) => {
    const stageDeals = dealsByStage[stage] || [];
    return stageDeals.reduce((sum, d) => sum + d.value, 0);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (stage: Deal['stage']) => {
    setDraggedOverCol(stage);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: Deal['stage']) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      moveDeal(dealId, targetStage);
    }
    setDraggedOverCol(null);
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle || !dealCompany || !dealValue) return;

    addDeal({
      title: dealTitle,
      company: dealCompany,
      value: Number(dealValue),
      stage: dealStage,
      probability: dealStage === 'Lead' ? 10 : dealStage === 'Qualified' ? 30 : dealStage === 'Proposal' ? 50 : dealStage === 'Negotiation' ? 80 : dealStage === 'Won' ? 100 : 0,
      owner: dealOwner,
      expectedCloseDate: dealCloseDate,
    });

    // Reset fields
    setDealTitle('');
    setDealCompany('');
    setDealValue('');
    setDealStage('Lead');
    setIsModalOpen(false);
  };

  // Deal Inactivity check (Current date is simulated to be 2026-07-04)
  const getDealInactivityDays = (lastActivityDate: string) => {
    const currentDate = new Date('2026-07-04');
    const activityDate = new Date(lastActivityDate);
    const diffTime = Math.abs(currentDate.getTime() - activityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Deals CSV Export
  const exportToCSV = () => {
    const headers = ['Deal Title', 'Company', 'Value', 'Stage', 'Probability (%)', 'Owner', 'Expected Close', 'Last Activity'];
    const rows = deals.map(d => [
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.company.replace(/"/g, '""')}"`,
      d.value,
      d.stage,
      d.probability,
      `"${d.owner}"`,
      d.expectedCloseDate,
      d.lastActivity
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'crm_pipeline_deals.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <h2>Deals Board</h2>
          <p>Drag and drop deals across stages to update their progress and probability.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={exportToCSV}
            title="Download CSV"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button 
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} color="#000" strokeWidth={2.5} />
            Add Deal
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className={styles.boardContainer}>
        {STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage] || [];
          const totalVal = getStageTotal(stage);
          const isDragOver = draggedOverCol === stage;

          return (
            <div 
              key={stage}
              className={`${styles.column} ${isDragOver ? styles.columnDragOver : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className={styles.columnHeader}>
                <span className={styles.stageTitle}>{stage}</span>
                <div className={styles.stageMeta}>
                  <span className={styles.dealCount}>
                    {stageDeals.length} {stageDeals.length === 1 ? 'Deal' : 'Deals'}
                  </span>
                  <span className={styles.stageValue}>
                    ${totalVal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={styles.cardsContainer}>
                {stageDeals.map((deal) => {
                  const inactiveDays = getDealInactivityDays(deal.lastActivity);
                  const isStale = inactiveDays > 2 && deal.stage !== 'Won' && deal.stage !== 'Lost';
                  const isDanger = inactiveDays > 5 && deal.stage !== 'Won' && deal.stage !== 'Lost';

                  return (
                    <div
                      key={deal.id}
                      className={styles.dealCard}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div className={styles.dealTitle}>{deal.title}</div>
                          <div className={styles.dealCompany}>{deal.company}</div>
                        </div>

                        {/* Stale alert indicator */}
                        {isStale && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.02)', padding: '2px 6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <span className={isDanger ? "pulseDangerIndicator" : "pulseWarningIndicator"} />
                            <span style={{ fontSize: '0.62rem', color: isDanger ? 'var(--clr-danger)' : 'var(--clr-warning)', fontWeight: 700 }}>
                              {inactiveDays}d
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={styles.dealValueText}>
                          ${deal.value.toLocaleString()}
                        </span>
                        <span className={`badge ${
                          deal.stage === 'Won' ? 'badge-success' : 
                          deal.stage === 'Lost' ? 'badge-danger' : 
                          deal.stage === 'Negotiation' ? 'badge-purple' : 
                          'badge-cyan'
                        }`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {deal.probability}%
                        </span>
                      </div>

                      <div className={styles.cardFooter}>
                        <span className={styles.dateLabel} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} /> {deal.expectedCloseDate}
                        </span>
                        <div className={styles.cardAvatar} title={deal.owner}>
                          {getInitials(deal.owner)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageDeals.length === 0 && (
                  <div style={{ 
                    border: '1px dashed rgba(255,255,255,0.03)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '24px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    Drag deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ADD DEAL MODAL --- */}
      {isModalOpen && (
        <div className="crmModalOverlay">
          <div className="crmModal">
            <div className="crmModalHeader">
              <h3>Create New Deal</h3>
              <button className="crmCloseBtn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateDeal}>
              <div className="crmModalBody">
                <div className="crmFormGroup">
                  <label htmlFor="dealTitle">Deal Title</label>
                  <input 
                    type="text" 
                    id="dealTitle" 
                    placeholder="e.g. Server Infrastructure Migration" 
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="crmFormGroup">
                  <label htmlFor="dealCompany">Company</label>
                  <input 
                    type="text" 
                    id="dealCompany" 
                    placeholder="e.g. Stark Industries" 
                    value={dealCompany}
                    onChange={(e) => setDealCompany(e.target.value)}
                    required
                  />
                </div>

                <div className="crmFormRow">
                  <div className="crmFormGroup">
                    <label htmlFor="dealValue">Pipeline Value ($)</label>
                    <input 
                      type="number" 
                      id="dealValue" 
                      placeholder="e.g. 50000" 
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      required
                    />
                  </div>
                  <div className="crmFormGroup">
                    <label htmlFor="dealStage">Initial Stage</label>
                    <select 
                      id="dealStage"
                      value={dealStage}
                      onChange={(e) => setDealStage(e.target.value as any)}
                    >
                      <option value="Lead">Lead</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </div>

                <div className="crmFormRow">
                  <div className="crmFormGroup">
                    <label htmlFor="dealOwner">Deal Owner</label>
                    <input 
                      type="text" 
                      id="dealOwner" 
                      value={dealOwner}
                      onChange={(e) => setDealOwner(e.target.value)}
                      required
                    />
                  </div>
                  <div className="crmFormGroup">
                    <label htmlFor="dealCloseDate">Expected Close</label>
                    <input 
                      type="date" 
                      id="dealCloseDate" 
                      value={dealCloseDate}
                      onChange={(e) => setDealCloseDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="crmModalFooter">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
