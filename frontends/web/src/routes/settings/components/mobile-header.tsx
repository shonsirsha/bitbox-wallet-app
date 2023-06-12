/**
 * Copyright 2023 Shift Crypto AG
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
import { ChevronLeftDark } from '../../../components/icon';
import { route } from '../../../utils/route';
import styles from './mobile-header.module.css';

type TProps = {
  subPageTitle: string;
}

export const MobileHeader = ({ subPageTitle }: TProps) => {
  const { t } = useTranslation();
  const handleClick = () => {
    //goes to the 'general settings' page
    route('/settings');
  };
  return (
    <div className={styles.container}>
      <button onClick={handleClick} className={styles.backButton}><ChevronLeftDark /> {t('button.back')}</button>
      <h1 className={styles.headerText}>{subPageTitle}</h1>
    </div>
  );
};
