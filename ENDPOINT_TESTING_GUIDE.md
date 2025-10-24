# Endpoint Testing Guide for APK Preparation

This guide organizes all backend endpoints into testable groups to ensure everything works correctly before building the APK.

## Test Status Legend
- ✅ Pass - Endpoint works correctly
- ❌ Fail - Endpoint has issues
- ⏳ Pending - Not yet tested
- ⚠️ Partial - Works with limitations

---

## Group 1: Content Generation & Media Endpoints

### 1.1 generateContent Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Generate an Instagram post about healthy eating in a friendly tone"
3. Verify: Content item appears in content queue
4. Verify: System log shows success

**Expected behavior:**
- Content item created
- System log: "Generated post for Instagram"
- Insight added with AI action

---

### 1.2 generateMedia Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Generate an image of a sunset over mountains"
3. Verify: AI task queued for image_generation
4. Verify: System log shows "Queued image generation"

**Expected behavior:**
- AI task created with priority "high"
- System log recorded
- Insight created with generation request

---

### 1.3 analyzeImage Feature
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Click the paperclip (media upload) button
3. Select an image from gallery
4. Image should appear in preview area
5. Send to Jarvis for analysis

**Expected behavior:**
- Image uploads successfully
- Image appears as preview thumbnail
- Can remove uploaded images
- Jarvis receives image with base64 data
- AI provides analysis of image content

---

## Group 2: Social & Analytics Endpoints

### 2.1 analyzeTrends Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Analyze trends on TikTok for fitness and nutrition over the last 7 days"
3. Verify: Multiple trend items added
4. Check Trend Analysis page for new trends

**Expected behavior:**
- Trends created for each topic
- System log: "Analyzed trends for TikTok"
- Insight shows number of topics analyzed

---

### 2.2 schedulePost Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Schedule a post titled 'Morning Motivation' for Instagram tomorrow at 9am"
3. Check Scheduler page for new scheduled task

**Expected behavior:**
- Scheduled task created
- Appears in Scheduler with correct time
- System log recorded
- Insight created

---

### 2.3 connectPlatform Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Connect my TikTok account @testuser as a social platform"
3. Check Social Connect page

**Expected behavior:**
- Platform appears in connected platforms
- System log: "Connected TikTok"
- Insight recorded

---

### 2.4 updateMetrics Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Update my metrics: 10000 followers, 5.5% engagement rate, $2500 monthly revenue"
3. Check Analytics page

**Expected behavior:**
- Metrics updated in Analytics
- System log recorded
- Numbers reflect correctly

---

## Group 3: Revenue & Monetization Endpoints

### 3.1 optimizeMonetization Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "My current revenue is $1000 from Instagram and YouTube. My goal is $5000"
3. Verify: Insight created with strategy

**Expected behavior:**
- Insight with revenue strategy
- System log: "Generated monetization optimization plan"
- Response includes timeline and confidence level

---

### 3.2 createRevenueStream Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Create a sponsorship revenue stream on YouTube worth $500 per month"
3. Check Monetization page

**Expected behavior:**
- Revenue stream appears in Monetization
- Shows correct type and amount
- System log recorded
- Insight created

---

## Group 4: Workflow & Automation Endpoints

### 4.1 automateWorkflow Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Automate posting daily on Instagram at 8am and 6pm"
3. Check Workflow Rules page

**Expected behavior:**
- AI task created for automation
- System log recorded
- Insight shows automation setup

---

### 4.2 createPersona Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Create a persona named FitnessPro targeting gym enthusiasts with an energetic tone about fitness and nutrition"
3. Check Persona Builder page

**Expected behavior:**
- Persona appears in list
- Shows correct details
- System log recorded
- Insight created

---

## Group 5: IoT & Development Endpoints

### 5.1 Backend Endpoint: writeFile
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Write a TypeScript file at utils/helpers.ts with a function that returns hello world"
3. Check if file was created

**Expected behavior:**
- File created in correct location
- System log: "File operation: create utils/helpers.ts"
- Success response returned

---

### 5.2 Backend Endpoint: executeCode
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Execute this JavaScript code: console.log('Hello from JARVIS')"
3. Check response

