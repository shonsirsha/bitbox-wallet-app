// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router-dom';
import type { AccountCode } from '@/api/account';
import type { TMarketAction } from '@/api/market';
import { useVendorTerms } from './vendor-iframe-terms';

type TOptions = {
  code: AccountCode;
  action: TMarketAction;
  skipDisclaimer: boolean;
  blocked?: boolean;
};

export const useMarketVendorNavigation = ({ code, action, skipDisclaimer, blocked = false }: TOptions) => {
  const navigate = useNavigate();
  const { agreedTerms, setAgreedTerms } = useVendorTerms(skipDisclaimer);

  const onBack = () => {
    if (blocked) {
      return;
    }
    if (agreedTerms && !skipDisclaimer) {
      setAgreedTerms(false);
      return;
    }
    navigate(`/market/select/${code}?tab=${action}`, { replace: true });
  };

  return { agreedTerms, setAgreedTerms, onBack };
};
