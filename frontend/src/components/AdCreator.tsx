import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleAdCreator } from '../store/slices/uiSlice';
import { createAd, createCheckoutSession, AdDuration } from '../store/slices/adsSlice';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import LoginModal from './LoginModal';

type VehicleType = 'airplane' | 'balloon' | 'airship';

type FormData = {
  vehicleType: VehicleType;
  message: string;
  duration: AdDuration;
};

interface Field {
  name: keyof FormData;
  type: 'select' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  maxLength?: number;
}

interface Step {
  title: string;
  fields: Field[];
}

const AdCreator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    vehicleType: 'airplane',
    message: '',
    duration: '1d',
  });

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading, error } = useAppSelector((state) => state.ads);

  const steps: Step[] = [
    {
      title: t('ads.choose_vehicle'),
      fields: [
        {
          name: 'vehicleType',
          type: 'select',
          options: [
            { value: 'airplane', label: t('ads.vehicle_types.airplane') },
            { value: 'balloon', label: t('ads.vehicle_types.balloon') },
            { value: 'airship', label: t('ads.vehicle_types.airship') },
          ],
        },
      ],
    },
    {
      title: t('ads.enter_message'),
      fields: [
        {
          name: 'message',
          type: 'textarea',
          placeholder: t('ads.message_placeholder'),
          maxLength: 240,
        },
      ],
    },
    {
      title: t('ads.set_duration'),
      fields: [
        {
          name: 'duration',
          type: 'select',
          options: [
            { value: '1d', label: t('ads.durations.1d') },
            { value: '1w', label: t('ads.durations.1w') },
            { value: '1m', label: t('ads.durations.1m') },
          ],
        },
      ],
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    // Prevent newlines in message field
    if (name === 'message') {
      newValue = newValue.replace(/[\r\n]+/g, ' ');
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Create the ad first
      const resultAction = await dispatch(createAd(formData));
      if (createAd.fulfilled.match(resultAction)) {
        // If ad creation was successful, redirect to Stripe checkout
        const { id: adId } = resultAction.payload;
        await dispatch(createCheckoutSession({ adId, duration: formData.duration }));
      }
    } catch (error) {
      console.error('Error creating ad:', error);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
    dispatch(toggleAdCreator());
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isAuthenticated) {
    return <LoginModal onClose={() => dispatch(toggleAdCreator())} />;
  }

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
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{steps[currentStep].title}</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {steps[currentStep].fields.map((field) => (
          <div key={field.name} className="mb-4">
            {field.type === 'select' ? (
              <div className="relative">
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  className="appearance-none bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8"
                  disabled={loading}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            ) : (
              <div>
              <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                className="input-field h-32 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                disabled={loading}
                onKeyDown={field.name === 'message' ? (e => { if (e.key === 'Enter') e.preventDefault(); }) : undefined}
                required={field.name === 'message'}
              />
                {field.maxLength && (
                  <div className="text-sm text-gray-500 mt-1">
                    {formData[field.name].length}/{field.maxLength} {t('common.characters')}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {currentStep === 2 && (
          <div className="mb-4 text-xs text-gray-600">
            <Trans i18nKey="ads.terms_notice">
              Ao criar um anúncio, você concorda com nossos <a href="/docs" target="_blank" className="underline">Termos de Uso e Privacidade</a>.
            </Trans>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            {currentStep === 0 ? t('common.cancel') : t('common.back')}
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {t('common.next')}
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? t('common.loading') : t('ads.create_ad')}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdCreator; 