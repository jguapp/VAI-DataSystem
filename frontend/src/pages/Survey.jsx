import React, { useState } from 'react';
import SurveyQuestion from '../components/SurveyQuestion';
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/survey.css';
import API from '../utils/apiClient';
import surveyQuestions from '../data/surveyQuestions';
import { useTranslation } from 'react-i18next';

export default function SurveyPage() {
  const { installationId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const current = surveyQuestions[currentIndex];
  const questionKey = current.questionId;

  const translatedQuestion = t(`questions.${questionKey}.question`);
  const translatedOptions = current.type === 'range'
    ? current.options
    : t(`questions.${questionKey}.options`, { returnObjects: true });

  const handleAnswerChange = (key, answer) => {
    setAnswers((prev) => ({ ...prev, [key]: answer }));
  };

  const handleNext = () => {
    if (!answers[questionKey] || answers[questionKey].length === 0) {
      setError(t('survey.error'));
      return;
    }
    setError('');
    if (currentIndex < surveyQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate('/survey-complete');
    }
  };

  const handleBack = () => {
    setError('');
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/submit-survey', { installationId, responses: answers });
      navigate('/survey-complete');
    } catch (err) {
      setError(err.response?.data?.message || t('survey.submissionError'));
    }
  };

  return (
    <>
      <Navbar />
      <div className="survey-page">
        <h2>{t(`survey.installations.${installationId}`)}</h2>
        <img
          src={installationId === 'common-ground' ? '/Common_Ground.jpeg' : '/Breathing_Pavilion.jpeg'}
          alt={installationId}
          className="survey-img"
        />
        <br />

        <div className="progress-container">
          <div className="progress-text">
            {t('survey.progress', { current: currentIndex + 1, total: surveyQuestions.length })}
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentIndex + 1) / surveyQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <SurveyQuestion
          question={translatedQuestion}
          options={translatedOptions}
          multiple={current.multiple}
          questionType={current.type || 'choice'}
          currentAnswer={answers[questionKey] || []}
          onAnswer={(answer) => handleAnswerChange(questionKey, answer)}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentIndex === 0}
          isLast={currentIndex === surveyQuestions.length - 1}
          handleSubmit={handleSubmit}
        />

        {error && <p className="error-message">{error}</p>}
      </div>
    </>
  );
}
