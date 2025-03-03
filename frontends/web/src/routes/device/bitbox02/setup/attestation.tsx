//@ts-nocheck

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, ViewContent } from '@/components/view/view';
import { Button } from '@/components/forms';
import { Link } from 'react-router-dom';
import styles from './attestation.module.css';

type TProps = {
  deviceID?: string;
}

export const Attestation = ({ deviceID }: TProps) => {
  const { t } = useTranslation();
  const [animationState, setAnimationState] = useState<'loading' | 'complete' | 'final'>('loading');
  const [showCallToAction, setShowCallToAction] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle animation progression
  useEffect(() => {
    // Step 1: Start filling the circle in 3 phases
    const progress1 = setTimeout(() => setProgress(33), 600);
    const progress2 = setTimeout(() => setProgress(66), 1400);
    const progress3 = setTimeout(() => setProgress(100), 2000);

    // Step 2: Show checkmark when circle is filled
    const completeTimeout = setTimeout(() => {
      setAnimationState('complete');
    }, 2600);

    // Step 3: Change text and show additional elements after 2-3 seconds
    const finalTimeout = setTimeout(() => {
      setAnimationState('final');

      // Step 4: Show the link and button after an additional delay
      const callToActionTimeout = setTimeout(() => {
        setShowCallToAction(true);
      }, 800); // 800ms delay after showing "Your BitBox02 is authentic"

      return () => clearTimeout(callToActionTimeout);
    }, 3200);

    return () => {
      clearTimeout(progress1);
      clearTimeout(progress2);
      clearTimeout(progress3);
      clearTimeout(completeTimeout);
      clearTimeout(finalTimeout);
    };
  }, []);

  const handleContinue = () => {
    // Add navigation logic here if needed
    console.log('Continue pressed');
  };

  return (
    <View verticallyCentered>
      <ViewContent>
        <div className={styles.container}>
          {/* Progress Circle / Checkmark */}
          <div className={styles.iconContainer}>
            {animationState === 'loading' && (
              <div className={styles.circleProgress}>
                <svg viewBox="0 0 100 100" className={styles.progressSvg}>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={styles.progressTrack}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={styles.progressIndicator}
                    style={{
                      strokeDashoffset: 251.2 - (251.2 * progress / 100),
                      transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out',
                      stroke: progress === 100 ? '#5cad2c' : '#a0a0a0'
                    }}
                  />
                </svg>
              </div>
            )}

            {(animationState === 'complete' || animationState === 'final') && (
              <div className={`${styles.checkmark} ${styles.fadeIn}`}>
                <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
                  <circle cx="26" cy="26" r="25" fill="#5cad2c" />
                  <path
                    className={styles.checkmarkPath}
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            )}
          </div>

          <div style={{ minHeight: 200 }}>
            {/* Text */}
            <div className={styles.textContainer}>
              {(animationState === 'loading' || animationState === 'complete') && (
                <h2 className={animationState === 'complete' ? `${styles.transitionOut}` : ''}>
                  Checking your BitBox02 is authentic
                </h2>
              )}

              {animationState === 'final' && (
                <>
                  <h2 className={styles.fadeIn}>Your BitBox02 is authentic</h2>

                  {/* Only show the link when showCallToAction is true */}
                  {showCallToAction && (
                    <Link to="/attestation-info" className={`${styles.helpLink} ${styles.fadeInDelayed}`}>
                      What is an authenticity check?
                    </Link>
                  )}
                </>
              )}
            </div>


            {/* Continue Button - only show when showCallToAction is true */}
            {animationState === 'final' && showCallToAction && (
              <div className={`${styles.buttonContainer} ${styles.fadeInDelayed}`}>                <Button primary onClick={handleContinue}>
                  Continue
              </Button>
              </div>
            )}
          </div>
        </div>
      </ViewContent>
    </View>
  );
};
