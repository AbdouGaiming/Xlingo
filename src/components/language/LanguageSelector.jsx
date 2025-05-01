import React, { useState } from 'react';
import './LanguageSelector.scss';

// Language options with flags, name, and difficulty info
const languages = [
  { 
    id: 'es', 
    name: 'Spanish', 
    flag: '🇪🇸',
    difficulty: 'Easy to Medium',
    speakers: '580 million',
    description: 'One of the world\'s most spoken languages with similarities to English'
  },
  { 
    id: 'de', 
    name: 'German', 
    flag: '🇩🇪',
    difficulty: 'Medium',
    speakers: '130 million',
    description: 'Logical language structure with compound words and cases'
  },
  { 
    id: 'it', 
    name: 'Italian', 
    flag: '🇮🇹',
    difficulty: 'Easy',
    speakers: '85 million',
    description: 'Melodic language with consistent pronunciation rules'
  },
  { 
    id: 'fr', 
    name: 'French', 
    flag: '🇫🇷',
    difficulty: 'Medium',
    speakers: '280 million',
    description: 'Elegant language with subtle pronunciation nuances'
  },
  { 
    id: 'jp', 
    name: 'Japanese', 
    flag: '🇯🇵',
    difficulty: 'Hard',
    speakers: '125 million',
    description: 'Complex writing system with unique grammatical structure'
  },
];

const LanguageSelector = ({ onSelectLanguage }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSelectLanguage = (language) => {
    setSelectedLanguage(language);
    setShowDetails(true);
  };

  const confirmSelection = () => {
    if (selectedLanguage) {
      onSelectLanguage(selectedLanguage);
      setShowDetails(false);
    }
  };

  return (
    <div className="language-selector-container">
      <h2 className="language-selector-title">Choose Your Language Adventure</h2>
      <p className="language-selector-subtitle">Select a language to start your learning journey</p>
      
      <div className="language-grid">
        {languages.map((language) => (
          <div 
            key={language.id}
            className={`language-card ${selectedLanguage?.id === language.id ? 'selected' : ''}`}
            onClick={() => handleSelectLanguage(language)}
          >
            <div className="language-flag">{language.flag}</div>
            <h3 className="language-name">{language.name}</h3>
            <div className="language-difficulty">
              Difficulty: <span>{language.difficulty}</span>
            </div>
          </div>
        ))}
      </div>

      {showDetails && selectedLanguage && (
        <div className="language-details">
          <h3>{selectedLanguage.flag} {selectedLanguage.name}</h3>
          <p><strong>Native Speakers:</strong> {selectedLanguage.speakers}</p>
          <p><strong>Difficulty Level:</strong> {selectedLanguage.difficulty}</p>
          <p>{selectedLanguage.description}</p>
          
          <div className="language-actions">
            <button className="back-button" onClick={() => setShowDetails(false)}>
              Back to Languages
            </button>
            <button className="confirm-button" onClick={confirmSelection}>
              Start Learning {selectedLanguage.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;