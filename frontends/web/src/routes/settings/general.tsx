/**
 * Copyright 2023-2024 Shift Crypto AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useTranslation } from 'react-i18next';
import { Main, Header, GuideWrapper, GuidedContent } from '@/components/layout';
import { View, ViewContent } from '@/components/view/view';
import { DarkmodeToggleSetting } from '@/routes/settings/components/appearance/darkmodeToggleSetting';
import { NotesImport } from '@/routes/settings/components/appearance/notesImport';
import { NotesExport } from '@/routes/settings/components/appearance/notesExport';
import { DefaultCurrencyDropdownSetting } from '@/routes/settings/components/appearance/defaultCurrencyDropdownSetting';
import { DisplaySatsToggleSetting } from '@/routes/settings/components/appearance/displaySatsToggleSetting';
import { LanguageDropdownSetting } from '@/routes/settings/components/appearance/languageDropdownSetting';
import { ActiveCurrenciesDropdownSetting } from '@/routes/settings/components/appearance/activeCurrenciesDropdownSetting';
import { HideAmountsSetting } from '@/routes/settings/components/appearance/hideAmountsSetting';
import { WithSettingsTabs } from '@/routes/settings/components/tabs';
import { MobileHeader } from '@/routes/settings/components/mobile-header';
import { Guide } from '@/components/guide/guide';
import { Entry } from '@/components/guide/entry';
import { SubTitle } from '@/components/title';
import { TPagePropsWithSettingsTabs } from './types';

export const General = ({ deviceIDs, hasAccounts }: TPagePropsWithSettingsTabs) => {
  const { t } = useTranslation();
  return (
    <GuideWrapper>
      <GuidedContent>
        <Main>
          <Header
            hideSidebarToggler
            title={
              <>
                <h2 className="hide-on-small">{t('sidebar.settings')}</h2>
                <MobileHeader withGuide title={t('settings.general')} />
              </>
            } />
          <View fullscreen={false}>
            <ViewContent>
              <WithSettingsTabs hasAccounts={hasAccounts} hideMobileMenu deviceIDs={deviceIDs}>
                <SubTitle className="m-top-default">
                  {t('settings.appearance')}
                </SubTitle>
                <LanguageDropdownSetting />
                <DefaultCurrencyDropdownSetting />
                <ActiveCurrenciesDropdownSetting />
                <DarkmodeToggleSetting />
                <DisplaySatsToggleSetting />
                <HideAmountsSetting />
                { hasAccounts ? (
                  <>
                    <SubTitle className="m-top-default">
                      {t('settings.notes.title')}
                    </SubTitle>
                    <NotesExport />
                    <NotesImport />
                  </>
                ) : null }
              </WithSettingsTabs>
            </ViewContent>
          </View>
        </Main>
      </GuidedContent>
      <GeneralGuide />
    </GuideWrapper>

  );
};

const GeneralGuide = () => {
  const { t } = useTranslation();

  return (
    <Guide title={t('guide.guideTitle.appearance')}>
      <Entry key="guide.settings.sats" entry={t('guide.settings.sats', { returnObjects: true })} />
      <Entry key="guide.accountRates" entry={{
        link: {
          text: 'www.coingecko.com',
          url: 'https://www.coingecko.com/'
        },
        text: t('guide.accountRates.text'),
        title: t('guide.accountRates.title')
      }} />

    </Guide>
  );
};
