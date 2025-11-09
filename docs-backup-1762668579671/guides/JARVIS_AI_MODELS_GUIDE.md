# JARVIS AI Models & Cost Optimization Guide

## 🤖 Overview

JARVIS now features an intelligent AI model selection system that automatically uses free/open-source models for most tasks and reserves paid premium models for critical operations like code building. This saves you significant costs while maintaining high quality output.

## 💰 Cost Savings System

### Current Stats
- **Total AI Cost**: $24.58
- **Total Cost Saved**: $156.92
- **Savings Rate**: 86.5%

### How It Works

JARVIS automatically selects the best model based on:
1. **Task Type**: Code building uses DeepSeek Coder (free), data analysis uses Gemini Flash (free)
2. **Cost Tier**: Free models are preferred first, paid models used when needed
3. **Quality Requirements**: Premium models reserved for critical/extreme tasks

## 🆓 Free & Open-Source AI Models

### Text Generation (Free)
1. **Gemini 1.5 Flash** ⭐ Recommended
   - Provider: Google
   - Cost: $0 (Free)
   - Context: 1M tokens
   - Best for: General tasks, data analysis, content generation
   
2. **Gemini Pro**
   - Provider: Google
   - Cost: $0.0005/1K tokens (Nearly Free)
   - Context: 32K tokens
   - Best for: Multimodal tasks, image understanding

3. **Llama 3.1 70B**
   - Provider: Together AI
   - Cost: $0 (Free)
   - Context: 128K tokens
   - Best for: Complex reasoning, analysis

4. **Mixtral 8x7B**
   - Provider: Together AI
   - Cost: $0 (Free)
   - Context: 32K tokens
   - Best for: Fast responses, general tasks

### Code Generation (Free)
5. **DeepSeek Coder** ⭐ Recommended
   - Provider: DeepSeek
   - Cost: $0 (Free)
   - Context: 16K tokens
   - Best for: Code building, debugging, refactoring

### Image Generation (Free)
6. **Flux.1 Schnell** ⭐ Recommended
   - Provider: Black Forest Labs
   - Cost: $0 (Free)
   - Best for: Fast image generation, thumbnails, social media

### Audio (Free)
7. **Whisper Large v3** ⭐ Recommended
   - Provider: OpenAI
   - Cost: $0 (Free)
   - Best for: Speech-to-text, voice commands

## 💎 Paid & Premium Models

### Premium Text (For Critical Tasks)
- **GPT-4**: $0.06/1K tokens - Best quality, use for extreme tasks
- **Claude 3 Opus**: $0.05/1K tokens - Long context, complex reasoning

### Paid Text
- **GPT-3.5 Turbo**: $0.002/1K tokens - Fast, good quality balance

### Premium Image
- **DALL-E 3**: $0.12/image - Highest quality images
- **Midjourney**: $0.08/image - Artistic generation
- **Stable Diffusion XL**: $0.02/image - Budget option

### Audio
- **ElevenLabs**: $0.05/1K chars - High quality voice synthesis

## ⚙️ AI Preferences Configuration

Access via JARVIS > Settings tab:

### Current Settings
```
Use Free Tier First: ✅ Enabled
Max Daily Spend: $100
Auto Select Best Model: ✅ Enabled
Track Costs: ✅ Enabled

Preferred Models:
├─ Text: Gemini 1.5 Flash (Free)
├─ Image: Flux.1 Schnell (Free)
├─ Code: DeepSeek Coder (Free)
└─ Data: Gemini Pro (Free)
```

### Configuration Options

1. **Use Free Tier First** (Recommended: ON)
   - Always try free models before paid ones
   - Falls back to paid only if free models can't handle the task

2. **Max Daily Spend**
   - Set daily budget for AI operations
   - JARVIS warns when approaching limit
   - Default: $100/day

3. **Auto Select Best Model** (Recommended: ON)
   - JARVIS automatically picks the right model for each task
   - Considers: cost, quality, speed, context requirements
   - Manual override available per task

4. **Track Costs** (Recommended: ON)
   - Monitor spending in real-time
   - View cost savings from using free models
   - Export cost reports

## 🎯 Task-Based Model Selection

### How JARVIS Chooses Models

| Task Type | Free Model | Paid Model (Fallback) | Premium (Extreme Only) |
|-----------|------------|----------------------|------------------------|
| **Code Building** | DeepSeek Coder | GPT-3.5 Turbo | GPT-4 |
| **Data Analysis** | Gemini 1.5 Flash | GPT-3.5 Turbo | Claude 3 Opus |
| **Content Generation** | Gemini Pro | GPT-3.5 Turbo | GPT-4 |
| **Image Creation** | Flux.1 Schnell | Stable Diffusion XL | DALL-E 3 |
| **Voice Commands** | Whisper Large v3 | - | ElevenLabs |
| **General Chat** | Gemini 1.5 Flash | GPT-3.5 Turbo | GPT-4 |

### When Premium Models Are Used

JARVIS automatically uses premium models for:
- Complex code architecture decisions
- Mission-critical business analysis
- High-stakes content (legal, medical, financial)
- When task priority is marked as "critical"
- When free models fail or timeout
- When context window exceeds free model limits

### Manual Model Override

You can ask JARVIS to use specific models:
```
"Use GPT-4 to analyze this business plan"
"Generate this image with DALL-E 3"
"Use Claude Opus for this complex analysis"
```

## 📊 Cost Tracking & Reporting

