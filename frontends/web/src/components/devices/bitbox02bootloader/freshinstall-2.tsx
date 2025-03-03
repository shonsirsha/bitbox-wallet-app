import { BitBox02StylizedDark, BitBox02StylizedLight, CaretDown } from '@/components/icon';
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const hasDevices = Object.keys(devices).length > 0;

  console.log({ deviceID, devices });

  const navigate = useNavigate();

  useEffect(() => {
    if (hasDevices && successInstall) {
      navigate(`/fresh-install-attestation/${deviceID}`);
    }
  }, [deviceID, hasDevices, navigate, successInstall]);

  // Handle animations sequence
  useEffect(() => {
    // Step 1: Start initial animation
    const animationTimeout = setTimeout(() => {
      setSuccessInstall(true);

      // Step 2: Show instruction text after BitBox animation is complete (2.5s)
      const instructionsTimeout = setTimeout(() => {
        setShowInstructions(true);

        // Step 3: Show arrow 1 second after text appears
        const arrowTimeout = setTimeout(() => {
          setShowArrow(true);
        }, 1000);

        return () => clearTimeout(arrowTimeout);
      }, 2500); // Wait for flying animation to complete

      return () => clearTimeout(instructionsTimeout);
    }, 2000);

    return () => clearTimeout(animationTimeout);
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

          {/* Tap instructions container */}
          <div className={styles.instructionsContainer}>
            {/* Upward-pointing arrow */}
            <div style={{ minHeight: 29 }} >
              {showArrow && (
                <div className={`${styles.arrowContainer} ${styles.fadeIn}`}>
                  <CaretDown className={styles.rotatedCaret} />
                </div>
              )}

            </div>
            {/* Instruction text */}
            {showInstructions && (
              <p className={`${styles.tapInstructions} ${styles.fadeIn}`}>
                Tap side of BitBox02 to orient display
              </p>
            )}
          </div>
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
