import React, { useState, useEffect, useRef } from 'react';
import './PronunciationPractice.scss';

const PronunciationPractice = ({ languageId = 'es' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);
  
  // Mock phrases for different languages
  const phrases = {
    es: [
      { id: 1, text: 'Buenos días', translation: 'Good morning', difficulty: 'easy' },
      { id: 2, text: '¿Cómo estás?', translation: 'How are you?', difficulty: 'easy' },
      { id: 3, text: 'Me gustaría un café, por favor', translation: 'I would like a coffee, please', difficulty: 'medium' },
      { id: 4, text: 'El murciélago vuela rápido en la noche', translation: 'The bat flies fast at night', difficulty: 'hard' },
      { id: 5, text: 'La pronunciación es importante', translation: 'Pronunciation is important', difficulty: 'medium' }
    ],
    de: [
      { id: 1, text: 'Guten Tag', translation: 'Good day', difficulty: 'easy' },
      { id: 2, text: 'Wie geht es dir?', translation: 'How are you?', difficulty: 'easy' },
      { id: 3, text: 'Ich hätte gerne einen Kaffee, bitte', translation: 'I would like a coffee, please', difficulty: 'medium' },
      { id: 4, text: 'Die Fledermaus fliegt schnell in der Nacht', translation: 'The bat flies fast at night', difficulty: 'hard' },
      { id: 5, text: 'Die Aussprache ist wichtig', translation: 'Pronunciation is important', difficulty: 'medium' }
    ],
    fr: [
      { id: 1, text: 'Bonjour', translation: 'Hello', difficulty: 'easy' },
      { id: 2, text: 'Comment ça va?', translation: 'How are you?', difficulty: 'easy' },
      { id: 3, text: 'Je voudrais un café, s\'il vous plaît', translation: 'I would like a coffee, please', difficulty: 'medium' },
      { id: 4, text: 'La chauve-souris vole vite dans la nuit', translation: 'The bat flies fast at night', difficulty: 'hard' },
      { id: 5, text: 'La prononciation est importante', translation: 'Pronunciation is important', difficulty: 'medium' }
    ],
    it: [
      { id: 1, text: 'Buongiorno', translation: 'Good morning', difficulty: 'easy' },
      { id: 2, text: 'Come stai?', translation: 'How are you?', difficulty: 'easy' },
      { id: 3, text: 'Vorrei un caffè, per favore', translation: 'I would like a coffee, please', difficulty: 'medium' },
      { id: 4, text: 'Il pipistrello vola veloce nella notte', translation: 'The bat flies fast at night', difficulty: 'hard' },
      { id: 5, text: 'La pronuncia è importante', translation: 'Pronunciation is important', difficulty: 'medium' }
    ]
  };

  // Select a language or default to Spanish if not available
  const currentLanguagePhrases = phrases[languageId] || phrases.es;
  
  useEffect(() => {
    // Select the first phrase when component mounts
    if (currentLanguagePhrases.length > 0 && !currentPhrase) {
      setCurrentPhrase(currentLanguagePhrases[0]);
    }
  }, [currentLanguagePhrases, currentPhrase]);
  
  // Function to play the model pronunciation
  const playModelPronunciation = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    } else {
      // In a real app, this would fetch the audio from an API
      console.log('Playing model pronunciation for:', currentPhrase.text);
      // Mock the audio being loaded
      setTimeout(() => {
        setAudioUrl('mock-audio-url');
        // In a real app, we would set the actual audio URL here
      }, 500);
    }
  };
  
  // Start recording user's voice
  const startRecording = () => {
    setIsRecording(true);
    setFeedback(null);
    
    // In a real app, this would start recording via Web Audio API
    console.log('Started recording...');
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };
  
  // Stop recording and analyze pronunciation
  const stopRecording = () => {
    setIsRecording(false);
    
    // In a real app, this would stop recording and send audio to backend for analysis
    console.log('Stopped recording. Analyzing pronunciation...');
    
    // Mock analysis - in a real app this would come from a speech recognition API
    const mockAnalysis = analyzePronunciation(currentPhrase);
    setFeedback(mockAnalysis);
    
    // Update progress
    const newCompleted = completed + 1;
    setCompleted(newCompleted);
    setProgress((newCompleted / currentLanguagePhrases.length) * 100);
    
    // Update score
    setScore(prevScore => prevScore + mockAnalysis.accuracyScore);
  };
  
  // Mock function to analyze pronunciation - in a real app this would use a speech recognition API
  const analyzePronunciation = (phrase) => {
    // Mock analysis with random accuracy between 70-98% for demo purposes
    const accuracy = Math.floor(Math.random() * 29) + 70;
    
    let feedback;
    let improvementTips = [];
    
    if (accuracy > 90) {
      feedback = 'Excellent pronunciation!';
    } else if (accuracy > 80) {
      feedback = 'Good pronunciation with minor issues.';
      
      // Add specific feedback based on language and difficulty
      if (languageId === 'es' && phrase.difficulty === 'hard') {
        improvementTips.push('Try rolling your "r" sounds more.');
      } else if (languageId === 'fr') {
        improvementTips.push('Focus on the nasal vowel sounds.');
      } else if (languageId === 'de') {
        improvementTips.push('Work on the "ch" sound at the end of words.');
      }
    } else {
      feedback = 'Needs improvement.';
      
      // More detailed feedback for lower scores
      if (languageId === 'es') {
        improvementTips.push('Practice the vowel sounds - keep them short and crisp.');
        improvementTips.push('Work on your stress patterns in longer words.');
      } else if (languageId === 'fr') {
        improvementTips.push('Focus on linking words together smoothly.');
        improvementTips.push('Practice the "r" sound from the back of your throat.');
      } else if (languageId === 'de') {
        improvementTips.push('Practice the umlauts (ä, ö, ü) sounds.');
        improvementTips.push('Work on word stress in compound words.');
      } else {
        improvementTips.push('Listen carefully to the model pronunciation and try again.');
      }
    }
    
    // Simulate problematic areas in the phrase (word-by-word feedback)
    const words = phrase.text.split(' ');
    const wordAccuracy = words.map(word => {
      // Random accuracy per word, but keeping overall pattern related to total accuracy
      const wordAcc = Math.min(100, Math.max(50, accuracy + (Math.random() * 20 - 10)));
      return {
        word,
        accuracy: wordAcc,
        status: wordAcc > 85 ? 'good' : wordAcc > 70 ? 'fair' : 'poor'
      };
    });
    
    return {
      overallFeedback: feedback,
      accuracyScore: accuracy,
      wordByWord: wordAccuracy,
      improvementTips
    };
  };
  
  // Move to the next phrase
  const handleNextPhrase = () => {
    const currentIndex = currentLanguagePhrases.findIndex(p => p.id === currentPhrase.id);
    const nextIndex = (currentIndex + 1) % currentLanguagePhrases.length;
    setCurrentPhrase(currentLanguagePhrases[nextIndex]);
    setFeedback(null);
  };
  
  return (
    <div className="pronunciation-practice-container">
      <div className="practice-header">
        <h2>Pronunciation Practice</h2>
        <div className="practice-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-stats">
            <span>{completed}/{currentLanguagePhrases.length} phrases</span>
            <span className="score">Score: {Math.round(score / Math.max(1, completed))}</span>
          </div>
        </div>
      </div>
      
      {currentPhrase && (
        <div className="practice-content">
          <div className="phrase-card">
            <div className="phrase-text">
              <h3>{currentPhrase.text}</h3>
              <p className="translation">{currentPhrase.translation}</p>
              <div className="difficulty-badge">{currentPhrase.difficulty}</div>
            </div>
            
            <div className="pronunciation-controls">
              <button 
                className="listen-button"
                onClick={playModelPronunciation}
              >
                <span className="button-icon">🔊</span>
                Listen
              </button>
              
              <button 
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? null : startRecording}
                disabled={isRecording}
              >
                <span className="button-icon">{isRecording ? '⏺️' : '🎤'}</span>
                {isRecording ? 'Recording...' : 'Speak'}
              </button>
            </div>
          </div>
          
          {feedback && (
            <div className="feedback-section">
              <div className="feedback-header">
                <h4>Pronunciation Feedback</h4>
                <div className="accuracy-meter">
                  <div className="accuracy-label">Accuracy</div>
                  <div className="accuracy-bar">
                    <div 
                      className={`accuracy-fill ${feedback.accuracyScore > 90 ? 'excellent' : feedback.accuracyScore > 80 ? 'good' : 'needs-work'}`}
                      style={{ width: `${feedback.accuracyScore}%` }}
                    ></div>
                  </div>
                  <div className="accuracy-score">{feedback.accuracyScore}%</div>
                </div>
              </div>
              
              <div className="feedback-details">
                <p className="overall-feedback">{feedback.overallFeedback}</p>
                
                <div className="word-feedback">
                  {feedback.wordByWord.map((word, index) => (
                    <span 
                      key={index} 
                      className={`word-highlight ${word.status}`}
                      title={`Accuracy: ${Math.round(word.accuracy)}%`}
                    >
                      {word.word}
                    </span>
                  ))}
                </div>
                
                {feedback.improvementTips.length > 0 && (
                  <div className="improvement-tips">
                    <h5>Tips to improve:</h5>
                    <ul>
                      {feedback.improvementTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <button className="next-phrase-button" onClick={handleNextPhrase}>
                Next Phrase
              </button>
            </div>
          )}
        </div>
      )}
      
      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
};

export default PronunciationPractice;