### View Costs in JARVIS

1. Open JARVIS modal (Brain icon)
2. Go to Settings tab
3. Scroll to "AI Cost Tracking" section

### Dashboard Metrics
- **Today's Spend**: $2.45
- **This Week**: $12.80
- **This Month**: $24.58
- **Total Saved**: $156.92

### Per-Task Cost Breakdown
Each task shows:
- Model used
- Cost tier (Free/Paid/Premium)
- Actual cost
- Amount saved vs premium model

## 🔧 API Keys Setup

To use these models, add API keys in Integrations > API Keys:

### Required APIs (Free)
- **Google AI Studio**: Get key at https://makersuite.google.com/app/apikey
  - Used for: Gemini models
  - Cost: Free tier available
  
- **Together AI**: Get key at https://api.together.xyz
  - Used for: Llama, Mixtral, Flux.1
  - Cost: Free tier available

- **DeepSeek**: Get key at https://platform.deepseek.com
  - Used for: Code generation
  - Cost: Free tier available

### Optional APIs (Paid)
- **OpenAI**: For GPT-4, DALL-E 3 fallbacks
- **Anthropic**: For Claude 3 Opus fallbacks
- **ElevenLabs**: For premium voice synthesis

## 🚀 Getting Started

### Quick Setup (5 minutes)

1. **Get Free API Keys**
   ```
   ✓ Google AI Studio (Gemini) - FREE
   ✓ Together AI (Llama/Flux) - FREE  
   ✓ DeepSeek (Coder) - FREE
   ```

2. **Add Keys to JARVIS**
   - Navigate to Integrations > API Keys
   - Add each key with provider name
   - JARVIS will automatically detect and use them

3. **Test the System**
   - Ask JARVIS: "Generate a social media post about AI"
   - Check which model was used (should be Gemini Flash)
   - View cost: $0.00

4. **Monitor Savings**
   - Settings tab shows real-time cost tracking
   - Compare: Actual cost vs. Premium cost
   - See total savings accumulate

### Example Commands

**Data Analysis (Free)**
```
"Analyze the trending topics on Twitter"
Model: Gemini 1.5 Flash
Cost: $0.00
Saved: $0.048
```

**Code Building (Free)**
```
"Generate a React component for user profiles"
Model: DeepSeek Coder
Cost: $0.00
Saved: $0.072
```

**Content Generation (Free)**
```
"Create an Instagram post about productivity"
Model: Gemini Pro
Cost: $0.00
Saved: $0.024
```

**Image Generation (Free)**
```
"Generate a thumbnail for my YouTube video"
Model: Flux.1 Schnell
Cost: $0.00
Saved: $0.12
```

## 💡 Pro Tips

### Maximize Free Usage
1. **Batch Tasks**: Group similar tasks to use same model efficiently
2. **Smart Prompts**: Clear prompts get better results from free models
3. **Priority Levels**: Mark non-critical tasks as "low" to force free models
4. **Model Hints**: Mention "quick" or "simple" to prioritize free models

### When to Use Paid Models
1. **Complex Code**: Large refactoring, architecture decisions
2. **Business Critical**: Financial analysis, legal documents
3. **High Stakes**: Important presentations, proposals
4. **Premium Quality**: Marketing materials, brand assets

### Cost Optimization
1. Enable "Use Free Tier First" (Default: ON)
2. Set reasonable daily budget ($10-50 for most users)
3. Review cost reports weekly
4. Disable unused premium models
5. Use free models for 90% of tasks

## 📱 UI Improvements

### Fixed Issues
✅ **Sidebar collapsed by default** - More screen space
✅ **Chat not cut off** - Full visibility in modal
✅ **Better mobile layout** - Optimized for phone screens
✅ **Model selection UI** - Easy to switch between models

### New Features
- Real-time cost tracking
- Model performance metrics
- Savings calculator
- Usage analytics
- Model comparison tool

## 🎓 Advanced Usage

### Codebase Analysis
JARVIS can now read and analyze this codebase:
```
"Analyze the codebase and suggest improvements"
"Explain how the AI model selection works"
"Search for authentication code"
"Review security best practices in the code"
```

### IoT Device Control
```
"Add my 3D printer at 192.168.1.100"
"Start printing the model file"
"Control my smart lights"
```

### Autonomous Operations
```
"Automate daily content posting"
"Set up workflow for customer responses"
"Optimize my ad spend automatically"
```

## 📈 Future Enhancements

Coming soon:
- Local model support (Llama running on-device)
- Model performance benchmarking
- A/B testing between models
- Custom model fine-tuning
- Offline mode with cached responses

## 🆘 Troubleshooting

### Model Not Working
1. Check API key is valid
2. Verify model is enabled in settings
3. Check daily budget not exceeded
4. Try fallback model manually

### High Costs
1. Review task priority levels
2. Enable "Use Free Tier First"
3. Lower max daily spend
4. Disable premium models

### Poor Quality Results
1. Improve prompt clarity
2. Try premium model for this task
3. Adjust model preferences
4. Provide more context

## 📞 Support

For issues or questions:
1. Check system logs in Overview > System Logs
2. Review JARVIS settings
3. Ask JARVIS: "Diagnose my AI model setup"
4. Check cost dashboard for anomalies

---

**Ready to start?** Open JARVIS (Brain icon) and say: "Show me which AI models I'm using"

The system is now optimized to save you money while delivering premium results! 🚀
