import { BitBox02StylizedDark, BitBox02StylizedLight } from '@/components/icon';

import { useDarkmode } from '@/hooks/darkmode';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import { View, ViewContent } from '@/components/view/view';

type TProps = {
    deviceID: string;
  }

export const FreshInstall2 = ({ deviceID }: TProps) => {
  const [successInstall, setSuccessInstall] = useState(false);
  console.log({ deviceID });

  useEffect(() => {
    setTimeout(() => {
      setSuccessInstall(true);
    }, 2000);
  }, []);

  useEffect(() => {}, []);

  return (
    <View fitContent verticallyCentered width="960px">
      <ViewContent>
        <div className={styles.freshinstallContainer}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className={`${successInstall ? styles.gone : ''}`}>
              <h2>Your bitcoin journey starts now</h2>
              <p>Thank you for choosing the BitBox02 hardware wallet.</p>
            </div>
          </div>
          <div className={`${successInstall ? styles.flyIn : styles.bitbox02_1}`}>
            <BitBox />
          </div>
        </div>
      </ViewContent>
    </View>
  );
};

const BitBox = () => {
  const { isDarkMode } = useDarkmode();
  return (<>
    { isDarkMode
      ? (<BitBox02StylizedLight/>)
      : (<BitBox02StylizedDark />)
    }
  </>);
};
