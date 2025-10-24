import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Sparkles, FileText, Image as ImageIcon, Video, Mic, Hash, TrendingUp, Target, Calendar, Clock, Globe, Users, Heart, Share2, Eye, Edit3, Trash2, Copy, Download, Save, Zap, Brain, Lightbulb, Settings, BarChart3, DollarSign, Filter, Search, BookOpen, BookMarked, Layers, Grid, List, Check, ChevronRight, ChevronDown, ChevronUp, Star, CheckCircle, ArrowUpRight, Upload } from 'lucide-react-native';

export default function ContentEngine() {
  const { state, addContentItem } = useApp();
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'templates' | 'library' | 'analytics' | 'optimizer' | 'scheduler'>('generate');
  const [contentType, setContentType] = useState<'post' | 'video' | 'story' | 'reel' | 'blog' | 'email' | 'ad'>('post');
  const [tone, setTone] = useState<'casual' | 'professional' | 'funny' | 'inspirational' | 'sales'>('casual');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'all'>('all');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [aiEnhancement, setAIEnhancement] = useState(true);
  const [viralScore, setViralScore] = useState(true);
  const [seoOptimized, setSeoOptimized] = useState(true);
  const [brandVoice, setBrandVoice] = useState(true);
  const [targetAudience, setTargetAudience] = useState<'all' | 'teens' | 'young-adults' | 'adults' | 'seniors'>('all');
  const [contentGoal, setContentGoal] = useState<'engagement' | 'sales' | 'awareness' | 'education' | 'entertainment'>('engagement');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [batchMode, setBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState('5');
  const [scheduleLater, setScheduleLater] = useState(false);
  const [abTesting, setABTesting] = useState(false);
  const [multiLanguage, setMultiLanguage] = useState(false);

  const [includeImages, setIncludeImages] = useState(false);
  const [imageStyle, setImageStyle] = useState<'realistic' | 'artistic' | 'minimal' | 'cartoon' | 'photo'>('realistic');
  const [contentSeries, setContentSeries] = useState(false);
  const [seriesCount, setSeriesCount] = useState('3');
  const [filterSearch, setFilterSearch] = useState('');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const contentTemplates = [
    { id: '1', name: 'Product Launch', category: 'Marketing', uses: 1250, rating: 4.8 },
    { id: '2', name: 'Behind The Scenes', category: 'Engagement', uses: 980, rating: 4.6 },
    { id: '3', name: 'How-To Tutorial', category: 'Education', uses: 2100, rating: 4.9 },
    { id: '4', name: 'Customer Testimonial', category: 'Social Proof', uses: 870, rating: 4.7 },
    { id: '5', name: 'Trending Challenge', category: 'Viral', uses: 3500, rating: 4.9 },
    { id: '6', name: 'Q&A Session', category: 'Engagement', uses: 1450, rating: 4.5 },
    { id: '7', name: 'Day In The Life', category: 'Lifestyle', uses: 2200, rating: 4.8 },
    { id: '8', name: 'Giveaway Announcement', category: 'Growth', uses: 1890, rating: 4.7 },
    { id: '9', name: 'Motivational Quote', category: 'Inspiration', uses: 3200, rating: 4.6 },
    { id: '10', name: 'Limited Offer', category: 'Sales', uses: 2800, rating: 4.8 },
    { id: '11', name: 'User Generated Content', category: 'Community', uses: 1650, rating: 4.7 },
    { id: '12', name: 'Comparison Post', category: 'Education', uses: 1100, rating: 4.5 },
    { id: '13', name: 'Before & After', category: 'Transformation', uses: 2600, rating: 4.9 },
    { id: '14', name: 'Industry News', category: 'Authority', uses: 890, rating: 4.4 },
    { id: '15', name: 'Poll & Survey', category: 'Engagement', uses: 1350, rating: 4.6 },
  ];

  const aiSuggestions = [
    { id: '1', suggestion: 'Summer content performs 35% better. Add seasonal keywords.', priority: 'high' },
    { id: '2', suggestion: 'Video content gets 3x more engagement. Consider switching format.', priority: 'high' },
    { id: '3', suggestion: 'Posts with questions get 28% more comments. Add a question CTA.', priority: 'medium' },
    { id: '4', suggestion: 'Carousel posts have 1.4x higher save rate. Try multi-slide format.', priority: 'medium' },
    { id: '5', suggestion: 'Your audience is most active at 6-8 PM. Schedule accordingly.', priority: 'low' },
  ];

  const contentCategories = [
    { name: 'Marketing', count: 45, color: '#FF6B6B' },
    { name: 'Education', count: 32, color: '#4ECDC4' },
    { name: 'Entertainment', count: 28, color: '#FFD93D' },
    { name: 'Sales', count: 38, color: '#95E1D3' },
    { name: 'Engagement', count: 52, color: '#F38181' },
    { name: 'Viral', count: 15, color: '#AA96DA' },
  ];

  const performanceMetrics = {
    totalContent: 1250,
    published: 980,
    scheduled: 145,
    drafts: 125,
    avgEngagement: 5.8,
    totalReach: 2580000,
    totalRevenue: 45800,
    conversionRate: 3.2,
    topPerformer: 'Product Launch Campaign',
    viralPosts: 12,
    savedPosts: 4500,
    sharedPosts: 8900,
  };

  const contentInsights = [
    { metric: 'Best Time to Post', value: '6-8 PM', change: '+15%' },
    { metric: 'Top Performing Type', value: 'Video Reels', change: '+42%' },
    { metric: 'Optimal Post Length', value: '120-150 words', change: '+8%' },
    { metric: 'Best Hashtags', value: '#lifestyle #motivation', change: '+23%' },
    { metric: 'Engagement Peak Day', value: 'Friday', change: '+18%' },
    { metric: 'CTA Success Rate', value: 'Link in Bio', change: '+35%' },
  ];

  const revenueBreakdown = [
    { source: 'Sponsored Content', amount: 18500, percentage: 40 },
    { source: 'Affiliate Links', amount: 13725, percentage: 30 },
    { source: 'Product Sales', amount: 9160, percentage: 20 },
    { source: 'Ad Revenue', amount: 4580, percentage: 10 },
  ];

  const optimizationSuggestions = [
    { title: 'Increase Video Content', impact: 'High', uplift: '+45% engagement', description: 'Video posts get 3x more engagement than images. Recommend 60% video content.' },
    { title: 'Add More Carousels', impact: 'High', uplift: '+38% saves', description: 'Carousel posts have 1.4x higher save rate and boost algorithm ranking.' },
    { title: 'Optimize Posting Times', impact: 'Medium', uplift: '+22% reach', description: 'Post during 6-8 PM when 68% of your audience is active.' },
    { title: 'Use Trending Audio', impact: 'High', uplift: '+67% views', description: 'Posts with trending audio get 5x more views in first 24 hours.' },
    { title: 'Engage Within 1 Hour', impact: 'Medium', uplift: '+15% retention', description: 'Reply to comments within first hour to boost engagement and loyalty.' },
    { title: 'Cross-Platform Strategy', impact: 'Medium', uplift: '+28% growth', description: 'Repurpose content across 3+ platforms to maximize reach and ROI.' },
  ];

  const contentPlanner = [
    { date: 'Mon, Jan 15', slots: 3, scheduled: 2, ideas: 5 },
    { date: 'Tue, Jan 16', slots: 2, scheduled: 2, ideas: 3 },
    { date: 'Wed, Jan 17', slots: 3, scheduled: 1, ideas: 4 },
    { date: 'Thu, Jan 18', slots: 2, scheduled: 0, ideas: 6 },
    { date: 'Fri, Jan 19', slots: 4, scheduled: 3, ideas: 2 },
    { date: 'Sat, Jan 20', slots: 2, scheduled: 1, ideas: 4 },
    { date: 'Sun, Jan 21', slots: 2, scheduled: 2, ideas: 3 },
  ];

  const handleGenerate = () => {
    if (prompt.trim()) {
      const count = batchMode ? parseInt(batchCount) : 1;
      for (let i = 0; i < count; i++) {
        addContentItem(
          `${contentType} - ${prompt.slice(0, 30)}...`,
          `AI-generated ${contentType} content based on: ${prompt}`,
          contentType
        );
      }
      setPrompt('');
    }
  };

  const handleUploadImage = () => {
    Alert.alert('Upload Image', 'Image upload feature coming soon!', [
      { text: 'OK' }
    ]);
  };

  const renderGenerateTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.generatorCard}>
        <View style={styles.generatorHeader}>
          <Sparkles color="#00E5FF" size={24} />
          <Text style={styles.generatorTitle}>AI Content Generator</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PREMIUM</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Content Prompt</Text>
          <TextInput
            style={styles.promptInput}
            placeholder="Describe your content idea in detail..."
            placeholderTextColor="#666"
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />
        </View>

        <View style={styles.quickPrompts}>
          <Text style={styles.sectionLabel}>Quick Prompts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptChips}>
            {['Summer Sale', 'New Product', 'Behind Scenes', 'Tutorial', 'Giveaway', 'Testimonial'].map((p) => (
              <TouchableOpacity key={p} style={styles.chip} onPress={() => setPrompt(p)}>
                <Text style={styles.chipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.optionsGrid}>
          <View style={styles.option}>
            <Text style={styles.optionLabel}>Content Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={contentType}
                onValueChange={(itemValue) => setContentType(itemValue)}
                style={styles.picker}
                dropdownIconColor="#00E5FF"
              >
                <Picker.Item label="Post" value="post" color="#fff" />
                <Picker.Item label="Video" value="video" color="#fff" />
                <Picker.Item label="Story" value="story" color="#fff" />
                <Picker.Item label="Reel" value="reel" color="#fff" />
                <Picker.Item label="Blog" value="blog" color="#fff" />
                <Picker.Item label="Email" value="email" color="#fff" />
                <Picker.Item label="Ad" value="ad" color="#fff" />
              </Picker>
            </View>
          </View>

          <View style={styles.option}>
            <Text style={styles.optionLabel}>Platform</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={platform}
                onValueChange={(itemValue) => setPlatform(itemValue)}
                style={styles.picker}
                dropdownIconColor="#00E5FF"
              >
                <Picker.Item label="All" value="all" color="#fff" />
                <Picker.Item label="Instagram" value="instagram" color="#fff" />
                <Picker.Item label="TikTok" value="tiktok" color="#fff" />
                <Picker.Item label="YouTube" value="youtube" color="#fff" />
                <Picker.Item label="Twitter" value="twitter" color="#fff" />
                <Picker.Item label="Facebook" value="facebook" color="#fff" />
                <Picker.Item label="LinkedIn" value="linkedin" color="#fff" />
              </Picker>
            </View>
          </View>

          <View style={styles.option}>
            <Text style={styles.optionLabel}>Tone</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tone}
                onValueChange={(itemValue) => setTone(itemValue)}
                style={styles.picker}
                dropdownIconColor="#00E5FF"
              >
                <Picker.Item label="Casual" value="casual" color="#fff" />
                <Picker.Item label="Professional" value="professional" color="#fff" />
                <Picker.Item label="Funny" value="funny" color="#fff" />
                <Picker.Item label="Inspirational" value="inspirational" color="#fff" />
                <Picker.Item label="Sales" value="sales" color="#fff" />
              </Picker>
            </View>
          </View>

          <View style={styles.option}>
            <Text style={styles.optionLabel}>Length</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={length}
                onValueChange={(itemValue) => setLength(itemValue)}
                style={styles.picker}
                dropdownIconColor="#00E5FF"
              >
                <Picker.Item label="Short" value="short" color="#fff" />
                <Picker.Item label="Medium" value="medium" color="#fff" />
                <Picker.Item label="Long" value="long" color="#fff" />
              </Picker>
            </View>
          </View>

          <View style={styles.option}>
            <Text style={styles.optionLabel}>Target Audience</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={targetAudience}
                onValueChange={(itemValue) => setTargetAudience(itemValue)}
                style={styles.picker}
                dropdownIconColor="#00E5FF"
              >
                <Picker.Item label="All" value="all" color="#fff" />
                <Picker.Item label="Teens" value="teens" color="#fff" />
                <Picker.Item label="Young Adults" value="young-adults" color="#fff" />
                <Picker.Item label="Adults" value="adults" color="#fff" />
                <Picker.Item label="Seniors" value="seniors" color="#fff" />
              </Picker>
            </View>
          </View>

          <View style={styles.option}>
            <Text style={styles.optionLabel}>Content Goal</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={contentGoal}
                onValueChange={(itemValue) => setContentGoal(itemValue)}
                style={styles.picker}
                dropdownIconColor="#00E5FF"
              >
                <Picker.Item label="Engagement" value="engagement" color="#fff" />
                <Picker.Item label="Sales" value="sales" color="#fff" />
                <Picker.Item label="Awareness" value="awareness" color="#fff" />
                <Picker.Item label="Education" value="education" color="#fff" />
                <Picker.Item label="Entertainment" value="entertainment" color="#fff" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Media Upload</Text>
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
              <Upload size={24} color="#00E5FF" />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
            {uploadedImage && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Preview</Text>
                <Image source={{ uri: uploadedImage }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => setUploadedImage(null)}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.togglesSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Hash size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>Hashtags</Text>
            </View>
            <Switch value={includeHashtags} onValueChange={setIncludeHashtags} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Heart size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>Emojis</Text>
            </View>
            <Switch value={includeEmojis} onValueChange={setIncludeEmojis} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Target size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>Call-to-Action</Text>
            </View>
            <Switch value={includeCTA} onValueChange={setIncludeCTA} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Zap size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>Auto-Optimize</Text>
            </View>
            <Switch value={autoOptimize} onValueChange={setAutoOptimize} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Brain size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>AI Enhancement</Text>
            </View>
            <Switch value={aiEnhancement} onValueChange={setAIEnhancement} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <TrendingUp size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>Viral Score</Text>
            </View>
            <Switch value={viralScore} onValueChange={setViralScore} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Search size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>SEO Optimized</Text>
            </View>
            <Switch value={seoOptimized} onValueChange={setSeoOptimized} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Mic size={16} color="#00E5FF" />
              <Text style={styles.toggleLabel}>Brand Voice</Text>
            </View>
            <Switch value={brandVoice} onValueChange={setBrandVoice} />
          </View>
        </View>

        <TouchableOpacity style={styles.advancedToggle} onPress={() => setShowAdvanced(!showAdvanced)}>
          <Settings size={18} color="#00E5FF" />
          <Text style={styles.advancedText}>Advanced Options</Text>
          {showAdvanced ? <ChevronUp size={18} color="#00E5FF" /> : <ChevronDown size={18} color="#00E5FF" />}
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedSection}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <Layers size={16} color="#00E5FF" />
                <Text style={styles.toggleLabel}>Batch Generation</Text>
              </View>
              <Switch value={batchMode} onValueChange={setBatchMode} />
            </View>
            {batchMode && (
              <TextInput
                style={styles.smallInput}
                placeholder="Number of variations"
                placeholderTextColor="#666"
                value={batchCount}
                onChangeText={setBatchCount}
                keyboardType="number-pad"
              />
            )}
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <Calendar size={16} color="#00E5FF" />
                <Text style={styles.toggleLabel}>Schedule Later</Text>
              </View>
              <Switch value={scheduleLater} onValueChange={setScheduleLater} />
            </View>
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <BarChart3 size={16} color="#00E5FF" />
                <Text style={styles.toggleLabel}>A/B Testing</Text>
              </View>
              <Switch value={abTesting} onValueChange={setABTesting} />
            </View>
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <Globe size={16} color="#00E5FF" />
                <Text style={styles.toggleLabel}>Multi-Language</Text>
              </View>
              <Switch value={multiLanguage} onValueChange={setMultiLanguage} />
            </View>
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <ImageIcon size={16} color="#00E5FF" />
                <Text style={styles.toggleLabel}>Generate Images</Text>
              </View>
              <Switch value={includeImages} onValueChange={setIncludeImages} />
            </View>
            {includeImages && (
              <View style={styles.option}>
                <Text style={styles.optionLabel}>Image Style</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={imageStyle}
                    onValueChange={(itemValue) => setImageStyle(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#00E5FF"
                  >
                    <Picker.Item label="Realistic" value="realistic" color="#fff" />
                    <Picker.Item label="Artistic" value="artistic" color="#fff" />
                    <Picker.Item label="Minimal" value="minimal" color="#fff" />
                    <Picker.Item label="Cartoon" value="cartoon" color="#fff" />
                    <Picker.Item label="Photo" value="photo" color="#fff" />
                  </Picker>
                </View>
              </View>
            )}
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <BookMarked size={16} color="#00E5FF" />
                <Text style={styles.toggleLabel}>Content Series</Text>
              </View>
              <Switch value={contentSeries} onValueChange={setContentSeries} />
            </View>
            {contentSeries && (
              <TextInput
                style={styles.smallInput}
                placeholder="Number of posts in series"
                placeholderTextColor="#666"
                value={seriesCount}
                onChangeText={setSeriesCount}
                keyboardType="number-pad"
              />
            )}
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
            <Sparkles size={20} color="#000" />
            <Text style={styles.generateButtonText}>Generate Content</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Save size={20} color="#00E5FF" />
            <Text style={styles.secondaryButtonText}>Save Draft</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>AI Suggestions</Text>
      <View style={styles.suggestionsList}>
        {aiSuggestions.map((item) => (
          <View key={item.id} style={styles.suggestionCard}>
            <View style={[styles.priorityDot, item.priority === 'high' ? styles.priorityHigh : item.priority === 'medium' ? styles.priorityMedium : styles.priorityLow]} />
            <View style={styles.suggestionContent}>
              <Lightbulb size={18} color="#FFD700" />
              <Text style={styles.suggestionText}>{item.suggestion}</Text>
            </View>
            <TouchableOpacity style={styles.applyButton}>
              <Check size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTemplatesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchBar}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search templates..."
          placeholderTextColor="#666"
        />
        <Filter size={20} color="#00E5FF" />
      </View>

      <Text style={styles.sectionTitle}>Template Categories</Text>
      <View style={styles.categoriesGrid}>
        {contentCategories.map((cat, index) => (
          <TouchableOpacity key={index} style={[styles.categoryCard, { borderLeftColor: cat.color }]}>
            <Text style={styles.categoryName}>{cat.name}</Text>
            <Text style={styles.categoryCount}>{cat.count} templates</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Popular Templates</Text>
      <View style={styles.templatesList}>
        {contentTemplates.map((template) => (
          <TouchableOpacity key={template.id} style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <FileText size={20} color="#00E5FF" />
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateCategory}>{template.category}</Text>
              </View>
            </View>
            <View style={styles.templateStats}>
              <View style={styles.templateStat}>
                <Users size={14} color="#666" />
                <Text style={styles.templateStatText}>{template.uses.toLocaleString()} uses</Text>
              </View>
              <View style={styles.templateStat}>
                <Star size={14} color="#FFD700" />
                <Text style={styles.templateStatText}>{template.rating}</Text>
              </View>
            </View>
            <View style={styles.templateActions}>
              <TouchableOpacity style={styles.useButton}>
                <Text style={styles.useButtonText}>Use Template</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Eye size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLibraryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.libraryHeader}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search content..."
            placeholderTextColor="#666"
            value={filterSearch}
            onChangeText={setFilterSearch}
          />
        </View>
        <View style={styles.viewControls}>
          <TouchableOpacity style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]} onPress={() => setViewMode('list')}>
            <List size={18} color={viewMode === 'list' ? '#00E5FF' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]} onPress={() => setViewMode('grid')}>
            <Grid size={18} color={viewMode === 'grid' ? '#00E5FF' : '#666'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Published</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Scheduled</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Drafts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>High Performing</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>Your Content ({state.contentItems.length})</Text>
      {state.contentItems.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color="#333" />
          <Text style={styles.emptyText}>No content yet</Text>
          <Text style={styles.emptySubtext}>Generate your first piece of content to get started</Text>
        </View>
      ) : (
        <View style={viewMode === 'grid' ? styles.contentGrid : styles.contentList}>
          {state.contentItems.slice(0, 20).map((item) => (
            <View key={item.id} style={viewMode === 'grid' ? styles.contentGridItem : styles.contentCard}>
              <View style={styles.contentHeader}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.contentText} numberOfLines={2}>
                {item.content}
              </Text>
              <View style={styles.contentMeta}>
                <Text style={styles.contentType}>{item.type}</Text>
                <Text style={styles.contentDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.contentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit3 size={16} color="#00E5FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Copy size={16} color="#00E5FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Share2 size={16} color="#00E5FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Download size={16} color="#00E5FF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Performance Overview</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <FileText size={20} color="#00E5FF" />
          <Text style={styles.metricValue}>{performanceMetrics.totalContent}</Text>
          <Text style={styles.metricLabel}>Total Content</Text>
        </View>
        <View style={styles.metricCard}>
          <CheckCircle size={20} color="#10B981" />
          <Text style={styles.metricValue}>{performanceMetrics.published}</Text>
          <Text style={styles.metricLabel}>Published</Text>
        </View>
        <View style={styles.metricCard}>
          <Clock size={20} color="#F59E0B" />
          <Text style={styles.metricValue}>{performanceMetrics.scheduled}</Text>
          <Text style={styles.metricLabel}>Scheduled</Text>
        </View>
        <View style={styles.metricCard}>
          <Edit3 size={20} color="#666" />
          <Text style={styles.metricValue}>{performanceMetrics.drafts}</Text>
          <Text style={styles.metricLabel}>Drafts</Text>
        </View>
      </View>

      <View style={styles.performanceCard}>
        <Text style={styles.cardTitle}>Engagement Metrics</Text>
        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            <Heart size={18} color="#FF6B6B" />
            <Text style={styles.performanceValue}>{performanceMetrics.avgEngagement}%</Text>
            <Text style={styles.performanceLabel}>Avg Engagement</Text>
          </View>
          <View style={styles.performanceItem}>
            <Eye size={18} color="#4ECDC4" />
            <Text style={styles.performanceValue}>{(performanceMetrics.totalReach / 1000000).toFixed(1)}M</Text>
            <Text style={styles.performanceLabel}>Total Reach</Text>
          </View>
          <View style={styles.performanceItem}>
            <TrendingUp size={18} color="#FFD700" />
            <Text style={styles.performanceValue}>{performanceMetrics.viralPosts}</Text>
            <Text style={styles.performanceLabel}>Viral Posts</Text>
          </View>
        </View>
      </View>

      <View style={styles.performanceCard}>
        <Text style={styles.cardTitle}>Revenue Impact</Text>
        <View style={styles.revenueHeader}>
          <DollarSign size={24} color="#10B981" />
          <Text style={styles.revenueValue}>${performanceMetrics.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.revenueLabel}>Total Revenue from Content</Text>
        </View>
        <View style={styles.revenueBreakdown}>
          {revenueBreakdown.map((item, index) => (
            <View key={index} style={styles.revenueItem}>
              <View style={styles.revenueInfo}>
                <Text style={styles.revenueName}>{item.source}</Text>
                <View style={styles.revenueBar}>
                  <View style={[styles.revenueBarFill, { width: `${item.percentage}%` }]} />
                </View>
              </View>
              <Text style={styles.revenueAmount}>${item.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Content Insights</Text>
      <View style={styles.insightsGrid}>
        {contentInsights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <Text style={styles.insightMetric}>{insight.metric}</Text>
            <Text style={styles.insightValue}>{insight.value}</Text>
            <View style={styles.insightChange}>
              <TrendingUp size={14} color="#10B981" />
              <Text style={styles.insightChangeText}>{insight.change}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderOptimizerTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Content Optimization</Text>
      <View style={styles.optimizerCard}>
        <View style={styles.optimizerHeader}>
          <Zap size={24} color="#FFD700" />
          <Text style={styles.optimizerTitle}>AI-Powered Optimizer</Text>
        </View>
        <Text style={styles.optimizerDescription}>
          Our AI analyzes your content performance and provides actionable recommendations to maximize engagement, reach, and revenue.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Top Recommendations</Text>
      <View style={styles.recommendationsList}>
        {optimizationSuggestions.map((suggestion, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={[styles.impactBadge, suggestion.impact === 'High' ? styles.impactHigh : styles.impactMedium]}>
                <Text style={styles.impactText}>{suggestion.impact} Impact</Text>
              </View>
              <View style={styles.upliftBadge}>
                <ArrowUpRight size={14} color="#10B981" />
                <Text style={styles.upliftText}>{suggestion.uplift}</Text>
              </View>
            </View>
            <Text style={styles.recommendationTitle}>{suggestion.title}</Text>
            <Text style={styles.recommendationDescription}>{suggestion.description}</Text>
            <TouchableOpacity style={styles.implementButton}>
              <Text style={styles.implementButtonText}>Implement Now</Text>
              <ChevronRight size={16} color="#00E5FF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Performance Analyzer</Text>
      <View style={styles.analyzerCard}>
        <View style={styles.analyzerSection}>
          <Text style={styles.analyzerLabel}>Best Performing Content Type</Text>
          <View style={styles.analyzerResult}>
            <Video size={20} color="#00E5FF" />
            <Text style={styles.analyzerValue}>Video Reels</Text>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>+42%</Text>
            </View>
          </View>
        </View>
        <View style={styles.analyzerSection}>
          <Text style={styles.analyzerLabel}>Optimal Posting Frequency</Text>
          <View style={styles.analyzerResult}>
            <Calendar size={20} color="#00E5FF" />
            <Text style={styles.analyzerValue}>3-4 posts per day</Text>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>+28%</Text>
            </View>
          </View>
        </View>
        <View style={styles.analyzerSection}>
          <Text style={styles.analyzerLabel}>Top Performing Hashtags</Text>
          <View style={styles.hashtagsList}>
            {['#lifestyle', '#motivation', '#success', '#entrepreneur', '#inspiration'].map((tag, i) => (
              <View key={i} style={styles.hashtagChip}>
                <Text style={styles.hashtagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSchedulerTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Content Calendar</Text>
      <View style={styles.calendarCard}>
        {contentPlanner.map((day, index) => (
          <View key={index} style={styles.calendarDay}>
            <View style={styles.calendarDayHeader}>
              <Text style={styles.calendarDate}>{day.date}</Text>
              <View style={styles.calendarBadge}>
                <Text style={styles.calendarBadgeText}>{day.scheduled}/{day.slots}</Text>
              </View>
            </View>
            <View style={styles.calendarProgress}>
              <View style={[styles.calendarProgressBar, { width: `${(day.scheduled / day.slots) * 100}%` }]} />
            </View>
            <View style={styles.calendarStats}>
              <View style={styles.calendarStat}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.calendarStatText}>{day.scheduled} scheduled</Text>
              </View>
              <View style={styles.calendarStat}>
                <Lightbulb size={12} color="#FFD700" />
                <Text style={styles.calendarStatText}>{day.ideas} ideas</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Upcoming Posts</Text>
      <View style={styles.upcomingList}>
        {state.scheduledTasks.slice(0, 5).map((task) => (
          <View key={task.id} style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <Clock size={18} color="#00E5FF" />
              <Text style={styles.upcomingTitle}>{task.title}</Text>
            </View>
            <Text style={styles.upcomingDescription}>{task.description}</Text>
            <View style={styles.upcomingMeta}>
              <Text style={styles.upcomingTime}>{new Date(task.scheduledTime).toLocaleString()}</Text>
              <View style={[styles.upcomingStatus, styles[`status${task.status}`]]}>
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Content Engine</Text>
        <Text style={styles.subtitle}>Advanced AI-powered content creation & optimization</Text>
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'generate' && styles.tabActive]}
            onPress={() => setActiveTab('generate')}
          >
            <Sparkles size={18} color={activeTab === 'generate' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'generate' && styles.tabTextActive]}>Generate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'templates' && styles.tabActive]}
            onPress={() => setActiveTab('templates')}
          >
            <FileText size={18} color={activeTab === 'templates' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'templates' && styles.tabTextActive]}>Templates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'library' && styles.tabActive]}
            onPress={() => setActiveTab('library')}
          >
            <BookOpen size={18} color={activeTab === 'library' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'library' && styles.tabTextActive]}>Library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
            onPress={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} color={activeTab === 'analytics' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'optimizer' && styles.tabActive]}
            onPress={() => setActiveTab('optimizer')}
          >
            <Zap size={18} color={activeTab === 'optimizer' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'optimizer' && styles.tabTextActive]}>Optimizer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scheduler' && styles.tabActive]}
            onPress={() => setActiveTab('scheduler')}
          >
            <Calendar size={18} color={activeTab === 'scheduler' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'scheduler' && styles.tabTextActive]}>Scheduler</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'library' && renderLibraryTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'optimizer' && renderOptimizerTab()}
        {activeTab === 'scheduler' && renderSchedulerTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00E5FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#666',
  },
  tabTextActive: {
    color: '#00E5FF',
  },
  tabContent: {
    flex: 1,
  },
  generatorCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
  },
  generatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  generatorTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  badge: {
    backgroundColor: '#FFD70030',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#222',
  },
  quickPrompts: {
    marginBottom: 20,
  },
  promptChips: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    color: '#00E5FF',
    whiteSpace: 'nowrap' as const,
  },
  optionsGrid: {
    gap: 16,
    marginBottom: 20,
  },
  option: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ccc',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: '#111',
  },
  imageSection: {
    marginBottom: 20,
  },
  uploadContainer: {
    gap: 16,
  },
  uploadButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#00E5FF',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  previewContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ccc',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EF444420',
    padding: 10,
    borderRadius: 8,
  },
  removeImageText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  togglesSection: {
    gap: 12,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    marginTop: 8,
  },
  advancedText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#00E5FF',
  },
  advancedSection: {
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  smallInput: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#222',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  secondaryButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  suggestionsList: {
    gap: 12,
    marginBottom: 24,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityHigh: {
    backgroundColor: '#EF4444',
  },
  priorityMedium: {
    backgroundColor: '#F59E0B',
  },
  priorityLow: {
    backgroundColor: '#10B981',
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },
  applyButton: {
    backgroundColor: '#10B98120',
    padding: 8,
    borderRadius: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderLeftWidth: 3,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  templatesList: {
    gap: 12,
  },
  templateCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: '#666',
  },
  templateStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  templateStatText: {
    fontSize: 12,
    color: '#888',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  useButton: {
    flex: 1,
    backgroundColor: '#00E5FF20',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  useButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  iconButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  viewControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  viewButtonActive: {
    borderColor: '#00E5FF',
  },
  filterBar: {
    marginBottom: 20,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  filterChipText: {
    fontSize: 12,
    color: '#ccc',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center' as const,
  },
  contentList: {
    gap: 12,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contentGridItem: {
    width: '48%',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  contentCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusdraft: {
    backgroundColor: '#3B82F6',
  },
  statuspublished: {
    backgroundColor: '#10B981',
  },
  statusscheduled: {
    backgroundColor: '#F59E0B',
  },
  statuspending: {
    backgroundColor: '#F59E0B',
  },
  statuscompleted: {
    backgroundColor: '#10B981',
  },
  statusfailed: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#fff',
    textTransform: 'uppercase' as const,
  },
  contentText: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 10,
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contentType: {
    fontSize: 12,
    color: '#00E5FF',
    fontWeight: '500' as const,
  },
  contentDate: {
    fontSize: 11,
    color: '#666',
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center' as const,
  },
  performanceCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  performanceLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center' as const,
  },
  revenueHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#10B981',
    marginTop: 8,
  },
  revenueLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  revenueBreakdown: {
    gap: 16,
  },
  revenueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueName: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 8,
  },
  revenueBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  revenueBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  revenueAmount: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  insightMetric: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 6,
  },
  insightChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightChangeText: {
    fontSize: 12,
    color: '#10B981',
  },
  optimizerCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
  },
  optimizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  optimizerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  optimizerDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
  },
  recommendationsList: {
    gap: 16,
    marginBottom: 24,
  },
  recommendationCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  impactHigh: {
    backgroundColor: '#EF444420',
  },
  impactMedium: {
    backgroundColor: '#F59E0B20',
  },
  impactText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  upliftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  upliftText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 19,
    marginBottom: 12,
  },
  implementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E5FF10',
    padding: 10,
    borderRadius: 8,
  },
  implementButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  analyzerCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 20,
  },
  analyzerSection: {
    gap: 10,
  },
  analyzerLabel: {
    fontSize: 13,
    color: '#666',
  },
  analyzerResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  analyzerValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  percentBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  hashtagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  hashtagChip: {
    backgroundColor: '#00E5FF20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  hashtagText: {
    fontSize: 12,
    color: '#00E5FF',
  },
  calendarCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 12,
    marginBottom: 24,
  },
  calendarDay: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 14,
  },
  calendarDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarDate: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  calendarBadge: {
    backgroundColor: '#00E5FF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  calendarBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  calendarProgress: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  calendarProgressBar: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  calendarStats: {
    flexDirection: 'row',
    gap: 16,
  },
  calendarStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarStatText: {
    fontSize: 11,
    color: '#888',
  },
  upcomingList: {
    gap: 12,
  },
  upcomingCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  upcomingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  upcomingDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 10,
  },
  upcomingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingTime: {
    fontSize: 12,
    color: '#666',
  },
  upcomingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
