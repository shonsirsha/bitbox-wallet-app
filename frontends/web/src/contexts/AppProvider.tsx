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

import { ReactNode, useEffect, useState } from 'react';
import { getConfig, setConfig } from '../utils/config';
import AppContext, { WCSessions } from './AppContext';

type TProps = {
    children: ReactNode;
  }

export const AppProvider = ({ children }: TProps) => {
  const [guideShown, setGuideShown] = useState(false);
  const [guideExists, setGuideExists] = useState(false);
  const [allSessions, setAllSessions] = useState<WCSessions>({});

  const toggleGuide = () => {
    setConfig({ frontend: { guideShown: !guideShown } });
    setGuideShown(prev => !prev);
  };

  useEffect(() => {
    getConfig().then(({ frontend }) => {
      if (frontend && frontend.guideShown !== undefined) {
        setGuideShown(frontend.guideShown);
      } else {
        setGuideShown(true);
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        toggleGuide,
        guideShown,
        guideExists,
        setGuideShown,
        setGuideExists,
        setAllSessions,
        allSessions,
      }}>
      {children}
    </AppContext.Provider>
  );
};

