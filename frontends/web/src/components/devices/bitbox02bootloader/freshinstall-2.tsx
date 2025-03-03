import { BitBox02StylizedDark, BitBox02StylizedLight } from '@/components/icon';

import { useDarkmode } from '@/hooks/darkmode';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import { View, ViewContent } from '@/components/view/view';
import { TDevices } from '@/api/devices';
import { useNavigate } from 'react-router-dom';

type TProps = {
  deviceID: string;
  devices: TDevices
}

export const FreshInstall2 = ({ deviceID, devices }: TProps) => {
  const [successInstall, setSuccessInstall] = useState(false);
  const hasDevices = Object.keys(devices).length > 0;

  console.log({ deviceID, devices });

  const navigate = useNavigate();

  useEffect(() => {
    if (hasDevices && successInstall) {
      navigate(`/fresh-install-attestation/${deviceID}`);
    }
  }, [deviceID, hasDevices, navigate, successInstall]);

  useEffect(() => {
    setTimeout(() => {
      setSuccessInstall(true);
    }, 2000);
  }, []);

  if (!hasDevices) {
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
          <p>Tap side of BitBox02 to orient display</p>
        </ViewContent>
      </View>
    );
  }

  return null;




  // return (
  //   <View fitContent verticallyCentered width="960px">
  //     <div className={styles.transitionContainer || 'transition-container'}>
  //       {/* Initial welcome view - will fade out */}
  //       <div className={`${styles.viewTransition || 'view-transition'} ${
  //         (isTransitioning || hasDevices) ? styles.fadeOut || 'fade-out' : ''
  //       }`}>
  //         <ViewContent>
  //           <div className={styles.freshinstallContainer}>
  //             <div style={{ display: 'flex', flexDirection: 'column' }}>
  //               <div className={`${successInstall ? styles.gone : ''}`}>
  //                 <h2>Your bitcoin journey starts now</h2>
  //                 <p>Thank you for choosing the BitBox02 hardware wallet.</p>
  //               </div>
  //             </div>
  //             <div className={`${successInstall ? styles.flyIn : styles.bitbox02_1}`}>
  //               <BitBox />
  //             </div>
  //           </div>
  //           <p>Tap side of BitBox02 to orient display</p>
  //         </ViewContent>
  //       </div>

  //       {/* Attestation view - will fade in */}
  //       {(isTransitioning || hasDevices) && paramStep === 'attestation' && successInstall && (
  //         <div
  //           className={`${styles.viewTransition || 'view-transition'} ${styles.fadeIn || 'fade-in'}`}
  //           onAnimationEnd={() => {
  //             // Once animation completes, we can clear the transitioning state
  //             if (hasDevices) {
  //               setIsTransitioning(false);
  //             }
  //           }}
  //         >
  //           {paramStep}
  //           <Attestation />
  //         </div>
  //       )}
  //     </div>
  //   </View>
  // );
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
