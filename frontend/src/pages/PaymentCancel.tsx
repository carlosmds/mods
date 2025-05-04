import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl"
      >
        <div className="text-red-500 text-5xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('payment.canceled')}</h1>
        <p className="text-gray-600 mb-6 text-lg">
          {t('payment.cancel_message')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg w-full"
        >
          {t('common.return_home')}
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentCancel; 