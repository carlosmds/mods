import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { sendMagicLink, resetMagicLinkStatus } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error, magicLinkSent } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      dispatch(resetMagicLinkStatus());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(sendMagicLink(email));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('auth.sign_in')}</h2>
        
        {!magicLinkSent ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.enter_email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.enter_email')}
                className="input-field bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {t('auth.login_failed')}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? t('common.loading') : t('auth.sign_in')}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-6 text-gray-700">
              <p className="mb-2">{t('auth.magic_link_sent')}</p>
              <p>{t('auth.check_email')}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LoginModal; 