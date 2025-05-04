import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { verifyMagicLink } from '../store/slices/authSlice';
import { toggleAdCreator } from '../store/slices/uiSlice';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AuthVerify: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showSuccess, setShowSuccess] = useState(false);
  const verificationRef = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (token && !verificationRef.current) {
        verificationRef.current = true;
        const resultAction = await dispatch(verifyMagicLink(token));
        if (verifyMagicLink.fulfilled.match(resultAction)) {
          setShowSuccess(true);
          // Wait 2 seconds before redirecting
          setTimeout(() => {
            navigate('/');
            // Open the ad creator modal after a small delay to ensure navigation is complete
            setTimeout(() => {
              dispatch(toggleAdCreator());
            }, 100);
          }, 2000);
        }
      }
    };

    verify();
  }, [token, dispatch, navigate]);

  const containerStyle = "min-h-screen w-full fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95";
  const cardStyle = "bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl";

  // First, check if we're in the success state
  if (showSuccess && isAuthenticated) {
    return (
      <div className={containerStyle}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cardStyle}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="text-green-500 text-6xl mb-6"
          >
            ✓
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('auth.login_success')}</h1>
          <p className="text-gray-600 mb-6 text-lg">{t('auth.redirecting')}</p>
          <div className="h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
              className="h-full bg-green-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Then check if we're loading
  if (loading || (!verificationRef.current && !error)) {
    return (
      <div className={containerStyle}>
        <div className={cardStyle}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('auth.login_verifying')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  return (
    <div className={containerStyle}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cardStyle}
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="text-red-500 text-6xl mb-6"
        >
          ✕
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('auth.login_failed')}</h1>
        <p className="text-gray-600 mb-6 text-lg">{error || t('auth.invalid_token')}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {t('common.return_home')}
        </button>
      </motion.div>
    </div>
  );
};

export default AuthVerify; 