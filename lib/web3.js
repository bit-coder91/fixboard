// Ethereum & Solidity Web3 Layer for FixBoard
// Supports Ethereum Sepolia Testnet (free to use) & Instant Web3 Demo Wallet (Vercel-ready)

import { ethers } from 'ethers';
import FixBoardABI from '../contracts/FixBoardABI.json';

export const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainIdDecimal: 11155111,
  chainName: 'Ethereum Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'SEP',
    decimals: 18
  },
  rpcUrls: [
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc.sepolia.org',
    'https://sepolia.gateway.tenderly.co'
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

export const CONTRACT_ADDRESS = 
  process.env.NEXT_PUBLIC_FIXBOARD_CONTRACT_ADDRESS || 
  '0x83A41b2B54848039e246944B27CFe6cf1A4676cD';

// Initial audit trail seed entries so audit log is rich and interactive immediately
const INITIAL_AUDIT_LOG = [
  {
    id: 'tx-seed-1',
    txHash: '0x3a9f9842f1837b56d812de22b512c01997e55a6d366a6a5789fcf09633e147b2',
    blockNumber: 6814290,
    action: 'CHORE_REGISTERED',
    choreId: 'seed-1',
    choreTitle: 'Auto-detect & merge duplicate SKUs across Amazon, Shopify, and eBay',
    actor: '0x71C83d3A66A487B2E58C36De76945A6eE0C5139a',
    value: '0',
    dataHash: '0x948ab32e3650cf582310b809a74be6211fa4d17ec13689fbf0e85aa717bb5e31',
    timestamp: Date.now() - 86400000 * 12,
    verified: true
  },
  {
    id: 'tx-seed-2',
    txHash: '0x78ab12eef45398a87612d3456789a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
    blockNumber: 6815310,
    action: 'VOTE_CAST',
    choreId: 'seed-1',
    choreTitle: 'Auto-detect & merge duplicate SKUs across Amazon, Shopify, and eBay',
    actor: '0x94823Eb12B3B6d24669f6974720977B4A346C09b',
    value: '1',
    dataHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: Date.now() - 86400000 * 11,
    verified: true
  },
  {
    id: 'tx-seed-3',
    txHash: '0xbc94012de9412a837492cda47b193240e872c695bfae1136b3b5c6d7e8f9a0b1',
    blockNumber: 6816405,
    action: 'PLEDGE_MADE',
    choreId: 'seed-1',
    choreTitle: 'Auto-detect & merge duplicate SKUs across Amazon, Shopify, and eBay',
    actor: '0x3B884C0113f898a3C4e79E5336d3C14800366D60',
    value: '0.15 SEP',
    dataHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: Date.now() - 86400000 * 10,
    verified: true
  },
  {
    id: 'tx-seed-4',
    txHash: '0x22c4f198d023456789abcde0123456789abcdef0123456789abcdef012345678',
    blockNumber: 6819870,
    action: 'CHORE_REGISTERED',
    choreId: 'seed-3',
    choreTitle: 'Real-time sub-60s inventory sync across 4+ channels with bundle support',
    actor: '0x524B51737fB8f3F1fC22Fe7bA7E38B426e2aC814',
    value: '0',
    dataHash: '0x3f5c182a4d96e058273611a4c901e827b567a123f098cde321456a7b8c9d0e1f',
    timestamp: Date.now() - 86400000 * 20,
    verified: true
  },
  {
    id: 'tx-seed-5',
    txHash: '0xfa9142bc1946029348f029348fa918239048a0f9128394801293840192834019',
    blockNumber: 6821400,
    action: 'PLEDGE_MADE',
    choreId: 'seed-3',
    choreTitle: 'Real-time sub-60s inventory sync across 4+ channels with bundle support',
    actor: '0x94823Eb12B3B6d24669f6974720977B4A346C09b',
    value: '0.35 SEP',
    dataHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: Date.now() - 86400000 * 18,
    verified: true
  }
];

// Calculate keccak256 hash of chore canonical content
export function computeChoreHash(chore) {
  try {
    const canonical = JSON.stringify({
      title: chore.title || '',
      description: chore.description || '',
      category: chore.category || '',
      pain: chore.pain || 0,
      platforms: chore.platforms || []
    });
    return ethers.keccak256(ethers.toUtf8Bytes(canonical));
  } catch (err) {
    return '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Generate realistic mock transaction hash
export function generateTxHash() {
  const bytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if browser has MetaMask / Injected provider
export function hasInjectedProvider() {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

// Get or create persistent demo Web3 wallet (for 0-cost / no-wallet mode)
export function getOrCreateDemoWallet() {
  if (typeof window === 'undefined') {
    return {
      address: '0x71C83d3A66A487B2E58C36De76945A6eE0C5139a',
      type: 'demo',
      balance: '1.25'
    };
  }

  let demoAddress = localStorage.getItem('fixboard_demo_wallet_address');
  let demoBalance = localStorage.getItem('fixboard_demo_wallet_balance') || '1.50';

  if (!demoAddress) {
    // Generate deterministic valid-looking Ethereum address
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    demoAddress = ethers.getAddress('0x' + randomHex);
    localStorage.setItem('fixboard_demo_wallet_address', demoAddress);
    localStorage.setItem('fixboard_demo_wallet_balance', demoBalance);
  }

  return {
    address: demoAddress,
    type: 'demo',
    balance: demoBalance
  };
}

// Connect MetaMask or switch to Sepolia
export async function connectMetaMask() {
  if (!hasInjectedProvider()) {
    throw new Error('No Ethereum wallet detected. Switch to Demo Wallet mode.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  const network = await provider.getNetwork();

  // If not on Sepolia (11155111), prompt switch
  if (Number(network.chainId) !== SEPOLIA_CONFIG.chainIdDecimal) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }]
      });
    } catch (switchError) {
      // If chain not added to wallet, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CONFIG.chainId,
              chainName: SEPOLIA_CONFIG.chainName,
              nativeCurrency: SEPOLIA_CONFIG.nativeCurrency,
              rpcUrls: SEPOLIA_CONFIG.rpcUrls,
              blockExplorerUrls: SEPOLIA_CONFIG.blockExplorerUrls
            }
          ]
        });
      }
    }
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const balanceWei = await provider.getBalance(address);
  const balance = ethers.formatEther(balanceWei);

  return {
    address,
    type: 'metamask',
    balance: Number(balance).toFixed(4),
    provider,
    signer
  };
}

// Load Audit Trail from localStorage + Initial Seed
export function getStoredAuditTrail() {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOG;
  try {
    const stored = localStorage.getItem('fixboard_blockchain_audit_trail');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  return INITIAL_AUDIT_LOG;
}

// Record an audit entry (saved to localStorage + emitted to listeners)
export function recordAuditEntry(entry) {
  if (typeof window === 'undefined') return entry;
  const current = getStoredAuditTrail();
  const newEntry = {
    id: 'tx-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    txHash: entry.txHash || generateTxHash(),
    blockNumber: entry.blockNumber || 6825000 + Math.floor(Math.random() * 500),
    action: entry.action,
    choreId: entry.choreId,
    choreTitle: entry.choreTitle || 'Chore Request',
    actor: entry.actor,
    value: entry.value || '0',
    dataHash: entry.dataHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
    timestamp: Date.now(),
    verified: true
  };
  const updated = [newEntry, ...current];
  localStorage.setItem('fixboard_blockchain_audit_trail', JSON.stringify(updated));
  return newEntry;
}

// Get FixBoard Contract instance
export function getContractInstance(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, FixBoardABI, signerOrProvider);
}

// Helper to truncate Ethereum address
export function formatAddress(address) {
  if (!address) return '';
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}
