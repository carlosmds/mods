import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../store';
import { fetchActiveAds } from '../store/slices/adsSlice';
import { useTranslation } from 'react-i18next';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    // Refresh the ads list to show the new active ad
    dispatch(fetchActiveAds());
    
    // Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen w-full fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl"
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('payment.success')}</h1>
        <p className="text-gray-600 mb-6 text-lg">
          {t('payment.success_message')}
        </p>
        <div className="h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="h-full bg-green-500"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess; 