'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- DATA STRUCTURES ---

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  status: 'Lead' | 'Contact' | 'Customer';
  value: number;
  lastInteraction: string;
  tags: string[];
  notes: string;
  aiScore: number;
  scoreFactors: string[];
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  probability: number; // 0 to 100
  owner: string;
  expectedCloseDate: string;
  lastActivity: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  date: string;
  contactId?: string;
  dealId?: string;
}

interface CRMContextType {
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  addContact: (contact: Omit<Contact, 'id' | 'lastInteraction' | 'aiScore' | 'scoreFactors'>) => void;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'lastActivity'>) => void;
  updateDeal: (deal: Deal) => void;
  moveDeal: (dealId: string, newStage: Deal['stage']) => void;
  deleteDeal: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'date'>) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// --- INITIAL HIGH-FIDELITY MOCK DATA ---

const initialContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Tony Stark',
    company: 'Stark Industries',
    email: 'tony@stark.com',
    phone: '+1 (555) 019-2831',
    role: 'CEO & Founder',
    status: 'Customer',
    value: 1200000,
    lastInteraction: '2026-07-03',
    tags: ['VIP', 'Enterprise', 'Tech'],
    notes: 'Very interested in high-density energy solutions. Prefers email updates during off-hours.',
    aiScore: 98,
    scoreFactors: [
      'Email response time < 15 mins',
      'Recent high-value Won deal',
      'Decision maker CEO profile',
      '3 interactions logged this week'
    ]
  },
  {
    id: 'c2',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    email: 'bruce@waynecorp.com',
    phone: '+1 (555) 041-9988',
    role: 'Chairman',
    status: 'Customer',
    value: 850000,
    lastInteraction: '2026-07-02',
    tags: ['VIP', 'Defense', 'Strategic'],
    notes: 'Discussed tactical satellite networking. Demands complete data isolation and private cloud options.',
    aiScore: 89,
    scoreFactors: [
      'Active negotiation in progress',
      'High average email open rate',
      'Strategic level deal partner',
      'Completed product system demo'
    ]
  },
  {
    id: 'c3',
    name: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    email: 's.connor@cyberdyne.co',
    phone: '+1 (555) 012-4412',
    role: 'Security Consultant',
    status: 'Lead',
    value: 150000,
    lastInteraction: '2026-06-28',
    tags: ['Security', 'AI Systems'],
    notes: 'Audit of automated systems requested. Extremely cautious about AI decision-making elements.',
    aiScore: 45,
    scoreFactors: [
      'Lengthy delay in email response',
      'Budget constraints highlighted',
      'Low probability lead rating',
      'Security audit pending validation'
    ]
  },
  {
    id: 'c4',
    name: 'Eldon Tyrell',
    company: 'Tyrell Corporation',
    email: 'tyrell@tyrell.io',
    phone: '+1 (555) 098-7654',
    role: 'Founder & CEO',
    status: 'Contact',
    value: 450000,
    lastInteraction: '2026-07-04',
    tags: ['BioTech', 'Large Account'],
    notes: 'Follow-up regarding replica analytics. Impressed with database scalability and user permissions.',
    aiScore: 82,
    scoreFactors: [
      'Highly engaged in product demo',
      'Frequent contact visit logs',
      'Decision maker CEO profile',
      'Requested follow-up documents'
    ]
  },
  {
    id: 'c5',
    name: 'Norman Osborn',
    company: 'Oscorp Industries',
    email: 'n.osborn@oscorp.com',
    phone: '+1 (555) 034-7711',
    role: 'CEO',
    status: 'Lead',
    value: 620000,
    lastInteraction: '2026-07-01',
    tags: ['BioTech', 'Fast-Track'],
    notes: 'Inquired about molecular modeling processing capacities. Deal depends on sub-millisecond response latency.',
    aiScore: 71,
    scoreFactors: [
      'Active proposal stage deal',
      'High budget capacity verified',
      'Technical requirements pending review',
      'Score restricted by timing constraints'
    ]
  },
  {
    id: 'c6',
    name: 'Selina Kyle',
    company: 'Gotham Imports',
    email: 'kyle@gothamimports.com',
    phone: '+1 (555) 066-1212',
    role: 'Managing Director',
    status: 'Contact',
    value: 95000,
    lastInteraction: '2026-06-25',
    tags: ['Logistics', 'Mid-Market'],
    notes: 'Expressed interest in cargo tracking dashboard templates. Budget is flexible if integration is instant.',
    aiScore: 58,
    scoreFactors: [
      'Initial inquiry response logged',
      'Mid-market budget limitations',
      'Pending direct meeting scheduler',
      'Interaction gap > 8 days'
    ]
  }
];

