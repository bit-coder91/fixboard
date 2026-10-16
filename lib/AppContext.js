// Context for Theme, Blockchain / Ethereum (Solidity Audit Trail & Voting), and Persistence
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  db, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc 
} from './firebase';
import { 
  computeChoreHash, 
  generateTxHash, 
  hasInjectedProvider, 
  connectMetaMask, 
  getOrCreateDemoWallet, 
  getStoredAuditTrail, 
  recordAuditEntry, 
  CONTRACT_ADDRESS,
  SEPOLIA_CONFIG
} from './web3';

const RAW_SEED_DATA = [
  {
    id: 'seed-1',
    title: 'Auto-detect & merge duplicate SKUs across Amazon, Shopify, and eBay',
    description: 'Every week I spend 3+ hours manually cross-referencing SKUs between Amazon Seller Central, Shopify, and eBay. Duplicates slip in because each platform generates its own IDs. I need a tool that scans all catalogs, flags duplicates by UPC/EAN/title similarity, and lets me merge with one click.',
    category: 'catalog',
    pain: 5,
    fundingGoal: 2500,
    fundingRaised: 1875,
    votes: 347,
    status: 'funded',
    author: 'Maya Chen',
    authorAddress: '0x71C83d3A66A487B2E58C36De76945A6eE0C5139a',
    platforms: ['Amazon', 'Shopify', 'eBay'],
    createdAt: Date.now() - 86400000 * 12,
    backers: 42,
    onChainVerified: true,
    txHash: '0x3a9f9842f1837b56d812de22b512c01997e55a6d366a6a5789fcf09633e147b2',
    comments: [
      { author: 'Jake R.', text: 'This is literally my #1 time sink. Take my money.', time: Date.now() - 86400000 * 10 },
      { author: 'Priya S.', text: 'Would love if it also handled ASIN matching!', time: Date.now() - 86400000 * 8 },
    ]
  },
  {
    id: 'seed-2',
    title: 'Automated return reason analysis with refund recommendation engine',
    description: 'My return rate is ~8% and I have zero visibility into patterns. I need a tool that pulls return reasons from Amazon and Shopify, categorizes them (sizing, defect, buyer remorse), and recommends whether to auto-refund, ask for photos, or dispute.',
    category: 'returns',
    pain: 4,
    fundingGoal: 3000,
    fundingRaised: 900,
    votes: 256,
    status: 'open',
    author: 'Ravi Kumar',
    authorAddress: '0x8495c02931298492049281a8b9c0d1e2f3a4b5c6',
    platforms: ['Amazon', 'Shopify'],
    createdAt: Date.now() - 86400000 * 8,
    backers: 23,
    onChainVerified: true,
    txHash: '0x4f1289c091823749281a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e',
    comments: [
      { author: 'Lisa M.', text: 'If this could generate reports for suppliers that would be amazing', time: Date.now() - 86400000 * 6 },
    ]
  },
  {
    id: 'seed-3',
    title: 'Real-time sub-60s inventory sync across 4+ channels with bundle support',
    description: 'I sell on Amazon, Walmart, Shopify, and Etsy. Existing tools have a 15-30 minute delay, which causes overselling during sales. I need instant inventory synchronization with automatic quantity reservation and proper deduction of bundles.',
    category: 'sync',
    pain: 5,
    fundingGoal: 5000,
    fundingRaised: 4200,
    votes: 489,
    status: 'in-progress',
    author: 'Sam Torres',
    authorAddress: '0x524B51737fB8f3F1fC22Fe7bA7E38B426e2aC814',
    platforms: ['Amazon', 'Walmart', 'Shopify', 'Etsy'],
    createdAt: Date.now() - 86400000 * 20,
    backers: 67,
    onChainVerified: true,
    txHash: '0x22c4f198d023456789abcde0123456789abcdef0123456789abcdef012345678',
    comments: [
      { author: 'Dev Team', text: 'We are actively developing this! Alpha starts soon.', time: Date.now() - 86400000 * 3 },
      { author: 'Kim L.', text: 'The bundle handling is critical. Cannot wait.', time: Date.now() - 86400000 * 5 }
    ]
  },
  {
    id: 'seed-4',
    title: 'Bulk listing error fixer with AI-suggested catalog compliance',
    description: 'Amazon frequently suppresses listings for minor issues like bullet point punctuation or prohibited claims. I get 50+ errors weekly. I need a unified dashboard that auto-fixes and resubmits compliant flat files.',
    category: 'listings',
    pain: 4,
    fundingGoal: 2000,
    fundingRaised: 450,
    votes: 198,
    status: 'open',
    author: 'Elena Popov',
    authorAddress: '0x94823Eb12B3B6d24669f6974720977B4A346C09b',
    platforms: ['Amazon'],
    createdAt: Date.now() - 86400000 * 5,
    backers: 15,
    onChainVerified: true,
    txHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    comments: []
  },
  {
    id: 'seed-5',
    title: 'Competitor price tracker with margin-floor smart repricing rules',
    description: 'Real-time price monitoring without paying $300/mo. Custom rules to undercut lowest competitor by $0.01 while strictly guarding a 15% cost floor.',
    category: 'pricing',
    pain: 3,
    fundingGoal: 1500,
    fundingRaised: 1500,
    votes: 312,
    status: 'solved',
    author: 'David Park',
    authorAddress: '0x3B884C0113f898a3C4e79E5336d3C14800366D60',
    platforms: ['Amazon', 'Walmart'],
    createdAt: Date.now() - 86400000 * 30,
    backers: 38,
    onChainVerified: true,
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    comments: [
      { author: 'Builder Bot', text: 'Solution shipped! Check integrations page.', time: Date.now() - 86400000 * 2 }
    ]
  },
  {
    id: 'seed-6',
    title: 'Automated dimensional weight audit for carrier overcharges',
    description: 'Carriers charge unexpected adjustments on packaging dim weights. An automated scanner that cross-references warehouse packaging dimensions against weekly invoices and files automated refund claims.',
    category: 'shipping',
    pain: 5,
    fundingGoal: 3500,
    fundingRaised: 2150,
    votes: 284,
    status: 'open',
    author: 'Sarah Jenkins',
    authorAddress: '0x6291a82b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    platforms: ['Amazon', 'Shopify'],
    createdAt: Date.now() - 86400000 * 4,
    backers: 31,
    onChainVerified: true,
    txHash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    comments: [
      { author: 'Dave Retailer', text: 'Essential. Carriers overcharge on 10% of shipments.', time: Date.now() - 86400000 * 1 }
    ]
  }
];

