'use client';

import { useState, useEffect, forwardRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, CheckCircle, XCircle, ChevronDown, Trash2, Edit2, Check, BarChart2, Briefcase, Users, Settings, Download, CheckSquare, DollarSign, Search } from 'lucide-react';
import styles from './page.module.css';
import { AnimatePresence as FramerAnimatePresence } from 'framer-motion';

import ScrollProgress from '@/components/ScrollProgress';
import FloatingElements from '@/components/FloatingElements';
import MenuOverlay from '@/components/MenuOverlay';
import Footer from '@/components/Footer';
import DatePicker from '@/components/DatePicker';
import AuthGate from '@/components/AuthGate';
import CustomSelect from '@/components/CustomSelect';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

import { getDashboardData, addClientAction, updateClientAction, deleteClientAction, logInvoiceAction, approveSubmissionAction, deleteSubmissionAction, markSubmissionPaidAction } from '@/actions/dashboard';
import { changePassword, toggleDashboardAccess, getAllUsers } from '@/actions/auth';

import dynamic from 'next/dynamic';

const RechartsComponents = dynamic(() => 
  import('recharts').then(mod => ({
    default: ({ children, ...props }) => children(mod)
  })), 
  { ssr: false, loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-grey)' }}>Loading charts...</div> }
);

const ClientCard = forwardRef(({ client, onInvoiceSent, onRemove, onUpdateClient }, ref) => {
  const [videoLink, setVideoLink] = useState('');
  const [amount, setAmount] = useState('');
  const [profit, setProfit] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState(client.email);

  const handleSaveEmail = () => {
    if (editEmail.trim() && editEmail !== client.email) {
      onUpdateClient(client.id, { ...client, email: editEmail.trim() });
    }
    setIsEditingEmail(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoLink || !amount) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: client.name,
          clientEmail: client.email,
          videoLink,
          amount,
          profit: profit || 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Invoice sent successfully!');
        
        // Notify parent to update metrics
        onInvoiceSent({
          clientId: client.id,
          amount: parseFloat(amount),
          profit: parseFloat(profit || 0),
          date: new Date().toISOString()
        });

        setVideoLink('');
        setAmount('');
        setProfit('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send invoice.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <motion.div 
      ref={ref}
      className={styles.clientCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      layout
    >
      <div className={styles.clientHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className={styles.clientName}>{client.name}</h3>
            {isEditingEmail ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)}
                  className={styles.editEmailInput}
                  autoFocus
                  onBlur={handleSaveEmail}
                  onKeyDown={e => e.key === 'Enter' && handleSaveEmail()}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p 
                  className={styles.clientEmail} 
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                  onClick={() => setIsEditingEmail(true)}
                  title="Click to edit email"
                >
                  {client.email}
                </p>
                <button type="button" className={styles.editButton} onClick={() => setIsEditingEmail(true)} title="Edit Email">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
          <button 
            type="button" 
            className={styles.removeButton} 
            onClick={() => onRemove(client.id)}
            title="Remove Client"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <form className={styles.invoiceForm} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            type="url"
            className={styles.input}
            placeholder=" "
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            required
          />
          <label className={styles.label}>Video Link *</label>
        </div>

        <div className={styles.inputGroup}>
          <input
            type="number"
            className={styles.input}
            placeholder=" "
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <label className={styles.label}>Amount ($) *</label>
        </div>

        <div className={styles.inputGroup}>
          <input
            type="number"
            className={styles.input}
            placeholder=" "
            value={profit}
            onChange={(e) => setProfit(e.target.value)}
          />
          <label className={styles.label}>Profit ($)</label>
        </div>

        <button 
          type="submit" 
          className={styles.button}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending...' : 'Send Invoice'}
          <Send size={18} />
        </button>

        {message && (
          <div className={`${styles.message} ${status === 'success' ? styles.success : styles.error}`}>
            {status === 'success' ? <CheckCircle size={16} style={{display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}}/> : <XCircle size={16} style={{display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}}/>}
            {message}
          </div>
        )}
      </form>
    </motion.div>
  );
});

ClientCard.displayName = 'ClientCard';

const filterOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '10days', label: 'Last 10 Days' },
  { value: '15days', label: 'Last 15 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '2months', label: 'Last 2 Months' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '12months', label: 'Last 12 Months' },
  { value: 'custom', label: 'Custom Range...' }
];

const parsePaymentStr = (str) => {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object') return parsed;
    return { raw: str };
  } catch(e) {
    return { raw: str };
  }
};

