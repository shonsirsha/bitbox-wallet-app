// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TAmountWithConversions } from '@/api/account';
import { getListPayments, type TLightningPayment } from '@/api/lightning';
import { AmountWithUnit } from '@/components/amount/amount-with-unit';
import { Button } from '@/components/forms';
import { Header, Main } from '@/components/layout';
import { Spinner } from '@/components/spinner/Spinner';
import { View, ViewButtons, ViewContent } from '@/components/view/view';
import { useLoad } from '@/hooks/api';
import styles from './claim-top-up.module.css';

const CONTENT_MIN_HEIGHT = '38em';

const mockFeeAmount = (amount: string, fiat: string): TAmountWithConversions => ({
  amount,
  conversions: {
    EUR: fiat,
    USD: fiat,
  },
  estimated: false,
  unit: 'sat',
});

// TODO: Replace with backend-provided claim/refund fee estimates.
const MOCK_CLAIM_FEE = mockFeeAmount('100', '0.06');
const MOCK_REFUND_FEE = mockFeeAmount('100', '0.06');

type TLocationState = {
  deposits?: TLightningPayment[];
};

const isUnclaimedBitcoinDeposit = (payment: TLightningPayment) => (
  payment.bitcoinDeposit?.state === 'unclaimed'
);

type TAmountRowProps = {
  amount: TAmountWithConversions;
};

const AmountRow = ({ amount }: TAmountRowProps) => (
  <div className={styles.amountRow}>
    <AmountWithUnit
      alwaysShowAmounts
      amount={amount}
      amountClassName={styles.amount}
    />
    <AmountWithUnit
      alwaysShowAmounts
      amount={amount}
      convertToFiat
      amountClassName={styles.fiat}
      unitClassName={styles.fiat}
    />
  </div>
);

type TFeeActionProps = {
  amount: TAmountWithConversions;
  buttonText: string;
  danger?: boolean;
  label: string;
};

const FeeAction = ({
  amount,
  buttonText,
  danger,
  label,
}: TFeeActionProps) => {
  const button = danger ? (
    <Button
      className={styles.actionButton}
      danger
      onClick={() => undefined}>
      {buttonText}
    </Button>
  ) : (
    <Button
      className={styles.actionButton}
      onClick={() => undefined}
      primary>
      {buttonText}
    </Button>
  );

  return (
    <div className={styles.feeRow}>
      <div>
        <span className={styles.feeLabel}>{label}</span>
        <div className={styles.feeAmounts}>
          <AmountWithUnit
            alwaysShowAmounts
            amount={amount}
            amountClassName={styles.amount}
          />
          <AmountWithUnit
            alwaysShowAmounts
            amount={amount}
            convertToFiat
            amountClassName={styles.fiat}
            unitClassName={styles.fiat}
          />
        </div>
      </div>
      {button}
    </div>
  );
};

export const LightningClaimTopUp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const routeDeposits = useMemo(
    () => ((state as TLocationState | null)?.deposits ?? []).filter(isUnclaimedBitcoinDeposit),
    [state]
  );
  const payments = useLoad(getListPayments);
  const deposits = useMemo(() => {
    const loadedDeposits = payments?.filter(isUnclaimedBitcoinDeposit) ?? [];
    return loadedDeposits.length > 0 ? loadedDeposits : routeDeposits;
  }, [payments, routeDeposits]);
  const hasRouteFallback = routeDeposits.length > 0;

  const renderContent = () => {
    if (payments === undefined && !hasRouteFallback) {
      return <Spinner text={t('lightning.initializing')} />;
    }

    return (
      <View key="claim-top-up" minHeight={CONTENT_MIN_HEIGHT} width="min(420px, 100%)">
        <ViewContent>
          <div className={styles.content}>
            <div className={styles.description}>
              <p>{t('lightning.claimTopUp.description')}</p>
              <p>{t('lightning.claimTopUp.warning')}</p>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('lightning.claimTopUp.topUps')}</h2>
              {deposits.length > 0 ? (
                <div className={styles.amountRows}>
                  {deposits.map(deposit => (
                    <AmountRow
                      key={deposit.id}
                      amount={deposit.amount}
                    />
                  ))}
                </div>
              ) : (
                <p>{t('lightning.claimTopUp.empty')}</p>
              )}
            </section>

            <section className={styles.feeActions}>
              <FeeAction
                amount={MOCK_CLAIM_FEE}
                buttonText={t('lightning.claimTopUp.claimButton')}
                label={t('lightning.claimTopUp.claimFee')}
              />
              <FeeAction
                amount={MOCK_REFUND_FEE}
                buttonText={t('lightning.claimTopUp.refundButton')}
                danger
                label={t('lightning.claimTopUp.refundFee')}
              />
            </section>
          </div>
        </ViewContent>
        <ViewButtons>
          <Button secondary onClick={() => navigate(-1)}>
            {t('dialog.cancel')}
          </Button>
        </ViewButtons>
      </View>
    );
  };

  return (
    <Main>
      <Header title={t('lightning.claimTopUp.title')} />
      {renderContent()}
    </Main>
  );
};
