# OpenRouter API Integration

## Description
This PR enhances the chat functionality by implementing a robust OpenRouter API integration. It adds model selection capabilities, temperature control, and max token settings to allow users to customize their AI assistant experience.

## Changes
- Enhanced the OpenRouter API client with:
  - Actual API calls to OpenRouter
  - Support for multiple AI models (GPT, Claude, Llama, etc.)
  - Proper error handling and fallback responses
- Added new models:
  - Gemini 2.0 Flash Thinking (set as default)
  - Claude 3.7 Sonnet
  - Gemma 3 27B
  - DeepSeek R1
- Created a model selector component for choosing different AI models
- Added a settings dialog with:
  - Model selection dropdown
  - Temperature slider for controlling response creativity
  - Max tokens slider for controlling response length
- Updated the ChatContainer component to use the new OpenRouter integration
- Added necessary UI components (Dialog, Slider, Label)

## Testing Done
- Verified that the chat interface loads correctly
- Tested model selection functionality
- Confirmed that temperature and max token settings work as expected
- Tested error handling for network issues and missing API keys

## Screenshots
N/A

## Checklist
- [x] Code follows the project's coding standards
- [x] Documentation has been updated as needed
- [x] All tests pass
- [x] No new warnings or errors introduced

## Additional Notes
This PR builds on the previous Firebase integration PR and completes the implementation plan for the AI-Dev Education Platform's chat functionality. Users can now interact with various AI models and customize the behavior of their AI assistant. 