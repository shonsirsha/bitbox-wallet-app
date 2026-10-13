// SPDX-License-Identifier: Apache-2.0

import '../../__mocks__/i18n';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Header } from '@/components/layout/header';
import { BackButtonProvider } from '@/contexts/BackButtonContext';
import { useMarketVendorNavigation } from './market-vendor-navigation';

const Vendor = ({ skipDisclaimer = false, blocked = false }) => {
  const { agreedTerms, setAgreedTerms, onBack } = useMarketVendorNavigation({
    code: 'second-account', action: 'sell', skipDisclaimer, blocked,
  });
  const location = useLocation();
  return (
    <>
      <Header variant="navigation" mobileBackButton onBack={onBack} />
      <output>{location.pathname}{location.search}</output>
      {agreedTerms ? <iframe title="Provider" /> : (
        <button onClick={() => setAgreedTerms(true)}>Continue</button>
      )}
    </>
  );
};

const renderVendor = (props = {}) => render(
  <MemoryRouter initialEntries={['/market/pocket/sell/second-account/CH']}>
    <BackButtonProvider>
      <Vendor {...props} />
    </BackButtonProvider>
  </MemoryRouter>
);

describe('market vendor back navigation', () => {
  it('returns from the provider to the disclaimer, then to the same account and tab', () => {
    renderVendor();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByTitle('Provider')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'button.back' }));
    expect(screen.queryByTitle('Provider')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('/market/pocket/sell/second-account/CH');

    fireEvent.click(screen.getByRole('button', { name: 'button.back' }));
    expect(screen.getByRole('status')).toHaveTextContent('/market/select/second-account?tab=sell');
  });

  it('uses the same disclaimer step for native back gestures', () => {
    renderVendor();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    act(() => {
      window.onBackButtonPressed?.();
    });
    expect(screen.queryByTitle('Provider')).not.toBeInTheDocument();
    act(() => {
      window.onBackButtonPressed?.();
    });
    expect(screen.getByRole('status')).toHaveTextContent('/market/select/second-account?tab=sell');
  });

  it('goes directly to the same account and tab when the disclaimer is skipped', () => {
    renderVendor({ skipDisclaimer: true });
    expect(screen.getByTitle('Provider')).toBeInTheDocument();
    act(() => {
      window.onBackButtonPressed?.();
    });
    expect(screen.getByRole('status')).toHaveTextContent('/market/select/second-account?tab=sell');
  });

  it('keeps both back controls blocked during a pending request', () => {
    renderVendor({ skipDisclaimer: true, blocked: true });
    fireEvent.click(screen.getByRole('button', { name: 'button.back' }));
    act(() => {
      window.onBackButtonPressed?.();
    });
    expect(screen.getByTitle('Provider')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('/market/pocket/sell/second-account/CH');
  });
});