const EditorPaymentDetailsView = ({ bank, rocket, binance }) => {
  if (!bank && !rocket && !binance) return null;
  const b = parsePaymentStr(bank);
  const r = parsePaymentStr(rocket);
  const bn = parsePaymentStr(binance);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)', marginBottom: '4px', textTransform: 'uppercase' }}>Editor Payment Details</div>
      {b && (
        <div style={{ fontSize: '0.8rem', color: '#fff' }}>
          <span style={{ color: 'var(--text-muted)' }}>Bank:</span>{' '}
          {b.raw ? b.raw : `${b.bankName || ''} | A/C: ${b.accountNumber || ''} | Name: ${b.holderName || ''}`}
        </div>
      )}
      {r && (
        <div style={{ fontSize: '0.8rem', color: '#fff' }}>
          <span style={{ color: 'var(--text-muted)' }}>Rocket:</span>{' '}
          {r.raw ? r.raw : `${r.rocketNumber || ''} | Name: ${r.rocketName || ''}`}
        </div>
      )}
      {bn && (
        <div style={{ fontSize: '0.8rem', color: '#fff' }}>
          <span style={{ color: 'var(--text-muted)' }}>Binance:</span>{' '}
          {bn.raw ? bn.raw : `Pay ID: ${bn.binancePayId || ''} | Name: ${bn.binanceName || ''}`}
        </div>
      )}
    </div>
  );
};

function DashboardContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submissionAmounts, setSubmissionAmounts] = useState({});
  const [editorPayoutAmounts, setEditorPayoutAmounts] = useState({});

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');

  const [activeTab, setActiveTab] = useState('overview');

  const [isPending, startTransition] = useTransition();
  const { currentUser, isSuperAdmin } = useAuth();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const [allUsers, setAllUsers] = useState([]);
  
  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('User');
  const [newUserMsg, setNewUserMsg] = useState('');

  const [payoutPrompt, setPayoutPrompt] = useState({ isOpen: false, sub: null, payoutTK: 0, defaultCutUSD: '', inputValue: '', actionType: '' });

  const handlePayoutConfirm = async () => {
    const { sub, inputValue: cut, payoutTK, actionType } = payoutPrompt;
    setPayoutPrompt(prev => ({ ...prev, isOpen: false }));
    
    if (actionType === 'approve_and_pay') {
      try {
        if (cut && sub.editorEmail) {
          const res = await fetch('/api/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              editorName: sub.editorName || 'Editor',
              editorEmail: sub.editorEmail,
              videoLink: sub.videoLink,
              amount: payoutTK,
              duration: sub.deliveredDuration || 'Project Duration',
              itemTitle: sub.projectFileName || sub.cardTitle || 'Video Editing Service',
              itemDescription: sub.description || 'Professional video editing including cuts, transitions, color grading, sound sync & effects.'
            }),
          });
          
          if (!res.ok) {
            const errData = await res.json();
            showToast(`Failed to send payout receipt: ${errData.message || 'Unknown error'}`, 'error');
            return;
          }
          
          const data = await res.json();
          await markSubmissionPaidAction(sub.id, true, cut, data.invoiceId);
          await approveSubmissionAction(sub.id);
          setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, status: 'approved', isPaid: true, editorInvoiceId: data.invoiceId } : s));
          showToast("Paid to Editor successfully, receipt sent, and moved to Payouts!", "success");
        } else {
          await markSubmissionPaidAction(sub.id, true, cut || null);
          await approveSubmissionAction(sub.id);
          setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, status: 'approved', isPaid: true } : s));
          showToast("Submission marked as paid and moved to Payouts!", "success");
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to update status", "error");
      }
    } else if (actionType === 'just_pay') {
      if (cut) {
        if (!sub.editorEmail) {
          showToast(`Cannot send payout receipt: Editor ${sub.editorName || 'Unknown'} does not have a valid email address.`, 'error');
        } else {
          try {
            const res = await fetch('/api/payout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                editorName: sub.editorName || 'Editor',
                editorEmail: sub.editorEmail,
                videoLink: sub.videoLink,
                amount: payoutTK,
                duration: sub.deliveredDuration || 'Project Duration',
                itemTitle: sub.projectFileName || sub.cardTitle || 'Video Editing Service',
                itemDescription: sub.description || 'Professional video editing including cuts, transitions, color grading, sound sync & effects.'
              }),
            });
            
            if (!res.ok) {
              const errData = await res.json();
              showToast(`Failed to send payout receipt email: ${errData.message || 'Unknown error'}`, 'error');
            } else {
              const data = await res.json();
              await markSubmissionPaidAction(sub.id, true, cut, data.invoiceId);
              setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, isPaid: true, editorInvoiceId: data.invoiceId } : s));
              showToast("Payout receipt email sent successfully to the editor!", 'success');
              return;
            }
          } catch (err) {
            console.error("Failed to send payout receipt", err);
            showToast("Error sending payout receipt email. Please check console.", 'error');
          }
        }
      }
      await markSubmissionPaidAction(sub.id, true, cut || null);
      setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, isPaid: true } : s));
    }
  };

  const [exchangeRate, setExchangeRate] = useState(120);

  // Load from DB on mount and start polling
  useEffect(() => {
    if (currentUser && !currentUser.hasDashboardAccess) {
      router.replace('/projects');
      return;
    }

    setIsMounted(true);
    
    // Fetch live exchange rate
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.BDT) {
          setExchangeRate(data.rates.BDT);
        }
      })
      .catch(err => console.error('Failed to fetch exchange rate:', err));
    getDashboardData().then(data => {
      setClients(data.clients);
      setInvoices(data.invoices);
      setSubmissions(data.submissions || []);
    }).catch(e => {
      console.error('Failed to load dashboard data', e);
    });

    if (isSuperAdmin) {
      getAllUsers().then(users => setAllUsers(users));
    }

    // Auto-polling every 15 seconds for real-time sync feel (using recursive setTimeout to avoid pile-ups)
    let timeoutId;
    let isMountedFlag = true;

    const poll = async () => {
      try {
        const data = await getDashboardData();
        if (isMountedFlag) {
          setClients(prev => JSON.stringify(prev) === JSON.stringify(data.clients) ? prev : data.clients);
          setInvoices(prev => JSON.stringify(prev) === JSON.stringify(data.invoices) ? prev : data.invoices);
          setSubmissions(prev => JSON.stringify(prev) === JSON.stringify(data.submissions) ? prev : (data.submissions || []));
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
      if (isMountedFlag) {
        timeoutId = setTimeout(poll, 15000);
      }
    };

    timeoutId = setTimeout(poll, 15000);

    return () => {
      isMountedFlag = false;
      clearTimeout(timeoutId);
    };
  }, [currentUser, isSuperAdmin, router]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;
    const { signup } = await import('@/actions/auth');
    const res = await signup(newUserEmail, newUserPassword, newUserName, newUserRole);
    if (res.error) {
      setNewUserMsg(res.error);
    } else {
      setNewUserMsg('User added successfully!');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      // Reload users list
      if (isSuperAdmin) {
        const users = await getAllUsers();
        setAllUsers(users);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    const res = await changePassword(newPassword);
    if (res.success) {
      setPasswordMsg('Password changed successfully!');
      setNewPassword('');
    } else {
      setPasswordMsg(res.error || 'Failed to change password');
    }
  };

  const handleToggleAccess = async (userId, hasAccess) => {
    const res = await toggleDashboardAccess(userId, hasAccess);
    if (res.success) {
      setAllUsers(allUsers.map(u => u.id === userId ? { ...u, hasDashboardAccess: hasAccess } : u));
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      const newClient = await addClientAction(newName, newEmail);
      setClients([newClient, ...clients]);
      setNewName('');
      setNewEmail('');
    } catch (err) {
      console.error(err);
      setConfirmDialog({ type: 'alert', title: 'Error', message: 'Failed to add client' });
    }
  };

  const handleRemoveClient = (clientId) => {
    setConfirmDialog({
      type: 'confirm',
      title: 'Remove Client',
      message: 'Are you sure you want to remove this client? Their invoices will remain on the dashboard unless manually deleted.',
      onConfirm: async () => {
        try {
          setClients(clients.filter(c => c.id !== clientId));
          setInvoices(invoices.filter(i => i.clientId !== clientId));
          await deleteClientAction(clientId);
        } catch (err) {
          console.error(err);
          setConfirmDialog({ type: 'alert', title: 'Error', message: 'Failed to delete client' });
          return;
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleUpdateClient = async (clientId, updatedData) => {
    try {
      setClients(clients.map(c => c.id === clientId ? updatedData : c));
      await updateClientAction(clientId, updatedData);
    } catch (err) {
      console.error(err);
      setConfirmDialog({ type: 'alert', title: 'Error', message: 'Failed to update client' });
    }
  };

  const handleInvoiceSent = async (invoiceData) => {
    try {
      const saved = await logInvoiceAction(invoiceData.clientId, invoiceData.amount, invoiceData.profit);
      setInvoices([saved, ...invoices]);
    } catch (err) {
      console.error(err);
      setConfirmDialog({ type: 'alert', title: 'Error', message: 'Invoice email was sent, but failed to log to dashboard.' });
    }
  };

  // Filter Invoices
  const getFilteredInvoices = () => {
    if (filterType === 'all') return invoices;

    const now = new Date();
    let filterDate = new Date();

    if (filterType !== 'custom') {
      const value = parseInt(filterType);
      if (filterType.includes('day')) {
        filterDate.setDate(now.getDate() - value);
      } else if (filterType.includes('month')) {
        filterDate.setMonth(now.getMonth() - value);
      }
    }

    return invoices.filter(inv => {
      // Invoices that don't have a date are treated as 'all time' or just pass if not strict
      if (!inv.date) return filterType === 'all';
      
      const invDate = new Date(inv.date);
      if (filterType === 'custom') {
        const start = startDate ? new Date(startDate) : new Date('2000-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-01-01');
        end.setHours(23, 59, 59, 999);
        return invDate >= start && invDate <= end;
      } else {
        return invDate >= filterDate;
      }
    });
  };

  const filteredInvoices = getFilteredInvoices();

  // Calculate Metrics
  const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const totalProfit = filteredInvoices.reduce((acc, inv) => acc + (inv.profit || 0), 0);
  const editorCut = totalRevenue - totalProfit;

  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  const getClientRanking = () => {
    const statsByClient = {};
    filteredInvoices.forEach(inv => {
      if (!statsByClient[inv.clientId]) {
        statsByClient[inv.clientId] = { revenue: 0, invoiceCount: 0 };
      }
      statsByClient[inv.clientId].revenue += (inv.amount || 0);
      statsByClient[inv.clientId].invoiceCount += 1;
    });

    const ranking = Object.keys(statsByClient).map(clientId => {
      const client = clients.find(c => c.id === clientId);
      return {
        id: clientId,
        name: client ? client.name : 'Unknown Client',
        revenue: statsByClient[clientId].revenue,
        invoiceCount: statsByClient[clientId].invoiceCount
      };
    });

    return ranking.sort((a, b) => b.revenue - a.revenue);
  };

  const handleDownloadCSV = (e) => {
    if (e) e.preventDefault();
    if (filteredInvoices.length === 0) {
      setConfirmDialog({
        type: 'alert',
        title: 'No Data',
        message: 'No data available to export for the selected date range.'
      });
      return;
    }
    
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalEditorCut = 0;

    const rows = filteredInvoices.map(inv => {
      const client = clients.find(c => c.id === inv.clientId);
      const clientName = client ? client.name.replace(/"/g, '""') : 'Unknown Client';
      const revenue = inv.amount || 0;
      const profit = inv.profit || 0;
      const editorCut = revenue - profit;
      
      totalRevenue += revenue;
      totalProfit += profit;
      totalEditorCut += editorCut;

      const date = new Date(inv.date).toLocaleDateString();
      return `"${date}","${clientName}","${revenue.toFixed(2)}","${profit.toFixed(2)}","${editorCut.toFixed(2)}"`;
    });

    const reportDate = new Date().toLocaleDateString();
    
    // Build a professional looking CSV structure
    const filterText = filterType === 'all' ? 'All Time' : filterType === 'month' ? 'This Month' : 'This Year';
    const csvContentArray = [
      `"FINANCIAL REPORT"`,
      `"Generated On:","${reportDate}"`,
      `"Filter Applied:","${filterText}"`,
      `""`,
      `"SUMMARY"`,
      `"Total Revenue:","$${totalRevenue.toFixed(2)}"`,
      `"Total Profit:","$${totalProfit.toFixed(2)}"`,
      `"Total Editor Cut:","$${totalEditorCut.toFixed(2)}"`,
      `""`,
      `"INVOICE DETAILS"`,
      `"Date","Client Name","Revenue ($)","Profit ($)","Editor Cut ($)"`,
      ...rows,
      `""`,
      `"END OF REPORT"`
    ];

    const csvContent = csvContentArray.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.body.removeChild(link);
  };
  const clientRanking = getClientRanking();

  if (!isMounted || (currentUser && !currentUser.hasDashboardAccess)) return <div className={styles.pageContainer}></div>; // Avoid hydration mismatch and unauthorized UI flash

  return (
    <>
      <ScrollProgress />
      <FloatingElements />
      <MenuOverlay hideRightItems={true} />
      
      <div className={styles.pageContainer}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ maxWidth: '1200px', margin: '0 auto 10px auto', display: 'flex' }}
        >
          <a href="/projects" style={{ color: 'var(--text-grey)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            ← Back to Project
          </a>
        </motion.div>
        
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Dashboard
        </motion.h1>

        <motion.div className={styles.tabBar} initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}}>
          {['overview', 'clients', 'submissions', 'payouts', ...(isSuperAdmin ? ['team'] : []), 'settings'].map(tab => (
            <div 
              key={tab} 
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <motion.div className={styles.activeTabIndicator} layoutId="activeTab" transition={{type: 'spring', stiffness: 500, damping: 30}} />
              )}
              {tab === 'overview' && <span className={styles.tabIcon}><BarChart2 size={16} /></span>}
              {tab === 'clients' && <span className={styles.tabIcon}><Briefcase size={16} /></span>}
              {tab === 'submissions' && <span className={styles.tabIcon}><CheckSquare size={16} /></span>}
              {tab === 'payouts' && <span className={styles.tabIcon}><DollarSign size={16} /></span>}
              {tab === 'team' && <span className={styles.tabIcon}><Users size={16} /></span>}
              {tab === 'settings' && <span className={styles.tabIcon}><Settings size={16} /></span>}
              <span style={{ textTransform: 'capitalize' }}>{tab}</span>
            </div>
          ))}
        </motion.div>

        <FramerAnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Filter Section */}
              <div className={styles.filterBar}>
        <CustomSelect 
          value={filterType}
          onChange={(val) => setFilterType(val)}
          options={filterOptions}
        />

        {filterType === 'custom' && (
          <motion.div 
            className={styles.customDateGroup}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
          >
            <DatePicker 
              value={startDate}
              onChange={(val) => setStartDate(val)}
              placeholder="Start Date"
            />
            <span className={styles.dateSeparator}>to</span>
            <DatePicker 
              value={endDate}
              onChange={(val) => setEndDate(val)}
              placeholder="End Date"
            />
          </motion.div>
        )}
        
        <button type="button" className={styles.exportBtn} onClick={handleDownloadCSV}>
          <Download size={16} /> Export CSV
        </button>
              </div>

              {/* Metrics Section (Bento Grid) */}
              <div className={styles.bentoGrid}>
                <div className={`${styles.metricCard} ${styles.revenue}`} style={{ gridColumn: 'span 4' }}>
                  <div className={styles.metricLabel}>Total Revenue</div>
                  <h2 className={styles.metricValue}><span>$</span>{totalRevenue.toLocaleString()}</h2>
                  <svg className={styles.sparkline} viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path className={styles.sparklinePath} d="M0,30 Q10,20 20,25 T40,15 T60,20 T80,5 T100,0" fill="none" stroke="var(--emerald)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
                
                <div className={`${styles.metricCard} ${styles.profit}`} style={{ gridColumn: 'span 4' }}>
                  <div className={styles.metricLabel}>Total Profit</div>
                  <h2 className={styles.metricValue}><span>$</span>{totalProfit.toLocaleString()}</h2>
                  <svg className={styles.sparkline} viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path className={styles.sparklinePath} d="M0,30 Q15,25 30,10 T60,20 T100,5" fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>

                <div className={`${styles.metricCard} ${styles.margin}`} style={{ gridColumn: 'span 4' }}>
                  <div className={styles.metricLabel}>Profit Margin</div>
                  <h2 className={styles.metricValue}>{profitMargin}<span>%</span></h2>
                  <svg className={styles.sparkline} viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path className={styles.sparklinePath} d="M0,25 Q20,10 40,20 T80,5 T100,10" fill="none" stroke="#f59e0b" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>

                <div className={`${styles.metricCard} ${styles.editor}`} style={{ gridColumn: 'span 12' }}>
                  <div className={styles.metricLabel}>Editor Cut</div>
                  <h2 className={styles.metricValue}><span>$</span>{editorCut.toLocaleString()}</h2>
                  <svg className={styles.sparkline} viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path className={styles.sparklinePath} d="M0,20 Q20,30 40,15 T70,10 T100,25" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              </div>

              {/* Analytics Charts Section */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Analytics</h3>
                
                <RechartsComponents>
                  {({ ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend }) => {
                    // Build monthly revenue/profit trend data
                    const monthlyData = (() => {
                      const map = {};
                      filteredInvoices.forEach(inv => {
                        if (!inv.date) return;
                        const d = new Date(inv.date);
                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        if (!map[key]) map[key] = { month: key, revenue: 0, profit: 0, editorCut: 0, count: 0 };
                        map[key].revenue += (inv.amount || 0);
                        map[key].profit += (inv.profit || 0);
                        map[key].editorCut += ((inv.amount || 0) - (inv.profit || 0));
                        map[key].count += 1;
                      });
                      return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).map(item => ({
                        ...item,
                        label: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                      }));
                    })();

                    // Build client revenue share for pie chart
                    const clientPieData = (() => {
                      const map = {};
                      filteredInvoices.forEach(inv => {
                        const client = clients.find(c => c.id === inv.clientId);
                        const name = client ? client.name : 'Unknown';
                        if (!map[name]) map[name] = 0;
                        map[name] += (inv.amount || 0);
                      });
                      return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
                    })();

                    const PIE_COLORS = ['#34d399', '#a855f7', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

                    const chartCardStyle = {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px',
                      padding: '24px',
                      flex: 1,
                      minWidth: 0,
                    };

                    const chartTitleStyle = {
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-grey)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '16px',
                    };

                    const customTooltipStyle = {
                      background: 'rgba(15,19,25,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    };

                    const CustomTooltip = ({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div style={customTooltipStyle}>
                          <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{label}</p>
                          {payload.map((entry, i) => (
                            <p key={i} style={{ color: entry.color, fontSize: '12px', margin: '2px 0' }}>
                              {entry.name}: ${entry.value.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      );
                    };

                    const PieTooltip = ({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div style={customTooltipStyle}>
                          <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{payload[0].name}</p>
                          <p style={{ color: payload[0].payload.fill || 'var(--emerald)', fontSize: '12px', margin: '4px 0 0' }}>
                            ${payload[0].value.toLocaleString()}
                          </p>
                        </div>
                      );
                    };

                    if (filteredInvoices.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', color: 'var(--text-grey)', padding: '40px 0' }}>
                          No invoice data to display charts. Start sending invoices to see analytics.
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Revenue & Profit Trend — Area Chart */}
                        <div style={chartCardStyle}>
                          <div style={chartTitleStyle}>Revenue & Profit Trend</div>
                          <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                              <defs>
                                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
                              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#34d399" fill="url(#gradRevenue)" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} />
                              <Area type="monotone" dataKey="profit" name="Profit" stroke="#a855f7" fill="url(#gradProfit)" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          {/* Monthly Breakdown — Bar Chart */}
                          <div style={{ ...chartCardStyle, minWidth: '300px' }}>
                            <div style={chartTitleStyle}>Monthly Breakdown</div>
                            <ResponsiveContainer width="100%" height={260}>
                              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="profit" name="Profit" fill="#34d399" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="editorCut" name="Editor Cut" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Client Revenue Share — Pie Chart */}
                          <div style={{ ...chartCardStyle, minWidth: '280px', maxWidth: '400px' }}>
                            <div style={chartTitleStyle}>Client Revenue Share</div>
                            <ResponsiveContainer width="100%" height={260}>
                              <PieChart>
                                <Pie
                                  data={clientPieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={95}
                                  paddingAngle={3}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {clientPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                                <Legend 
                                  layout="vertical" 
                                  align="right" 
                                  verticalAlign="middle" 
                                  wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '20px' }} 
                                  formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </RechartsComponents>
              </div>

              {/* Client Ranking Section */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Top Paying Clients</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clientRanking.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>No data available for the selected period.</div>
                  ) : (
                    clientRanking.map((client, idx) => (
                      <div key={client.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : idx === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                            {idx + 1}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'var(--text-white)', fontWeight: 500 }}>{client.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{client.invoiceCount} Payments</span>
                          </div>
                        </div>
                        <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>${client.revenue.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div 
              key="clients"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Add Client Form */}
              <form 
                className={styles.addForm} 
                onSubmit={handleAddClient}
                style={{ margin: '0 auto 2rem' }}
              >
        <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Client Command Module</h3>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.input}
            placeholder=" "
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <label className={styles.label}>Client Name</label>
        </div>
        <div className={styles.inputGroup}>
          <input
            type="email"
            className={styles.input}
            placeholder=" "
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <label className={styles.label}>Client Email</label>
        </div>
        <button type="submit" className={styles.button}>
          <Plus size={18} />
          Add Client
        </button>
              </form>

              {/* Clients Grid */}
              <div className={styles.clientsGrid}>
                <AnimatePresence>
                  {clients.map(client => (
                    <ClientCard 
                      key={client.id} 
                      client={client} 
                      onInvoiceSent={handleInvoiceSent} 
                      onRemove={handleRemoveClient}
                      onUpdateClient={handleUpdateClient}
                    />
                  ))}
                </AnimatePresence>
                {clients.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    No clients added yet. Add a client above to start sending invoices!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'submissions' && (
            <motion.div 
              key="submissions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* REVIEWING SUBMISSIONS */}
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Client Review</h3>
                  {submissions.filter(s => s.status === 'reviewing').length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>No project deliveries in client review.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {submissions.filter(s => s.status === 'reviewing').map(sub => (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{sub.projectFileName || 'Unnamed Project'}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Client / Card Title: <strong style={{ color: '#fff' }}>{sub.clientName || sub.cardTitle}</strong></span>
                            {sub.clientPaymentAmount != null && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Client Payment Amount: <strong style={{ color: '#fff' }}>${sub.clientPaymentAmount}</strong></span>
                            )}
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Editor: {sub.editorName ? `${sub.editorName} (${sub.editorEmail})` : sub.editorEmail}</span>
                            <EditorPaymentDetailsView bank={sub.editorBankDetails} rocket={sub.editorRocketAccount} binance={sub.editorBinancePayId} />
                            {sub.deliveredDuration && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Duration: <strong style={{ color: '#fff' }}>{sub.deliveredDuration} minutes</strong>
                              </span>
                            )}
                            {(sub.ratePerMinute && sub.deliveredDuration) && (
                              <span style={{ color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                                Payout: {Math.round((sub.ratePerMinute * sub.deliveredDuration) - ((sub.ratePerMinute * sub.deliveredDuration) * ((sub.penaltyPercent || 0) / 100)))} TK 
                                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                                  (@ {sub.ratePerMinute} TK/min {sub.penaltyPercent ? `| -${sub.penaltyPercent}% penalty` : ''})
                                </span>
                              </span>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Link:</span>
                              <a href={sub.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--emerald)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                {sub.videoLink}
                              </a>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'right' }}>
                              Submitted: <br/>
                              {new Date(sub.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', alignItems: 'flex-end' }}>
                              <span style={{ color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 500 }}>
                                Video and invoice sent to the client, it is reviewing by client.
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Payment after video review and revision and after all video changes.
                              </span>
                              <button 
                                className={styles.button}
                                style={{ padding: '6px 12px', background: 'var(--emerald)', color: '#000', border: 'none', fontSize: '0.85rem', marginTop: '4px' }}
                                onClick={() => {
                                  const payoutTK = Math.round((sub.ratePerMinute * sub.deliveredDuration) - ((sub.ratePerMinute * sub.deliveredDuration) * ((sub.penaltyPercent || 0) / 100)));
                                  const defaultCutUSD = (payoutTK / exchangeRate).toFixed(2);
                                  setPayoutPrompt({
                                    isOpen: true,
                                    sub,
                                    payoutTK,
                                    defaultCutUSD,
                                    inputValue: defaultCutUSD,
                                    actionType: 'approve_and_pay'
                                  });
                                }}
                              >
                                Paid to Editor
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payouts' && (
            <motion.div 
              key="payouts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className={styles.modernSearch}>
                    <Search size={16} className={styles.modernSearchIcon} />
                    <input
                      type="text"
                      placeholder="Search payouts by client or editor name/email..."
                      value={submissionSearch}
                      onChange={e => setSubmissionSearch(e.target.value)}
                      className={styles.modernSearchInput}
                    />
                  </div>
                </div>
                  
                {/* COMPLETED SUBMISSIONS / PAYOUTS */}
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Completed Projects (Payouts)</h3>
                  {submissions.filter(s => s.status === 'approved' && (s.clientName?.toLowerCase().includes(submissionSearch.toLowerCase()) || s.editorName?.toLowerCase().includes(submissionSearch.toLowerCase()) || s.editorEmail?.toLowerCase().includes(submissionSearch.toLowerCase()))).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>No completed projects found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {submissions.filter(s => s.status === 'approved' && (s.clientName?.toLowerCase().includes(submissionSearch.toLowerCase()) || s.editorName?.toLowerCase().includes(submissionSearch.toLowerCase()) || s.editorEmail?.toLowerCase().includes(submissionSearch.toLowerCase()))).map(sub => (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', opacity: 0.8 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{sub.cardTitle}</span>
                              <span style={{fontSize: '11px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--emerald)', padding: '2px 6px', borderRadius: '4px'}}>Approved</span>
                              {sub.isPaid ? (
                                <span style={{fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px'}}>Paid</span>
                              ) : (
                                <span style={{fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px'}}>Unpaid</span>
                              )}
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Client: <strong style={{ color: '#fff' }}>{sub.clientName}</strong></span>
                            {sub.clientPaymentAmount != null && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Client Payment Amount: <strong style={{ color: '#fff' }}>${sub.clientPaymentAmount}</strong></span>
                            )}
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Editor: {sub.editorName ? `${sub.editorName} (${sub.editorEmail})` : sub.editorEmail}</span>
                            <EditorPaymentDetailsView bank={sub.editorBankDetails} rocket={sub.editorRocketAccount} binance={sub.editorBinancePayId} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Duration: <strong style={{ color: '#fff' }}>{sub.deliveredDuration || 0} minutes</strong></span>
                            {(sub.ratePerMinute && sub.deliveredDuration) && (
                              <span style={{ color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                                Payout: {Math.round((sub.ratePerMinute * sub.deliveredDuration) - ((sub.ratePerMinute * sub.deliveredDuration) * ((sub.penaltyPercent || 0) / 100)))} TK (@ {sub.ratePerMinute} TK/min )
                              </span>
                            )}
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Link: <a href={sub.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--emerald)', textDecoration: 'none' }}>{sub.videoLink}</a>
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Client Invoice ID: <strong style={{ color: '#fff' }}>{sub.clientInvoiceId || 'N/A'}</strong></span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Editor Invoice ID: <strong style={{ color: '#fff' }}>{sub.editorInvoiceId || 'N/A'}</strong></span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'right' }}>
                              Submitted: <br/>
                              {new Date(sub.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button 
                              className={styles.button}
                              style={{ padding: '6px 12px', background: sub.isPaid ? 'transparent' : 'var(--emerald)', color: sub.isPaid ? 'var(--text-muted)' : '#000', border: sub.isPaid ? '1px solid rgba(255,255,255,0.1)' : 'none', minWidth: '100px', fontSize: '0.85rem' }}
                              onClick={() => {
                                if (sub.isPaid) {
                                  // Marking as UNPAID
                                  setConfirmDialog({
                                    type: 'confirm',
                                    isDanger: true,
                                    title: 'Mark as Unpaid',
                                    message: 'Are you sure you want to mark this as Unpaid?\n\nThis will remove the payment status.',
                                    confirmText: 'Mark Unpaid',
                                    onConfirm: async () => {
                                      await markSubmissionPaidAction(sub.id, false, null);
                                      setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, isPaid: false } : s));
                                      setConfirmDialog(null);
                                    }
                                  });
                                  return;
                                }

                                // Marking as PAID
                                const payoutTK = Math.round((sub.ratePerMinute * sub.deliveredDuration) - ((sub.ratePerMinute * sub.deliveredDuration) * ((sub.penaltyPercent || 0) / 100)));
                                const defaultCutUSD = (payoutTK / exchangeRate).toFixed(2);
                                setPayoutPrompt({
                                  isOpen: true,
                                  sub,
                                  payoutTK,
                                  defaultCutUSD,
                                  inputValue: defaultCutUSD,
                                  actionType: 'just_pay'
                                });
                              }}
                            >
                              {sub.isPaid ? 'Mark Unpaid' : 'Mark as Paid'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'team' && isSuperAdmin && (
            <motion.div 
              key="team"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={styles.teamGrid}
            >
              <form 
                className={styles.addForm} 
                onSubmit={handleAddUser}
                style={{ margin: 0, width: '100%', maxWidth: 'none', position: 'relative', zIndex: 10 }}
              >
                <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Add New User</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className={styles.inputGroup} style={{ margin: 0 }}>
                    <input type="text" className={styles.input} placeholder=" " value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                    <label className={styles.label}>Name</label>
                  </div>
                  <div className={styles.inputGroup} style={{ margin: 0 }}>
                    <input type="email" className={styles.input} placeholder=" " value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                    <label className={styles.label}>Email</label>
                  </div>
                  <div className={styles.inputGroup} style={{ margin: 0 }}>
                    <input type="password" className={styles.input} placeholder=" " value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
                    <label className={styles.label}>Password</label>
                  </div>
                  <div className={styles.inputGroup} style={{ margin: 0 }}>
                    <CustomSelect 
                      value={newUserRole} 
                      onChange={(val) => setNewUserRole(val)} 
                      options={[
                        { value: 'Viewer', label: 'Viewer' },
                        { value: 'Editor', label: 'Editor' },
                        { value: 'Admin', label: 'Admin' }
                      ]}
                      className={styles.input}
                      style={{ padding: '0 12px', height: '52px' }}
                    />
                  </div>
                </div>
                <button type="submit" className={styles.button} style={{ marginTop: '16px' }}>
                  <Plus size={18} /> Add User
                </button>
                {newUserMsg && <p style={{ marginTop: '10px', color: newUserMsg.includes('success') ? '#10b981' : '#ef4444' }}>{newUserMsg}</p>}
              </form>

              <div 
                className={styles.addForm} 
                style={{ margin: 0, maxHeight: '600px', overflowY: 'auto', width: '100%', maxWidth: 'none', position: 'relative', zIndex: 1 }}
              >
                <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Dashboard Users</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allUsers.filter(u => u.hasDashboardAccess || ['Admin', 'Super Admin', 'Editor'].includes(u.role)).map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff0a', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `url(${u.avatarUrl}) center/cover` }}></div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '14px' }}>{u.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '12px' }}>{u.email}</div>
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={u.hasDashboardAccess} 
                          onChange={(e) => handleToggleAccess(u.id, e.target.checked)} 
                          style={{ marginRight: '8px', cursor: 'pointer' }}
                        />
                        <span style={{ color: '#fff', fontSize: '12px' }}>Access</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form 
                className={styles.addForm} 
                onSubmit={handleChangePassword}
              >
                <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)' }}>Change Password</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder=" "
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <label className={styles.label}>New Password</label>
                </div>
                <button type="submit" className={styles.button}>
                  Save Password
                </button>
                {passwordMsg && <p style={{ marginTop: '10px', color: passwordMsg.includes('success') ? '#10b981' : '#ef4444' }}>{passwordMsg}</p>}
              </form>
            </motion.div>
          )}
        </FramerAnimatePresence>

        <AnimatePresence>
          {payoutPrompt.isOpen && (
            <div className="invite-modal-overlay">
              <motion.div 
                className="invite-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                style={{ maxWidth: '400px', width: '100%', padding: '32px 24px', position: 'relative' }}
              >
                <button 
                  onClick={() => setPayoutPrompt(prev => ({ ...prev, isOpen: false }))}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer' }}
                >
                  <XCircle size={20} />
                </button>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#fff' }}>Confirm Editor Payout</h3>
                <div style={{ marginBottom: '20px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <p style={{ margin: '0 0 8px 0' }}>Payout is <strong>{payoutPrompt.payoutTK} TK</strong>.</p>
                  <p style={{ margin: 0 }}>Auto-converted to USD (1 USD = {exchangeRate.toFixed(2)} TK): <strong>${payoutPrompt.defaultCutUSD}</strong>.</p>
                </div>
                <div className={styles.inputGroup} style={{ marginBottom: '24px' }}>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.input}
                    placeholder=" "
                    value={payoutPrompt.inputValue}
                    onChange={(e) => setPayoutPrompt(prev => ({ ...prev, inputValue: e.target.value }))}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePayoutConfirm();
                    }}
                  />
                  <label className={styles.label}>Enter Editor Cut in USD (for Profit calculation)</label>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setPayoutPrompt(prev => ({ ...prev, isOpen: false }))}
                    className="kb-toolbar-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePayoutConfirm}
                    className="kb-toolbar-btn kb-toolbar-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Save & Pay
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmModal
          isOpen={!!confirmDialog}
          type={confirmDialog?.type}
          isDanger={confirmDialog?.isDanger ?? true}
          title={confirmDialog?.title}
          message={confirmDialog?.message}
          confirmText={confirmDialog?.confirmText}
          onConfirm={() => {
            if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
            else setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
        
        {/* Modern Toast Popup */}
        <FramerAnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              style={{
                position: 'fixed',
                bottom: '40px',
                right: '40px',
                zIndex: 9999,
                background: toast.type === 'error' ? '#ef4444' : '#10b981',
                color: toast.type === 'error' ? '#fff' : '#000',
                padding: '16px 24px',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '15px'
              }}
            >
              {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
              {toast.message}
            </motion.div>
          )}
        </FramerAnimatePresence>
      </div>
      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate isDashboard={true} title="Dashboard Login" subtitle="Sign in to manage Monolith Workflow">
      <DashboardContent />
    </AuthGate>
  );
}