**Expected behavior:**
- Code executes successfully
- Output returned: "Hello from JARVIS"
- System log recorded
- Insight shows execution result

---

### 5.3 Backend Endpoint: createProject
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Create a new React web app project named test-app in the projects directory"
3. Verify response

**Expected behavior:**
- Project scaffolding initiated
- System log recorded
- Response includes project path
- Insight created

---

### 5.4 Backend Endpoint: gitOperation
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Check git status"
3. Verify response

**Expected behavior:**
- Git status retrieved
- System log recorded
- Response includes git output

---

### 5.5 Backend Endpoint: manageDependencies
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Install lodash using npm"
3. Check response

**Expected behavior:**
- Package installation initiated
- System log recorded
- Success/failure message returned

---

### 5.6 controlIoTDevice Tool
**Status:** ⏳ Pending
**How to test:**
1. First add a test IoT device
2. Open Jarvis AI Assistant
3. Say: "Add a smart light named TestLight at IP 192.168.1.100"
4. Then say: "Turn on TestLight"

**Expected behavior:**
- Device added to IoT list
- Command executed
- System logs recorded
- Insights created

---

## Group 6: Codebase Analysis Endpoints

### 6.1 analyzeCodebase Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Give me an overview of the codebase"
3. Check response

**Expected behavior:**
- Overview provided with file counts
- System log: "Codebase overview generated"
- Response includes architecture details

---

### 6.2 searchCodebase Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Search for files containing 'context'"
3. Check response

**Expected behavior:**
- List of matching files returned
- System log recorded
- Results limited to 5 with "more" indicator

---

### 6.3 getCodeInsights Tool
**Status:** ⏳ Pending
**How to test:**
1. Open Jarvis AI Assistant
2. Say: "Get code insights for security"
3. Check response

**Expected behavior:**
- Security insights returned
- System log: "Retrieved code insights"
- Insights include severity levels and suggestions

---

## Testing Checklist for APK Build

### Pre-Build Checks
- [ ] All Group 1 tests pass
- [ ] All Group 2 tests pass
- [ ] All Group 3 tests pass
- [ ] All Group 4 tests pass
- [ ] All Group 5 tests pass
- [ ] All Group 6 tests pass
- [ ] Voice recognition works (mic button)
- [ ] Voice output works (speaker icon)
- [ ] Media upload works (paperclip button)
- [ ] All UI pages load correctly
- [ ] No TypeScript errors
- [ ] No console errors

### Performance Checks
- [ ] App loads in under 3 seconds
- [ ] No memory leaks during extended use
- [ ] Smooth animations on lower-end devices
- [ ] Voice responses are timely

### Integration Checks
- [ ] Backend responds to all tRPC calls
- [ ] AsyncStorage persists data correctly
- [ ] Images upload and display correctly
- [ ] Audio recording works on both Android/iOS

---

## Known Issues & Limitations

1. **Voice Recognition**: Web implementation uses browser API, mobile uses expo-av
2. **File Operations**: Limited to specific directories for security
3. **Code Execution**: Only JavaScript and Python supported
4. **IoT Devices**: Mock implementation, requires actual device integration

---

## Next Steps After Testing

1. Document all failed tests with error messages
2. Fix critical issues before APK build
3. Create bug report for non-critical issues
4. Update this document with test results
5. Proceed with `eas build --platform android` when all critical tests pass

---

## Test Log Template

Copy and use this template to record your test results:

```
## Test Run: [Date]
Tester: [Your Name]
Device: [Device Model]
OS: [Android/iOS Version]

### Group 1: Content Generation & Media
- generateContent: [✅/❌] [Notes]
- generateMedia: [✅/❌] [Notes]
- analyzeImage: [✅/❌] [Notes]

### Group 2: Social & Analytics
- analyzeTrends: [✅/❌] [Notes]
- schedulePost: [✅/❌] [Notes]
- connectPlatform: [✅/❌] [Notes]
- updateMetrics: [✅/❌] [Notes]

[Continue for all groups...]

### Issues Found:
1. [Issue description]
2. [Issue description]

### Overall Status:
Ready for APK: [YES/NO]
Critical Issues: [Count]
Minor Issues: [Count]
```