const initialDeals: Deal[] = [
  {
    id: 'd1',
    title: 'Arc Reactor Grid Integration',
    company: 'Stark Industries',
    value: 750000,
    stage: 'Won',
    probability: 100,
    owner: 'Alex Mercer',
    expectedCloseDate: '2026-06-30',
    lastActivity: '2026-07-03'
  },
  {
    id: 'd2',
    title: 'Clean Energy Microgrid Solution',
    company: 'Stark Industries',
    value: 450000,
    stage: 'Proposal',
    probability: 70,
    owner: 'Alex Mercer',
    expectedCloseDate: '2026-08-15',
    lastActivity: '2026-07-03'
  },
  {
    id: 'd3',
    title: 'Satellite Encryption Suite',
    company: 'Wayne Enterprises',
    value: 850000,
    stage: 'Negotiation',
    probability: 90,
    owner: 'Sarah Chen',
    expectedCloseDate: '2026-07-28',
    lastActivity: '2026-07-02'
  },
  {
    id: 'd4',
    title: 'Threat Detection System',
    company: 'Cyberdyne Systems',
    value: 150000,
    stage: 'Lead',
    probability: 10,
    owner: 'Sarah Chen',
    expectedCloseDate: '2026-11-10',
    lastActivity: '2026-06-28'
  },
  {
    id: 'd5',
    title: 'Genetic Database Modeling',
    company: 'Tyrell Corporation',
    value: 450000,
    stage: 'Qualified',
    probability: 40,
    owner: 'Marcus Vance',
    expectedCloseDate: '2026-09-01',
    lastActivity: '2026-07-04'
  },
  {
    id: 'd6',
    title: 'Molecular Compute Farm',
    company: 'Oscorp Industries',
    value: 620000,
    stage: 'Proposal',
    probability: 60,
    owner: 'Marcus Vance',
    expectedCloseDate: '2026-08-30',
    lastActivity: '2026-07-01'
  },
  {
    id: 'd7',
    title: 'Global Supply Chain Audit',
    company: 'Gotham Imports',
    value: 95000,
    stage: 'Lead',
    probability: 20,
    owner: 'Alex Mercer',
    expectedCloseDate: '2026-10-15',
    lastActivity: '2026-06-25'
  }
];

const initialActivities: Activity[] = [
  {
    id: 'a1',
    type: 'meeting',
    title: 'Grid Integration Sign-off',
    description: 'Contract signed by CEO Tony Stark. Project kicks off next week.',
    date: '2026-07-03',
    contactId: 'c1',
    dealId: 'd1'
  },
  {
    id: 'a2',
    type: 'call',
    title: 'Satellite Encryption Sync',
    description: 'Discussed encryption standards and private hosting requirements. Agreed to deliver proposal draft.',
    date: '2026-07-02',
    contactId: 'c2',
    dealId: 'd3'
  },
  {
    id: 'a3',
    type: 'email',
    title: 'Sent Proposal for Clean Energy Grid',
    description: 'Emailed full technical specification document and pricing breakdown for Stark Microgrid.',
    date: '2026-07-03',
    contactId: 'c1',
    dealId: 'd2'
  },
  {
    id: 'a4',
    type: 'note',
    title: 'Oscorp Security Clearance Info',
    description: 'Norman Osborn indicated that federal security clearances are pending, which might speed up procurement.',
    date: '2026-07-01',
    contactId: 'c5',
    dealId: 'd6'
  },
  {
    id: 'a5',
    type: 'meeting',
    title: 'Tyrell Corp Product Demo',
    description: 'Conducted live system overview of database modeling scaling. Eldon Tyrell was very engaged.',
    date: '2026-07-04',
    contactId: 'c4',
    dealId: 'd5'
  }
];

