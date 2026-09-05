// src/components/ResponsiveWrapper.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { ConfigProvider, theme } from 'antd';
import './ResponsiveWrapper.css';

// ============================================================
// RESPONSIVE CONTEXT
// ============================================================
export const ResponsiveContext = createContext({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isSmallMobile: false,
  screenWidth: 0,
  screenHeight: 0,
  orientation: 'portrait',
  isLandscape: false,
  isPortrait: true,
  breakpoints: {
    smallMobile: 480,
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    largeDesktop: 1600
  }
});

export const useResponsive = () => useContext(ResponsiveContext);

// ============================================================
// RESPONSIVE PROVIDER
// ============================================================
export const ResponsiveProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isSmallMobile: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    orientation: 'portrait',
    isLandscape: false,
    isPortrait: true,
    breakpoints: {
      smallMobile: 480,
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      largeDesktop: 1600
    }
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      
      setScreenSize({
        isSmallMobile: width < 480,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        orientation: isLandscape ? 'landscape' : 'portrait',
        isLandscape,
        isPortrait: !isLandscape,
        breakpoints: {
          smallMobile: 480,
          mobile: 768,
          tablet: 1024,
          desktop: 1200,
          largeDesktop: 1600
        }
      });

      // ✅ Add class to body for CSS targeting
      document.body.classList.remove('mobile-view', 'tablet-view', 'desktop-view');
      if (width < 768) {
        document.body.classList.add('mobile-view');
      } else if (width >= 768 && width < 1024) {
        document.body.classList.add('tablet-view');
      } else {
        document.body.classList.add('desktop-view');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 300);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <ResponsiveContext.Provider value={screenSize}>
      <ConfigProvider
        theme={{
          token: {
            fontSize: screenSize.isMobile ? 14 : 16,
            fontSizeSM: screenSize.isMobile ? 12 : 14,
            fontSizeLG: screenSize.isMobile ? 16 : 18,
            screenSM: 576,
            screenMD: 768,
            screenLG: 992,
            screenXL: 1200,
            screenXXL: 1600,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ResponsiveContext.Provider>
  );
};

// ============================================================
// MAIN RESPONSIVE WRAPPER - Auto-detects and adapts
// ============================================================
const ResponsiveWrapper = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="responsive-wrapper">{children}</div>;
  }

  return (
    <ResponsiveProvider>
      <div className="responsive-wrapper" id="responsive-root">
        {children}
      </div>
    </ResponsiveProvider>
  );
};

export default ResponsiveWrapper;

// ============================================================
// HELPER HOOKS
// ============================================================
export const useIsMobile = () => {
  const context = useContext(ResponsiveContext);
  return context.isMobile;
};

export const useIsTablet = () => {
  const context = useContext(ResponsiveContext);
  return context.isTablet;
};

export const useIsDesktop = () => {
  const context = useContext(ResponsiveContext);
  return context.isDesktop;
};