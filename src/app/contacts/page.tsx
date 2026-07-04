'use client';

import React, { useState, useEffect } from 'react';
import { useCRM, Contact, Activity } from '@/context/CRMContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  MessageSquare,
  X,
  FileText,
  User
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

  // Drawer notes state
  const [localNotes, setLocalNotes] = useState('');
  
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
        <button 
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} color="#000" strokeWidth={2.5} />
          Add Contact
        </button>
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

            <div className={styles.drawerBody}>
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

              {/* Log Activity */}
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