// --- PROVIDER COMPONENT ---

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage or fallback to Mock Data
  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem('crm_contacts');
      const storedDeals = localStorage.getItem('crm_deals');
      const storedActivities = localStorage.getItem('crm_activities');

      if (storedContacts) setContacts(JSON.parse(storedContacts));
      else {
        setContacts(initialContacts);
        localStorage.setItem('crm_contacts', JSON.stringify(initialContacts));
      }

      if (storedDeals) setDeals(JSON.parse(storedDeals));
      else {
        setDeals(initialDeals);
        localStorage.setItem('crm_deals', JSON.stringify(initialDeals));
      }

      if (storedActivities) setActivities(JSON.parse(storedActivities));
      else {
        setActivities(initialActivities);
        localStorage.setItem('crm_activities', JSON.stringify(initialActivities));
      }
    } catch (error) {
      console.error('Failed to load CRM state from localStorage', error);
      // Fallback
      setContacts(initialContacts);
      setDeals(initialDeals);
      setActivities(initialActivities);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever states change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('crm_contacts', JSON.stringify(contacts));
    } catch (e) {
      console.error(e);
    }
  }, [contacts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('crm_deals', JSON.stringify(deals));
    } catch (e) {
      console.error(e);
    }
  }, [deals, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('crm_activities', JSON.stringify(activities));
    } catch (e) {
      console.error(e);
    }
  }, [activities, isLoaded]);

  // --- ACTIONS ---

  const addContact = (newContact: Omit<Contact, 'id' | 'lastInteraction' | 'aiScore' | 'scoreFactors'>) => {
    const contact: Contact = {
      ...newContact,
      id: `c_${Date.now()}`,
      lastInteraction: new Date().toISOString().split('T')[0],
      aiScore: Math.floor(Math.random() * 30) + 50, // default random 50-80
      scoreFactors: [
        'Initial relationship established',
        'Lead scoring model initialized',
        'Awaiting historical activity data'
      ]
    };
    setContacts(prev => [contact, ...prev]);
  };

  const updateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    // Also clean up activities and links if necessary
  };

  const addDeal = (newDeal: Omit<Deal, 'id' | 'lastActivity'>) => {
    const deal: Deal = {
      ...newDeal,
      id: `d_${Date.now()}`,
      lastActivity: new Date().toISOString().split('T')[0]
    };
    setDeals(prev => [deal, ...prev]);

    // Automatically create activity
    addActivity({
      type: 'note',
      title: 'Deal Created',
      description: `New deal "${deal.title}" created with pipeline value $${deal.value.toLocaleString()}.`,
      dealId: deal.id
    });
  };

  const updateDeal = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  };

  const moveDeal = (dealId: string, newStage: Deal['stage']) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        if (d.stage === newStage) return d;
        
        let probability = d.probability;
        if (newStage === 'Lead') probability = 10;
        else if (newStage === 'Qualified') probability = 30;
        else if (newStage === 'Proposal') probability = 50;
        else if (newStage === 'Negotiation') probability = 80;
        else if (newStage === 'Won') probability = 100;
        else if (newStage === 'Lost') probability = 0;

        const updated = {
          ...d,
          stage: newStage,
          probability,
          lastActivity: new Date().toISOString().split('T')[0]
        };

        // Create activity log
        setTimeout(() => {
          addActivity({
            type: 'note',
            title: `Stage Updated: ${newStage}`,
            description: `Deal moved to stage ${newStage} (Probability: ${probability}%).`,
            dealId: dealId
          });
        }, 0);

        return updated;
      }
      return d;
    }));
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  const addActivity = (newAct: Omit<Activity, 'id' | 'date'>) => {
    const act: Activity = {
      ...newAct,
      id: `a_${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setActivities(prev => [act, ...prev]);

    // Update last interaction for contact/deal if linked
    if (newAct.contactId) {
      setContacts(prev => prev.map(c => c.id === newAct.contactId ? { ...c, lastInteraction: act.date } : c));
    }
    if (newAct.dealId) {
      setDeals(prev => prev.map(d => d.id === newAct.dealId ? { ...d, lastActivity: act.date } : d));
    }
  };

  return (
    <CRMContext.Provider value={{
      contacts,
      deals,
      activities,
      addContact,
      updateContact,
      deleteContact,
      addDeal,
      updateDeal,
      moveDeal,
      deleteDeal,
      addActivity
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
