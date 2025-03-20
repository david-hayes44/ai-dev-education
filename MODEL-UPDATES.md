# AI Model Updates for Chat Assistant

This document outlines the recent updates to the AI models used in the chat assistant functionality of the AI Dev Education platform.

## Updated Model IDs

The following model IDs have been updated to ensure compatibility with OpenRouter:

1. **Gemini 2.0 Flash Thinking** - `google/gemini-2.0-flash-thinking-exp:free`
   - A fast, efficient model with experimental thinking capabilities.
   - Requires both logging and model training privacy settings to be enabled.

2. **Gemini 2.0 Flash Lite** - `google/gemini-2.0-flash-lite-preview-02-05:free`
   - A lightweight Gemini model optimized for speed and efficiency.
   - Works with default privacy settings.
   - Replaces the previous Gemma 3 model.

3. **DeepSeek R1** - `deepseek/deepseek-r1:free`
   - DeepSeek's cutting-edge research model with strong reasoning capabilities.
   - Requires both logging and model training privacy settings to be enabled.

## API Key Setup

To use these models, you need to set up an OpenRouter API key:

1. Go to [OpenRouter](https://openrouter.ai/) and create an account or log in
2. Generate an API key from your dashboard
3. Open the `.env.local` file in the root of the project
4. Replace the placeholder value with your actual API key:
   ```
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_actual_api_key_here
   ```

## Required Privacy Settings

To use all models, you must configure the following OpenRouter privacy settings:

1. Visit https://openrouter.ai/settings/privacy
2. Enable **"Enable input/output logging"** - this allows OpenRouter to log your API requests
3. Enable **"Enable providers that may train on inputs"** - this allows model providers to potentially use your data for training

These settings are required for Gemini 2.0 Flash Thinking and DeepSeek R1 models. The Gemini 2.0 Flash Lite model may work without these settings, but enabling them ensures all models function properly.

## Default Model Configuration

The application is configured to use Gemini 2.0 Flash Thinking as the default model when all privacy settings are enabled. If you prefer not to enable these settings, the application will fall back to using Gemini 2.0 Flash Lite, which works with more restrictive privacy settings.

## Testing Your Setup

Test scripts are available to verify your model access:

```bash
node scripts/test-models.js
```

This script will:
- Verify your API key is properly configured
- Test access to all three models
- Report any errors or connectivity issues

For detailed testing of a specific model:
```bash
node scripts/test-single-model.js
```

## Troubleshooting

If you encounter issues:

1. Ensure your API key is correctly entered in `.env.local`
2. Verify that both privacy settings are enabled in your OpenRouter account
3. Check that you have sufficient access/credits for these models in OpenRouter
4. Review the OpenRouter dashboard for any rate limiting or service issues 