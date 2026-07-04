'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { 
  DollarSign, 
  Award, 
  Percent, 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  X,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import styles from './page.module.css';
import InteractiveChart from '@/components/InteractiveChart';

export default function Dashboard() {
  const { contacts, deals, activities, addDeal, addContact } = useCRM();

  // Modal states
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Form states for new Deal
  const [dealTitle, setDealTitle] = useState('');
  const [dealCompany, setDealCompany] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [dealStage, setDealStage] = useState<'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost'>('Lead');
  const [dealOwner, setDealOwner] = useState('Alex Mercer');
  const [dealCloseDate, setDealCloseDate] = useState('2026-08-31');

  // Form states for new Contact
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactStatus, setContactStatus] = useState<'Lead' | 'Contact' | 'Customer'>('Lead');
  const [contactValue, setContactValue] = useState('');
  const [contactTags, setContactTags] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // --- STATS CALCULATIONS ---
  // Active pipeline: all deals except Won and Lost
  const pipelineDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const totalPipelineValue = pipelineDeals.reduce((sum, d) => sum + d.value, 0);

  // Closed deals
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const totalWonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  const lostDeals = deals.filter(d => d.stage === 'Lost');
  const totalClosedDealsCount = wonDeals.length + lostDeals.length;
  const winRate = totalClosedDealsCount > 0 
    ? Math.round((wonDeals.length / totalClosedDealsCount) * 100) 
    : 0;

  const totalContacts = contacts.length;

  // Recent 6 activities
  const recentActivities = activities.slice(0, 6);

  // Top 5 active deals (highest value first)
  const topDeals = [...deals]
    .filter(d => d.stage !== 'Won' && d.stage !== 'Lost')
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // --- SUBMIT HANDLERS ---
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle || !dealCompany || !dealValue) return;

    addDeal({
      title: dealTitle,
      company: dealCompany,
      value: Number(dealValue),
      stage: dealStage,
      probability: dealStage === 'Lead' ? 10 : dealStage === 'Qualified' ? 30 : dealStage === 'Proposal' ? 50 : dealStage === 'Negotiation' ? 80 : 100,
      owner: dealOwner,
      expectedCloseDate: dealCloseDate,
    });

    // Reset fields
    setDealTitle('');
    setDealCompany('');
    setDealValue('');
    setDealStage('Lead');
    setIsDealModalOpen(false);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactCompany || !contactEmail) return;

    addContact({
      name: contactName,
      company: contactCompany,
      email: contactEmail,
      phone: contactPhone,
      role: contactRole,
      status: contactStatus,
      value: Number(contactValue) || 0,
      tags: contactTags ? contactTags.split(',').map(t => t.trim()) : [],
      notes: contactNotes
    });

    // Reset fields
    setContactName('');
    setContactCompany('');
    setContactEmail('');
    setContactPhone('');
    setContactRole('');
    setContactStatus('Lead');
    setContactValue('');
    setContactTags('');
    setContactNotes('');
    setIsContactModalOpen(false);
  };

  return (
    <>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Good Afternoon, Alex</h2>
          <p>Here is what is happening with your sales funnel today.</p>
        </div>
        <div className={styles.actions}>
          <button 
            className="btn-secondary"
            onClick={() => setIsContactModalOpen(true)}
          >
            Add Contact
          </button>
          <button 
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsDealModalOpen(true)}
          >
            <Plus size={16} color="#000" strokeWidth={2.5} />
            New Deal
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        {/* Metric 1: Total Pipeline */}
        <div className="glass-panel col-span-1 animate-fade-in">
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Open Pipeline</span>
              <div className={styles.statIconWrapper}>
                <DollarSign size={18} strokeWidth={2} />
              </div>
            </div>
            <div className={styles.statValue}>
              ${totalPipelineValue.toLocaleString()}
            </div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>
                <TrendingUp size={14} /> +12.4%
              </span>
              <span>vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Deals Won */}
        <div className="glass-panel col-span-1 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Deals Won Value</span>
              <div className={styles.statIconWrapper} style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--clr-success)' }}>
                <Award size={18} strokeWidth={2} />
              </div>
            </div>
            <div className={styles.statValue} style={{ textShadow: '0 0 10px rgba(16,185,129,0.1)' }}>
              ${totalWonValue.toLocaleString()}
            </div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>
                <TrendingUp size={14} /> +18.2%
              </span>
              <span>vs target</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Win Rate */}
        <div className="glass-panel col-span-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Avg Win Rate</span>
              <div className={styles.statIconWrapper} style={{ borderColor: 'rgba(127,0,255,0.3)', color: '#c084fc' }}>
                <Percent size={18} strokeWidth={2} />
              </div>
            </div>
            <div className={styles.statValue}>
              {winRate}%
            </div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>
                <TrendingUp size={14} /> +2.5%
              </span>
              <span>q-o-q growth</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Active Contacts */}
        <div className="glass-panel col-span-1 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Contacts</span>
              <div className={styles.statIconWrapper} style={{ borderColor: 'rgba(0,242,254,0.3)', color: 'var(--clr-cyan)' }}>
                <Users size={18} strokeWidth={2} />
              </div>
            </div>
            <div className={styles.statValue}>
              {totalContacts}
            </div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>
                <TrendingUp size={14} /> +4
              </span>
              <span>new this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections (Chart + Activity Feed) */}
      <div className={styles.dashboardBody}>
        {/* Chart Column */}
        <div className={styles.chartColumn}>
          <InteractiveChart />
        </div>

        {/* Activities Column */}
        <div className={`glass-panel ${styles.activityColumn}`} style={{ padding: '24px' }}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Recent Activities</h3>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Live</span>
          </div>

          <div className={styles.activityList}>
            {recentActivities.map((act) => {
              let Icon = FileText;
              let iconClass = styles.iconNote;
              if (act.type === 'call') {
                Icon = Phone;
                iconClass = styles.iconCall;
              } else if (act.type === 'email') {
                Icon = Mail;
                iconClass = styles.iconEmail;
              } else if (act.type === 'meeting') {
                Icon = Calendar;
                iconClass = styles.iconMeeting;
              }

              return (
                <div key={act.id} className={styles.activityItem}>
                  <div className={`${styles.actIcon} ${iconClass}`}>
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  <div className={styles.actContent}>
                    <span className={styles.actTitle}>{act.title}</span>
                    <span className={styles.actDesc}>{act.description}</span>
                    <span className={styles.actDate}>{act.date}</span>
                  </div>
                </div>
              );
            })}

            {recentActivities.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', fontSize: '0.85rem' }}>
                No activities logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hot Deals Table Section */}
      <div className={styles.dealsTableSection}>
        <div className={`glass-panel ${styles.tableCard}`}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Top Active Deals</h3>
            <span className="badge badge-purple">High Value</span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Deal Title</th>
                  <th>Company</th>
                  <th>Value</th>
                  <th>Stage</th>
                  <th>Probability</th>
                  <th>Owner</th>
                  <th>Expected Close</th>
                </tr>
              </thead>
              <tbody>
                {topDeals.map((deal) => {
                  let badgeClass = 'badge-muted';
                  if (deal.stage === 'Won') badgeClass = 'badge-success';
                  else if (deal.stage === 'Lost') badgeClass = 'badge-danger';
                  else if (deal.stage === 'Negotiation') badgeClass = 'badge-purple';
                  else if (deal.stage === 'Proposal') badgeClass = 'badge-cyan';
                  else if (deal.stage === 'Qualified') badgeClass = 'badge-warning';

                  return (
                    <tr key={deal.id}>
                      <td className={styles.dealName}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{deal.title}</span>
                          {(() => {
                            const contact = contacts.find(c => c.company === deal.company);
                            if (contact) {
                              return (
                                <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Sparkles size={8} />
                                  AI {contact.aiScore}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td>{deal.company}</td>
                      <td className={styles.dealValue}>${deal.value.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{deal.stage}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', minWidth: '30px' }}>{deal.probability}%</span>
                          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '60px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${deal.probability}%`, background: 'var(--grad-primary)' }} />
                          </div>
                        </div>
                      </td>
                      <td>{deal.owner}</td>
                      <td>{deal.expectedCloseDate}</td>
                    </tr>
                  );
                })}

                {topDeals.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No active deals found. Click "New Deal" to add one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ADD DEAL MODAL --- */}
      {isDealModalOpen && (
        <div className="crmModalOverlay">
          <div className="crmModal">
            <div className="crmModalHeader">
              <h3>Create New Deal</h3>
              <button className="crmCloseBtn" onClick={() => setIsDealModalOpen(false)}>
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
                <button type="button" className="btn-secondary" onClick={() => setIsDealModalOpen(false)}>
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

      {/* --- ADD CONTACT MODAL --- */}
      {isContactModalOpen && (
        <div className="crmModalOverlay">
          <div className="crmModal">
            <div className="crmModalHeader">
              <h3>Add New Contact</h3>
              <button className="crmCloseBtn" onClick={() => setIsContactModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateContact}>
              <div className="crmModalBody">
                <div className="crmFormRow">
                  <div className="crmFormGroup">
                    <label htmlFor="contactName">Full Name</label>
                    <input 
                      type="text" 
                      id="contactName" 
                      placeholder="e.g. Peter Parker" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="crmFormGroup">
                    <label htmlFor="contactCompany">Company</label>
                    <input 
                      type="text" 
                      id="contactCompany" 
                      placeholder="e.g. Oscorp" 
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crmFormRow">
                  <div className="crmFormGroup">
                    <label htmlFor="contactEmail">Email Address</label>
                    <input 
                      type="email" 
                      id="contactEmail" 
                      placeholder="peter@oscorp.com" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="crmFormGroup">
                    <label htmlFor="contactPhone">Phone Number</label>
                    <input 
                      type="text" 
                      id="contactPhone" 
                      placeholder="+1 (555) 123-4567" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="crmFormRow">
                  <div className="crmFormGroup">
                    <label htmlFor="contactRole">Role / Title</label>
                    <input 
                      type="text" 
                      id="contactRole" 
                      placeholder="e.g. Chief Tech Officer" 
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                    />
                  </div>
                  <div className="crmFormGroup">
                    <label htmlFor="contactStatus">Status</label>
                    <select 
                      id="contactStatus"
                      value={contactStatus}
                      onChange={(e) => setContactStatus(e.target.value as any)}
                    >
                      <option value="Lead">Lead</option>
                      <option value="Contact">Contact</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </div>
                </div>

                <div className="crmFormRow">
                  <div className="crmFormGroup">
                    <label htmlFor="contactValue">Deal Potential ($)</label>
                    <input 
                      type="number" 
                      id="contactValue" 
                      placeholder="e.g. 150000" 
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                    />
                  </div>
                  <div className="crmFormGroup">
                    <label htmlFor="contactTags">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      id="contactTags" 
                      placeholder="VIP, BioTech, Fast-Track" 
                      value={contactTags}
                      onChange={(e) => setContactTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="crmFormGroup">
                  <label htmlFor="contactNotes">Internal Notes</label>
                  <textarea 
                    id="contactNotes" 
                    placeholder="Provide details about relationship or last discussion..." 
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="crmModalFooter">
                <button type="button" className="btn-secondary" onClick={() => setIsContactModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

