'use client';

import React, { useState, useEffect } from 'react';
import { useCRM, Contact, Activity } from '@/context/CRMContext';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  X,
  FileText,
  Sparkles,
  Download,
  Brain,
  Check,
  Send,
  MessageSquare
} from 'lucide-react';
import styles from './page.module.css';

export default function ContactsDatabase() {
  const { contacts, activities, addContact, updateContact, addActivity } = useCRM();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected contact for detail drawer
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const selectedContact = contacts.find(c => c.id === selectedContactId);

  // Drawer states
  const [localNotes, setLocalNotes] = useState('');
  const [drawerTab, setDrawerTab] = useState<'history' | 'outreach' | 'notes'>('history');

  // AI Scoring state
  const [isScoring, setIsScoring] = useState(false);
  const [scoringStep, setScoringStep] = useState('');

  // AI Email Outreach state
  const [outreachTemplate, setOutreachTemplate] = useState('warm_intro');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  
  // Drawer activity form state
  const [actType, setActType] = useState<Activity['type']>('call');
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');

  // Add Contact Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactStatus, setContactStatus] = useState<'Lead' | 'Contact' | 'Customer'>('Lead');
  const [contactValue, setContactValue] = useState('');
  const [contactTags, setContactTags] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // Sync drawer notes when contact selection changes
  useEffect(() => {
    if (selectedContact) {
      setLocalNotes(selectedContact.notes || '');
      setDrawerTab('history'); // Reset tab to history on select change
      setDraftText('');
      setIsDrafting(false);
      setIsSentSuccess(false);
    }
  }, [selectedContactId, selectedContact]);

  // Handle Note Save
  const handleSaveNote = () => {
    if (!selectedContact) return;
    updateContact({
      ...selectedContact,
      notes: localNotes
    });
    // Log activity
    addActivity({
      type: 'note',
      title: 'Contact Note Updated',
      description: 'Internal contact notes were updated in profile detail drawer.',
      contactId: selectedContact.id
    });
  };

  // Handle Log Activity
  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !actTitle || !actDesc) return;

    addActivity({
      type: actType,
      title: actTitle,
      description: actDesc,
      contactId: selectedContact.id
    });

    // Reset fields
    setActTitle('');
    setActDesc('');
  };

  // AI Scoring Engine simulation
  const runAIScoring = () => {
    if (!selectedContact) return;
    setIsScoring(true);
    
    const steps = [
      'Retrieving client email response vectors...',
      'Analyzing sentiments & interaction frequency...',
      'Measuring average budget capacity alignment...',
      'Correlating linked deals status values...',
      'Scoring completed!'
    ];

    let stepIdx = 0;
    setScoringStep(steps[0]);

    const interval = setInterval(() => {
      stepIdx += 1;
      if (stepIdx < steps.length) {
        setScoringStep(steps[stepIdx]);
      } else {
        clearInterval(interval);
        
        // Compute new score
        const oldScore = selectedContact.aiScore || 65;
        const change = Math.floor(Math.random() * 16) - 7; // -7 to +8
        const newScore = Math.max(15, Math.min(100, oldScore + change));
        
        // Define new factors
        const factorOptions = [
          'High email open rate consistency (>90%)',
          'Fast response cycle latency (<30 mins)',
          'High average pipeline deal values linked',
          'Active meeting schedule log established',
          'Risk profile: Stale conversation gap resolved',
          'Product system demo completed successfully'
        ];
        
        // Select 3 random factors
        const newFactors = [...factorOptions]
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        updateContact({
          ...selectedContact,
          aiScore: newScore,
          scoreFactors: newFactors
        });

        // Add activity
        addActivity({
          type: 'note',
          title: `AI Score Updated: ${newScore}/100`,
          description: `AI Scoring model refreshed lead metrics. Factors: ${newFactors.join(', ')}.`,
          contactId: selectedContact.id
        });

        setIsScoring(false);
      }
    }, 850);
  };

  // AI Email writer simulation
  const draftWithAI = () => {
    if (!selectedContact) return;
    setIsDrafting(true);
    setDraftText('');
    setIsSentSuccess(false);

    let draftContent = '';
    if (outreachTemplate === 'warm_intro') {
      draftContent = `Subject: Intro: Scalable Database Solutions for ${selectedContact.company}\n\nHi ${selectedContact.name},\n\nI hope this email finds you well. I've been following ${selectedContact.company}'s work, particularly under your direction as ${selectedContact.role}.\n\nI'd love to connect briefly to share some insights on how we might streamline your database modeling latency and support your scaling milestones.\n\nAre you free for a quick 10-minute sync this Thursday?\n\nBest regards,\nAlex Mercer\nSenior Sales Director`;
    } else if (outreachTemplate === 'follow_up') {
      draftContent = `Subject: Checking in: Value Proposition for ${selectedContact.company}\n\nHi ${selectedContact.name},\n\nFollowing up on our recent discussion regarding replica analytics. I wanted to check if you had any thoughts on the system scalability documentation I sent over.\n\nLet me know if you have any technical concerns we should address.\n\nWarmly,\nAlex Mercer\nSenior Sales Director`;
    } else {
      draftContent = `Subject: Contract Review & Scheduling: Next Steps for ${selectedContact.company}\n\nHi ${selectedContact.name},\n\nI wanted to share that our legal team has completed the custom contract terms for your ${selectedContact.role} review at ${selectedContact.company}.\n\nLet's schedule a 15-minute call early next week to sign off and kick off integration.\n\nBest,\nAlex Mercer\nSenior Sales Director`;
    }

    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx < draftContent.length) {
        setDraftText(prev => prev + draftContent[charIdx]);
        charIdx += 1;
      } else {
        clearInterval(interval);
        setIsDrafting(false);
      }
    }, 4);
  };

  const handleSendDraft = () => {
    if (!selectedContact || !draftText) return;

    addActivity({
      type: 'email',
      title: `AI Outreach Email Sent`,
      description: `Sent personalized AI email template: "${outreachTemplate === 'warm_intro' ? 'Warm Intro' : outreachTemplate === 'follow_up' ? 'Follow Up' : 'Contract Review'}"`,
      contactId: selectedContact.id
    });

    setIsSentSuccess(true);
    setDraftText('');
    setTimeout(() => setIsSentSuccess(false), 3000);
  };

  // CSV Export function
  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Role', 'Status', 'Potential Value', 'Last Interaction', 'AI Score', 'Tags', 'Notes'];
    const rows = filteredContacts.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.company.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.role || ''}"`,
      `"${c.status}"`,
      c.value,
      c.lastInteraction,
      c.aiScore,
      `"${c.tags.join(', ')}"`,
      `"${(c.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'crm_contacts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    setIsModalOpen(false);
  };

  // Get matching contact activities (most recent first)
  const contactActivities = activities.filter(act => act.contactId === selectedContactId);

  // Filter contacts based on search and status
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || contact.status.toUpperCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <h2>Contacts Database</h2>
          <p>Manage leads, active accounts, and customer relationships in a central ledger.</p>
        </div>
        <div className="flex gap-12" style={{ display: 'flex', gap: '12px' }}>
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
            Add Contact
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`glass-panel ${styles.filterBar}`} style={{ padding: '16px' }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, company, email..." 
            className={styles.searchInput}
            style={{ paddingLeft: '36px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className={styles.selectFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="LEAD">Leads</option>
          <option value="CONTACT">Contacts</option>
          <option value="CUSTOMER">Customers</option>
        </select>
      </div>

      {/* Grid of Contacts */}
      <div className={styles.contactsGrid}>
        {filteredContacts.map((contact) => (
          <div 
            key={contact.id} 
            className={`glass-panel ${styles.contactCard}`}
            onClick={() => setSelectedContactId(contact.id)}
          >
            {/* AI Score Badge overlay top right */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Sparkles size={9} />
                AI {contact.aiScore}
              </span>
            </div>

            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {getInitials(contact.name)}
              </div>
              <div className={styles.headerInfo}>
                <span className={styles.name}>{contact.name}</span>
                <span className={styles.role}>{contact.role}</span>
                <span className={styles.company}>{contact.company}</span>
              </div>
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.detailItem}>
                <Mail size={12} strokeWidth={2} />
                <span>{contact.email}</span>
              </div>
              <div className={styles.detailItem}>
                <Phone size={12} strokeWidth={2} />
                <span>{contact.phone || 'No phone'}</span>
              </div>
            </div>

            <div className={styles.tagsContainer}>
              {contact.tags.map(tag => (
                <span key={tag} className="badge badge-muted" style={{ fontSize: '0.6rem' }}>
                  {tag}
                </span>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Potential Value</span>
                <span className={styles.valueText}>${contact.value.toLocaleString()}</span>
              </div>
              <span className={`badge ${
                contact.status === 'Customer' ? 'badge-success' :
                contact.status === 'Lead' ? 'badge-warning' : 'badge-cyan'
              }`}>
                {contact.status}
              </span>
            </div>
          </div>
        ))}

        {filteredContacts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No contacts match the search filters. Click "Add Contact" to create one.
          </div>
        )}
      </div>

      {/* --- DETAIL DRAWER PANEL --- */}
      {selectedContact && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setSelectedContactId(null)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div className={styles.avatar} style={{ width: '56px', height: '56px', fontSize: '1.25rem' }}>
                  {getInitials(selectedContact.name)}
                </div>
                <div className={styles.headerInfo}>
                  <h3 className={styles.name} style={{ fontSize: '1.15rem' }}>{selectedContact.name}</h3>
                  <span className={styles.role} style={{ fontSize: '0.85rem' }}>{selectedContact.role}</span>
                  <span className={styles.company} style={{ fontSize: '0.85rem' }}>{selectedContact.company}</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedContactId(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Custom Tab Selectors in Drawer */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '0 24px' }}>
              <button 
                onClick={() => setDrawerTab('history')}
                style={{ 
                  flex: 1, 
                  background: 'none', 
                  border: 'none', 
                  borderBottom: drawerTab === 'history' ? '2px solid var(--clr-cyan)' : '2px solid transparent',
                  color: drawerTab === 'history' ? 'var(--clr-cyan)' : 'var(--text-secondary)',
                  padding: '12px 0',
                  fontWeight: drawerTab === 'history' ? 600 : 500,
                  fontSize: '0.85rem'
                }}
              >
                Timeline
              </button>
              <button 
                onClick={() => setDrawerTab('outreach')}
                style={{ 
                  flex: 1, 
                  background: 'none', 
                  border: 'none', 
                  borderBottom: drawerTab === 'outreach' ? '2px solid var(--clr-cyan)' : '2px solid transparent',
                  color: drawerTab === 'outreach' ? 'var(--clr-cyan)' : 'var(--text-secondary)',
                  padding: '12px 0',
                  fontWeight: drawerTab === 'outreach' ? 600 : 500,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} />
                AI Campaigns
              </button>
              <button 
                onClick={() => setDrawerTab('notes')}
                style={{ 
                  flex: 1, 
                  background: 'none', 
                  border: 'none', 
                  borderBottom: drawerTab === 'notes' ? '2px solid var(--clr-cyan)' : '2px solid transparent',
                  color: drawerTab === 'notes' ? 'var(--clr-cyan)' : 'var(--text-secondary)',
                  padding: '12px 0',
                  fontWeight: drawerTab === 'notes' ? 600 : 500,
                  fontSize: '0.85rem'
                }}
              >
                Profile & Notes
              </button>
            </div>

            <div className={styles.drawerBody}>
              
              {/* Tab 1: History timeline & quick log */}
              {drawerTab === 'history' && (
                <>
                  {/* Quick Log Activity */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.sectionTitle}>Log Interaction</h4>
                    <form onSubmit={handleLogActivity} className={styles.activityForm}>
                      <div className={styles.formRow} style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                        <div className={styles.formGroup}>
                          <select 
                            value={actType}
                            onChange={(e) => setActType(e.target.value as any)}
                          >
                            <option value="call">Call Log</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="note">Internal Note</option>
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <input 
                            type="text" 
                            placeholder="Activity Title (e.g. Price negotiation)" 
                            value={actTitle}
                            onChange={(e) => setActTitle(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <textarea 
                          placeholder="Log detail summary..." 
                          value={actDesc}
                          onChange={(e) => setActDesc(e.target.value)}
                          rows={2}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ fontSize: '0.8rem', padding: '6px 12px', alignSelf: 'flex-end', color: '#000' }}
                      >
                        Log Interaction
                      </button>
                    </form>
                  </div>

                  {/* Activity Timeline */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.sectionTitle}>Interaction History</h4>
                    <div className={styles.timeline}>
                      {contactActivities.map((act) => {
                        let Icon = FileText;
                        if (act.type === 'call') Icon = Phone;
                        else if (act.type === 'email') Icon = Mail;
                        else if (act.type === 'meeting') Icon = Calendar;

                        return (
                          <div key={act.id} className={styles.timelineItem}>
                            <div className={styles.timelineIcon}>
                              <Icon size={12} />
                            </div>
                            <div className={styles.timelineContent}>
                              <span className={styles.timelineTitle}>{act.title}</span>
                              <span className={styles.timelineDesc}>{act.description}</span>
                              <span className={styles.timelineDate}>{act.date}</span>
                            </div>
                          </div>
                        );
                      })}

                      {contactActivities.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px 0' }}>
                          No history recorded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: AI Outreach campaigner */}
              {drawerTab === 'outreach' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* AI Email draft generator */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.sectionTitle}>Draft Campaign outreach</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Select a predefined template vector to draft a personalized AI outreach email.
                    </p>

                    <div className={styles.activityForm} style={{ gap: '14px' }}>
                      <div className={styles.formGroup}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Template Area</label>
                        <select 
                          value={outreachTemplate} 
                          onChange={(e) => setOutreachTemplate(e.target.value)}
                        >
                          <option value="warm_intro">Warm Introductory Pitch</option>
                          <option value="follow_up">Product Demo Follow-Up</option>
                          <option value="contract_remind">Contract review & Schedule</option>
                        </select>
                      </div>

                      <button 
                        type="button" 
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', color: '#000' }}
                        onClick={draftWithAI}
                        disabled={isDrafting}
                      >
                        <Sparkles size={14} color="#000" />
                        {isDrafting ? 'Writing draft...' : 'Draft with AI'}
                      </button>

                      {/* Typewriter or draft output text box */}
                      {(draftText || isDrafting) && (
                        <div 
                          style={{ 
                            background: 'rgba(0,0,0,0.2)', 
                            border: '1px solid var(--glass-border)', 
                            borderRadius: '8px', 
                            padding: '16px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            color: 'var(--text-primary)',
                            lineHeight: 1.4,
                            maxHeight: '260px',
                            overflowY: 'auto'
                          }}
                        >
                          {draftText}
                          {isDrafting && <span style={{ animation: 'pulseGlow 1s infinite', borderLeft: '2px solid var(--clr-cyan)', marginLeft: '2px' }} />}
                        </div>
                      )}

                      {/* Send button */}
                      {draftText && !isDrafting && (
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ alignSelf: 'flex-end', background: 'var(--grad-success)', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}
                          onClick={handleSendDraft}
                        >
                          <Send size={12} />
                          Send Outreach Email
                        </button>
                      )}

                      {isSentSuccess && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                          <Check size={16} />
                          Outreach sent & logged to timeline!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Notes & Profile details */}
              {drawerTab === 'notes' && (
                <>
                  {/* AI Scoring Gauge Section */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.sectionTitle}>AI Engagement Intelligence</h4>
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                      {/* Circle gauge */}
                      <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
                        <svg width="84" height="84" viewBox="0 0 84 84">
                          {/* Background circle */}
                          <circle 
                            cx="42" 
                            cy="42" 
                            r="36" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.03)" 
                            strokeWidth="6" 
                          />
                          {/* Active gauge circle */}
                          <circle 
                            cx="42" 
                            cy="42" 
                            r="36" 
                            fill="none" 
                            stroke="url(#gaugeGrad)" 
                            strokeWidth="6" 
                            strokeDasharray="226.2"
                            strokeDashoffset={226.2 - (226.2 * (selectedContact.aiScore || 0)) / 100}
                            strokeLinecap="round"
                            transform="rotate(-90 42 42)"
                            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                          />
                          <defs>
                            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="var(--clr-cyan)" />
                              <stop offset="100%" stopColor="var(--clr-purple)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1 }}>
                            {selectedContact.aiScore || 0}
                          </span>
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Score</span>
                        </div>
                      </div>

                      {/* Score metrics factors */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Lead Conversion Rating</span>
                          <button 
                            className="btn-secondary" 
                            style={{ fontSize: '0.7rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={runAIScoring}
                            disabled={isScoring}
                          >
                            <Brain size={11} />
                            {isScoring ? 'Scoring...' : 'Recalculate'}
                          </button>
                        </div>
                        {isScoring ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--clr-cyan)', fontStyle: 'italic', animation: 'pulseGlow 1s infinite' }}>
                            {scoringStep}
                          </div>
                        ) : (
                          <ul style={{ paddingLeft: '14px', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {(selectedContact.scoreFactors || []).map((factor, i) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.sectionTitle}>Profile Details</h4>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{selectedContact.email}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Phone</span>
                        <span className={styles.infoValue}>{selectedContact.phone || '—'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>CRM Status</span>
                        <div>
                          <span className={`badge ${
                            selectedContact.status === 'Customer' ? 'badge-success' :
                            selectedContact.status === 'Lead' ? 'badge-warning' : 'badge-cyan'
                          }`} style={{ fontSize: '0.7rem' }}>
                            {selectedContact.status}
                          </span>
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Potential Value</span>
                        <span className={styles.infoValue} style={{ fontWeight: '700', color: 'var(--clr-cyan)', fontFamily: 'Outfit' }}>
                          ${selectedContact.value.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={styles.infoItem} style={{ marginTop: '8px' }}>
                      <span className={styles.infoLabel}>Tags</span>
                      <div className={styles.tagsContainer}>
                        {selectedContact.tags.map(t => (
                          <span key={t} className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div className={styles.drawerSection}>
                    <h4 className={styles.sectionTitle}>Internal Relationship Notes</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea 
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        placeholder="Enter notes about phone calls, project updates, or meetings..."
                        rows={4}
                      />
                      <button 
                        className="btn-secondary" 
                        style={{ fontSize: '0.8rem', padding: '6px 12px', alignSelf: 'flex-end' }}
                        onClick={handleSaveNote}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* --- ADD CONTACT MODAL --- */}
      {isModalOpen && (
        <div className="crmModalOverlay">
          <div className="crmModal">
            <div className="crmModalHeader">
              <h3>Add New Contact</h3>
              <button className="crmCloseBtn" onClick={() => setIsModalOpen(false)}>
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
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
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
