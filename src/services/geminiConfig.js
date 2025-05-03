// Singleton for API key management
const ApiKeyManager = {
  // The API key is stored in localStorage for persistence
  getApiKey: () => {
    // First check localStorage
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) return storedKey;
    
    // Default demo key as fallback
    const defaultKey = 'AIzaSyALeskX5uyT0-KlqSO5iI3_9cmc-o_Q7zI';
    localStorage.setItem('GEMINI_API_KEY', defaultKey);
    return defaultKey;
  },
  
  // Method to update the API key
  setApiKey: (key) => {
    localStorage.setItem('GEMINI_API_KEY', key);
  },
  
  // Check if using the default key
  isUsingDefaultKey: () => {
    const currentKey = localStorage.getItem('GEMINI_API_KEY');
    return currentKey === 'AIzaSyALeskX5uyT0-KlqSO5iI3_9cmc-o_Q7zI';
  }
};

// Configuration for Gemini API
const config = {
  // Get API key from the centralized manager
  get API_KEY() {
    return ApiKeyManager.getApiKey();
  },
  
  // Model configurations
  models: {
    default: "gemini-pro",
    chat: "gemini-pro",
    vision: "gemini-pro-vision"
  },
  
  // Default prompting parameters
  defaultParams: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
};

export { ApiKeyManager };
export default config;