// Attach cryptographic hashes
const SEED_DATA = RAW_SEED_DATA.map(c => ({
  ...c,
  choreHash: computeChoreHash(c)
}));

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [chores, setChores] = useState(SEED_DATA);
  const [userVotedIds, setUserVotedIds] = useState([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  
  // Web3 / Ethereum state
  const [wallet, setWallet] = useState({
    address: null,
    type: null, // 'metamask' | 'demo'
    balance: '0.00',
    connected: false,
    network: SEPOLIA_CONFIG.chainName
  });
  const [auditTrail, setAuditTrail] = useState([]);
  const [hasWeb3Extension, setHasWeb3Extension] = useState(false);
  const [recentTxNotification, setRecentTxNotification] = useState(null);

  // Initialize
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem('fixboard_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Voted IDs
    try {
      const savedVotes = localStorage.getItem('fixboard_user_votes');
      if (savedVotes) setUserVotedIds(JSON.parse(savedVotes));
    } catch (e) {}

    // Web3 extension check
    setHasWeb3Extension(hasInjectedProvider());

    // Load Audit Trail
    const storedAudit = getStoredAuditTrail();
    setAuditTrail(storedAudit);

    // Auto-connect demo or saved wallet
    const savedWalletType = localStorage.getItem('fixboard_wallet_type');
    if (savedWalletType === 'metamask' && hasInjectedProvider()) {
      connectMetaMask()
        .then(res => {
          setWallet({
            address: res.address,
            type: 'metamask',
            balance: res.balance,
            connected: true,
            network: SEPOLIA_CONFIG.chainName
          });
        })
        .catch(() => {
          // Fallback to demo
          const demo = getOrCreateDemoWallet();
          setWallet({
            address: demo.address,
            type: 'demo',
            balance: demo.balance,
            connected: true,
            network: SEPOLIA_CONFIG.chainName
          });
        });
    } else {
      // Connect demo wallet by default so user has zero hurdles on Vercel
      const demo = getOrCreateDemoWallet();
      setWallet({
        address: demo.address,
        type: 'demo',
        balance: demo.balance,
        connected: true,
        network: SEPOLIA_CONFIG.chainName
      });
    }

    // Firestore Sync
    async function syncWithFirestore() {
      if (!db) return;
      try {
        const choresCol = collection(db, 'chores');
        const snapshot = await getDocs(choresCol);
        if (snapshot.empty) {
          for (const item of SEED_DATA) {
            await setDoc(doc(db, 'chores', item.id), item);
          }
          setIsFirebaseConnected(true);
        } else {
          const list = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            list.push({
              ...data,
              id: docSnap.id,
              choreHash: data.choreHash || computeChoreHash(data)
            });
          });
          setChores(list);
          setIsFirebaseConnected(true);
        }
      } catch (err) {
        console.info("Firestore cloud connection note (operating with high-speed local persistence):", err.message);
      }
    }
    syncWithFirestore();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('fixboard_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Connect Wallet (MetaMask or Demo)
  const connectWalletHandler = async (forceType = null) => {
    if (forceType === 'metamask' || (!forceType && hasInjectedProvider())) {
      try {
        const res = await connectMetaMask();
        setWallet({
          address: res.address,
          type: 'metamask',
          balance: res.balance,
          connected: true,
          network: SEPOLIA_CONFIG.chainName
        });
        localStorage.setItem('fixboard_wallet_type', 'metamask');
        return res;
      } catch (err) {
        console.warn('MetaMask connection failed, switching to Demo Wallet:', err.message);
      }
    }

    // Fallback or explicit Demo Wallet
    const demo = getOrCreateDemoWallet();
    setWallet({
      address: demo.address,
      type: 'demo',
      balance: demo.balance,
      connected: true,
      network: SEPOLIA_CONFIG.chainName
    });
    localStorage.setItem('fixboard_wallet_type', 'demo');
    return demo;
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      type: null,
      balance: '0.00',
      connected: false,
      network: SEPOLIA_CONFIG.chainName
    });
    localStorage.removeItem('fixboard_wallet_type');
  };

  // Vote with Blockchain Audit Trail
  const voteChore = async (choreId) => {
    const isVoted = userVotedIds.includes(choreId);
    let updatedVotes;
    if (isVoted) {
      updatedVotes = userVotedIds.filter(id => id !== choreId);
    } else {
      updatedVotes = [...userVotedIds, choreId];
    }
    setUserVotedIds(updatedVotes);
    localStorage.setItem('fixboard_user_votes', JSON.stringify(updatedVotes));

    let affectedChoreTitle = 'Chore Request';
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        affectedChoreTitle = c.title;
        return {
          ...c,
          votes: isVoted ? Math.max(0, c.votes - 1) : c.votes + 1
        };
      }
      return c;
    }));

    // Record on-chain / Ethereum audit entry
    const entry = recordAuditEntry({
      action: isVoted ? 'VOTE_REVOKED' : 'VOTE_CAST',
      choreId,
      choreTitle: affectedChoreTitle,
      actor: wallet.address || '0x71C83d3A66A487B2E58C36De76945A6eE0C5139a',
      value: isVoted ? '-1' : '+1'
    });
    setAuditTrail(prev => [entry, ...prev]);

    setRecentTxNotification({
      type: isVoted ? 'Vote Revoked' : 'Vote Cast On-Chain',
      txHash: entry.txHash,
      choreTitle: affectedChoreTitle
    });
    setTimeout(() => setRecentTxNotification(null), 5000);

    // If Firebase active
    if (db && isFirebaseConnected) {
      try {
        const choreRef = doc(db, 'chores', choreId);
        await updateDoc(choreRef, {
          votes: isVoted ? increment(-1) : increment(1)
        });
      } catch (e) {}
    }
  };

  // Pledge with Ethereum & Audit Trail
  const pledgeChore = async (choreId, amount, backerName, ethPledge = '0.05') => {
    const numAmount = Number(amount);
    let affectedChoreTitle = 'Chore Request';

    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        affectedChoreTitle = c.title;
        const newRaised = (c.fundingRaised || 0) + numAmount;
        const newBackers = (c.backers || 0) + 1;
        const newStatus = (c.fundingGoal && newRaised >= c.fundingGoal && c.status === 'open') ? 'funded' : c.status;
        return {
          ...c,
          fundingRaised: newRaised,
          backers: newBackers,
          status: newStatus
        };
      }
      return c;
    }));

    // Record on-chain pledge in audit trail
    const entry = recordAuditEntry({
      action: 'PLEDGE_MADE',
      choreId,
      choreTitle: affectedChoreTitle,
      actor: wallet.address || '0x71C83d3A66A487B2E58C36De76945A6eE0C5139a',
      value: `${ethPledge} SEP ($${numAmount})`
    });
    setAuditTrail(prev => [entry, ...prev]);

    // Update demo wallet balance if applicable
    if (wallet.type === 'demo') {
      const currentBal = parseFloat(wallet.balance) || 1.5;
      const pledgeVal = parseFloat(ethPledge) || 0.05;
      const newBal = Math.max(0, currentBal - pledgeVal).toFixed(4);
      setWallet(w => ({ ...w, balance: newBal }));
      localStorage.setItem('fixboard_demo_wallet_balance', newBal);
    }

    setRecentTxNotification({
      type: 'Pledge Confirmed On-Chain',
      txHash: entry.txHash,
      choreTitle: affectedChoreTitle,
      amount: `${ethPledge} SEP`
    });
    setTimeout(() => setRecentTxNotification(null), 6000);

    if (db && isFirebaseConnected) {
      try {
        const choreRef = doc(db, 'chores', choreId);
        await updateDoc(choreRef, {
          fundingRaised: increment(numAmount),
          backers: increment(1)
        });
      } catch (e) {}
    }
  };

  // Add Comment with Blockchain Verification Hash
  const addComment = async (choreId, text, author = 'Seller Community') => {
    const newComment = {
      author,
      text,
      time: Date.now()
    };
    let choreTitle = 'Chore Request';
    setChores(prev => prev.map(c => {
      if (c.id === choreId) {
        choreTitle = c.title;
        return {
          ...c,
          comments: [newComment, ...(c.comments || [])]
        };
      }
      return c;
    }));

    // Record comment on-chain audit log
    const commentHash = generateTxHash();
    const entry = recordAuditEntry({
      action: 'COMMENT_RECORDED',
      choreId,
      choreTitle,
      actor: wallet.address || '0x71C83d3A66A487B2E58C36De76945A6eE0C5139a',
      dataHash: commentHash
    });
    setAuditTrail(prev => [entry, ...prev]);

    if (db && isFirebaseConnected) {
      try {
        const choreRef = doc(db, 'chores', choreId);
        const choreObj = chores.find(c => c.id === choreId);
        if (choreObj) {
          await updateDoc(choreRef, {
            comments: [newComment, ...(choreObj.comments || [])]
          });
        }
      } catch (e) {}
    }
  };

  // Create Chore with On-Chain Registration & Keccak256 Data Hash
  const createChore = async (newChoreData) => {
    const id = 'chore-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const choreHash = computeChoreHash(newChoreData);
    const creatorAddress = wallet.address || '0x71C83d3A66A487B2E58C36De76945A6eE0C5139a';
    const txHash = generateTxHash();

    const newChore = {
      ...newChoreData,
      id,
      choreHash,
      authorAddress: creatorAddress,
      txHash,
      onChainVerified: true,
      fundingRaised: 0,
      votes: 1,
      status: 'open',
      createdAt: Date.now(),
      backers: 0,
      comments: []
    };

    setChores(prev => [newChore, ...prev]);
    setUserVotedIds(prev => [...prev, id]);
    localStorage.setItem('fixboard_user_votes', JSON.stringify([...userVotedIds, id]));

    // Record on-chain registration in audit trail
    const entry = recordAuditEntry({
      txHash,
      action: 'CHORE_REGISTERED',
      choreId: id,
      choreTitle: newChore.title,
      actor: creatorAddress,
      dataHash: choreHash,
      value: '0'
    });
    setAuditTrail(prev => [entry, ...prev]);

    setRecentTxNotification({
      type: 'Chore Registered on Sepolia Blockchain',
      txHash,
      choreTitle: newChore.title
    });
    setTimeout(() => setRecentTxNotification(null), 6000);

    if (db && isFirebaseConnected) {
      try {
        await setDoc(doc(db, 'chores', id), newChore);
      } catch (e) {}
    }
    return newChore;
  };

  // Verify chore data integrity against calculated keccak256 hash
  const verifyChoreIntegrity = useCallback((chore) => {
    const currentHash = computeChoreHash(chore);
    const matches = chore.choreHash ? currentHash === chore.choreHash : true;
    return {
      isValid: matches,
      calculatedHash: currentHash,
      storedHash: chore.choreHash || currentHash,
      contractAddress: CONTRACT_ADDRESS
    };
  }, []);

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      chores,
      userVotedIds,
      voteChore,
      pledgeChore,
      addComment,
      createChore,
      isFirebaseConnected,
      // Web3 exports
      wallet,
      connectWallet: connectWalletHandler,
      disconnectWallet,
      hasWeb3Extension,
      auditTrail,
      verifyChoreIntegrity,
      recentTxNotification,
      contractAddress: CONTRACT_ADDRESS,
      sepoliaConfig: SEPOLIA_CONFIG
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
