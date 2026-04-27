import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WalletButton from '../components/WalletButton';
import { WalletProvider } from '../context/WalletContext';
import { LoadingProvider } from '../context/LoadingContext';

// Mock the stellar utils
vi.mock('../utils/stellar', () => ({
  connectWallet: vi.fn(),
  fetchBalance: vi.fn(),
  fetchLockedAmount: vi.fn(),
  fetchRewardsBalance: vi.fn(),
  checkFreighterInstalled: vi.fn(() => Promise.resolve(true)),
}));

describe('WalletButton component', () => {
  it('renders fixed text when not connected', () => {
    render(
      <LoadingProvider>
        <WalletProvider>
          <WalletButton />
        </WalletProvider>
      </LoadingProvider>
    );
    
    expect(screen.getByText(/Connect Wallet/i)).toBeDefined();
  });
});
