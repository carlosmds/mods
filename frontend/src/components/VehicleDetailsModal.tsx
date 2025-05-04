import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store';
import { setSelectedAd } from '../store/slices/adsSlice';
import { useTranslation } from 'react-i18next';

const VehicleDetailsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedAd = useAppSelector((state) => state.ads.selectedAd);
  const { t } = useTranslation();

  if (!selectedAd) return null;

  const handleClose = () => {
    dispatch(setSelectedAd(null));
  };

  return (
    <AnimatePresence>
      {selectedAd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{t('ads.details')}</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                aria-label={t('common.close')}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={`/icons/${selectedAd.vehicleType}.svg`}
                  alt={t(`ads.vehicle_types.${selectedAd.vehicleType}`)}
                  className="w-12 h-12"
                />
                <h3 className="text-lg font-semibold capitalize text-gray-800">
                  {t(`ads.vehicle_types.${selectedAd.vehicleType}`)}
                  </h3>
              </div>
              
              <textarea
                value={selectedAd.message}
                readOnly
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none resize-none h-32"
                aria-label={t('ads.message')}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VehicleDetailsModal; 