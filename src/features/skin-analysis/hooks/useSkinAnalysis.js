import { useState, useCallback } from 'react';
import { analyzeSkin } from '../services/skinAnalysisService.js';

export const SCAN_STEPS = {
  PRIVACY: 'privacy',
  SETUP: 'setup',
  CAPTURE_FRONT: 'capture-front',
  CAPTURE_LEFT: 'capture-left',
  CAPTURE_RIGHT: 'capture-right',
  ANALYZING: 'analyzing',
  RESULTS: 'results'
};

/**
 * Hook to manage the full 3-step AI skin analysis diagnostic workflow.
 */
export function useSkinAnalysis() {
  const [step, setStep] = useState(SCAN_STEPS.SETUP);
  const [images, setImages] = useState({ front: null, left: null, right: null });
  const [skinType, setSkinType] = useState('combination');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const setImageForStep = useCallback((stepKey, dataUrl) => {
    setImages((prev) => ({
      ...prev,
      [stepKey]: dataUrl
    }));
  }, []);

  const runAnalysis = useCallback(async (customImages = images, customSkinType = skinType) => {
    setIsAnalyzing(true);
    setError(null);
    setStep(SCAN_STEPS.ANALYZING);

    try {
      const analysisData = await analyzeSkin({
        images: customImages,
        skinType: customSkinType
      });
      setResult(analysisData);
      setStep(SCAN_STEPS.RESULTS);
      return analysisData;
    } catch (err) {
      console.error('[useSkinAnalysis] Analysis error:', err);
      setError(err.message || 'Không thể hoàn tất phân tích da.');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [images, skinType]);

  const reset = useCallback(() => {
    setStep(SCAN_STEPS.SETUP);
    setImages({ front: null, left: null, right: null });
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    step,
    setStep,
    images,
    setImageForStep,
    skinType,
    setSkinType,
    isAnalyzing,
    result,
    error,
    runAnalysis,
    reset
  };
}
