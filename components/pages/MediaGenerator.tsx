import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Sparkles, Video, Music, FileImage, Layers, Palette, Wand2, Download, Share2, Eye, Edit3, Trash2, Copy, Heart, Star, TrendingUp, Zap, Settings, ChevronDown, ChevronUp, Grid, List, Filter, Search, Clock, Calendar, BarChart3, DollarSign, Target, Users, Globe, Maximize2, Minimize2, RotateCw, FlipHorizontal, FlipVertical, Contrast, Sun, Moon, Droplet, Scissors, Plus, Minus, Play, Pause, CheckCircle, XCircle, AlertCircle, Loader, ArrowRight, BookMarked, Save, Upload, Camera, Film, Layout, Type, AlignCenter, Bold, Sliders, Crop, ZoomIn, ZoomOut, Aperture, Package } from 'lucide-react-native';

export default function MediaGenerator() {
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery' | 'templates' | 'editor' | 'batches' | 'analytics'>('generate');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'thumbnail' | 'logo' | 'banner' | 'story' | 'reel'>('image');
  const [style, setStyle] = useState<'realistic' | 'artistic' | 'anime' | 'cartoon' | '3d' | 'minimal' | 'abstract' | 'vintage' | 'modern'>('realistic');
  const [size, setSize] = useState<'square' | 'portrait' | 'landscape' | 'instagram' | 'youtube' | 'twitter' | 'custom'>('square');
  const [quality, setQuality] = useState<'standard' | 'hd' | 'ultra'>('hd');
  const [colorPalette, setColorPalette] = useState<'vibrant' | 'pastel' | 'dark' | 'light' | 'monochrome' | 'custom'>('vibrant');
  const [enhanceAI, setEnhanceAI] = useState(true);
  const [upscale, setUpscale] = useState(true);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [addWatermark, setAddWatermark] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [smartCrop, setSmartCrop] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchGenerate, setBatchGenerate] = useState(false);
  const [batchCount, setBatchCount] = useState('4');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStyle, setFilterStyle] = useState<'all' | 'image' | 'video'>('all');
  const [seedValue, setSeedValue] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');

  const quickStyles = [
    { name: 'Photorealistic', emoji: '📸' },
    { name: 'Oil Painting', emoji: '🎨' },
    { name: 'Anime', emoji: '🎭' },
    { name: 'Watercolor', emoji: '💧' },
    { name: '3D Render', emoji: '🎬' },
    { name: 'Pencil Sketch', emoji: '✏️' },
    { name: 'Digital Art', emoji: '🖼️' },
    { name: 'Pop Art', emoji: '🌟' },
    { name: 'Cyberpunk', emoji: '🤖' },
    { name: 'Fantasy', emoji: '🔮' },
    { name: 'Minimalist', emoji: '⚪' },
    { name: 'Vintage', emoji: '📻' },
  ];

  const templates = [
    { id: '1', name: 'Product Shot', category: 'E-commerce', preview: '📦', uses: 5420 },
    { id: '2', name: 'Hero Banner', category: 'Web Design', preview: '🎯', uses: 4890 },
    { id: '3', name: 'Social Post', category: 'Social Media', preview: '📱', uses: 8920 },
    { id: '4', name: 'YouTube Thumbnail', category: 'Video', preview: '🎬', uses: 12400 },
    { id: '5', name: 'Logo Design', category: 'Branding', preview: '🏷️', uses: 3680 },
    { id: '6', name: 'Instagram Story', category: 'Social Media', preview: '📲', uses: 9870 },
    { id: '7', name: 'Ad Creative', category: 'Marketing', preview: '💡', uses: 6540 },
    { id: '8', name: 'Blog Header', category: 'Content', preview: '✍️', uses: 4320 },
    { id: '9', name: 'Email Banner', category: 'Email', preview: '📧', uses: 3120 },
    { id: '10', name: 'App Screenshot', category: 'Mobile', preview: '📱', uses: 2890 },
  ];

  const recentGenerations = [
    { id: '1', prompt: 'Futuristic city at sunset', type: 'image', style: 'realistic', timestamp: Date.now() - 3600000, likes: 234, downloads: 45 },
    { id: '2', prompt: 'Product photography phone', type: 'image', style: 'minimal', timestamp: Date.now() - 7200000, likes: 189, downloads: 67 },
    { id: '3', prompt: 'Abstract art colorful', type: 'image', style: 'abstract', timestamp: Date.now() - 10800000, likes: 312, downloads: 89 },
    { id: '4', prompt: 'Character design hero', type: 'image', style: 'anime', timestamp: Date.now() - 14400000, likes: 456, downloads: 123 },
    { id: '5', prompt: 'Nature landscape mountains', type: 'image', style: 'realistic', timestamp: Date.now() - 18000000, likes: 567, downloads: 156 },
    { id: '6', prompt: 'Tech gadget render', type: 'image', style: '3d', timestamp: Date.now() - 21600000, likes: 289, downloads: 78 },
    { id: '7', prompt: 'Fashion model portrait', type: 'image', style: 'artistic', timestamp: Date.now() - 25200000, likes: 423, downloads: 91 },
    { id: '8', prompt: 'Food photography', type: 'image', style: 'realistic', timestamp: Date.now() - 28800000, likes: 345, downloads: 102 },
  ];

  const generationStats = {
    totalGenerated: 3842,
    thisMonth: 487,
    totalDownloads: 12450,
    totalLikes: 8930,
    avgQuality: 4.7,
    storageUsed: '14.2 GB',
    storageLimit: '50 GB',
    creditsUsed: 2840,
    creditsRemaining: 7160,
    popularStyle: 'Realistic',
    avgGenerationTime: '12s',
  };

  const aiFeatures = [
    { name: 'Face Enhancement', enabled: true, description: 'Improve facial features and details' },
    { name: 'Background Blur', enabled: false, description: 'Add depth of field effect' },
    { name: 'Color Grading', enabled: true, description: 'Professional color correction' },
    { name: 'Object Removal', enabled: false, description: 'Remove unwanted objects' },
    { name: 'Style Transfer', enabled: true, description: 'Apply artistic styles' },
    { name: 'Super Resolution', enabled: true, description: '4x image upscaling' },
    { name: 'HDR Effect', enabled: false, description: 'High dynamic range imaging' },
    { name: 'Denoising', enabled: true, description: 'Remove image noise' },
  ];

  const exportFormats = [
    { format: 'PNG', size: 'Lossless', quality: 'Best' },
    { format: 'JPG', size: 'Small', quality: 'Good' },
    { format: 'WEBP', size: 'Smallest', quality: 'Great' },
    { format: 'SVG', size: 'Vector', quality: 'Scalable' },
  ];

  const batchJobs = [
    { id: '1', name: 'Product Batch #1', total: 10, completed: 10, status: 'completed' as const, time: '2 min ago' },
    { id: '2', name: 'Social Media Set', total: 20, completed: 15, status: 'processing' as const, time: '5 min ago' },
    { id: '3', name: 'Brand Assets', total: 8, completed: 3, status: 'processing' as const, time: '8 min ago' },
    { id: '4', name: 'Ad Creatives', total: 15, completed: 0, status: 'queued' as const, time: '10 min ago' },
  ];

  const renderGenerateTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.generatorCard}>
        <View style={styles.cardHeader}>
          <Sparkles size={24} color="#00E5FF" />
          <Text style={styles.cardTitle}>AI Image Generator</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRO</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Describe Your Image</Text>
          <TextInput
            style={styles.promptInput}
            placeholder="e.g., A futuristic cityscape at sunset with flying cars..."
            placeholderTextColor="#666"
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quick Styles</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
            {quickStyles.map((s, i) => (
              <TouchableOpacity key={i} style={styles.styleChip}>
                <Text style={styles.styleEmoji}>{s.emoji}</Text>
                <Text style={styles.styleText}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.optionsGrid}>
          <View style={styles.optionGroup}>
            <Text style={styles.label}>Media Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['image', 'video', 'thumbnail', 'logo', 'banner', 'story', 'reel'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.optionBtn, mediaType === type && styles.optionBtnActive]}
                  onPress={() => setMediaType(type)}
                >
                  <Text style={[styles.optionBtnText, mediaType === type && styles.optionBtnTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.label}>Art Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['realistic', 'artistic', 'anime', 'cartoon', '3d', 'minimal', 'abstract', 'vintage', 'modern'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.optionBtn, style === s && styles.optionBtnActive]}
                  onPress={() => setStyle(s)}
                >
                  <Text style={[styles.optionBtnText, style === s && styles.optionBtnTextActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.label}>Size & Ratio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['square', 'portrait', 'landscape', 'instagram', 'youtube', 'twitter', 'custom'] as const).map((sz) => (
                <TouchableOpacity
                  key={sz}
                  style={[styles.optionBtn, size === sz && styles.optionBtnActive]}
                  onPress={() => setSize(sz)}
                >
                  <Text style={[styles.optionBtnText, size === sz && styles.optionBtnTextActive]}>
                    {sz.charAt(0).toUpperCase() + sz.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.label}>Quality</Text>
            <View style={styles.optionRow}>
              {(['standard', 'hd', 'ultra'] as const).map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.optionBtn, quality === q && styles.optionBtnActive]}
                  onPress={() => setQuality(q)}
                >
                  <Text style={[styles.optionBtnText, quality === q && styles.optionBtnTextActive]}>
                    {q.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.label}>Color Palette</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['vibrant', 'pastel', 'dark', 'light', 'monochrome', 'custom'] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.optionBtn, colorPalette === c && styles.optionBtnActive]}
                  onPress={() => setColorPalette(c)}
                >
                  <Text style={[styles.optionBtnText, colorPalette === c && styles.optionBtnTextActive]}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.togglesSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Zap size={16} color="#00E5FF" />
              <Text style={styles.toggleText}>AI Enhancement</Text>
            </View>
            <Switch value={enhanceAI} onValueChange={setEnhanceAI} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Maximize2 size={16} color="#00E5FF" />
              <Text style={styles.toggleText}>4x Upscale</Text>
            </View>
            <Switch value={upscale} onValueChange={setUpscale} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Layers size={16} color="#00E5FF" />
              <Text style={styles.toggleText}>Remove Background</Text>
            </View>
            <Switch value={removeBackground} onValueChange={setRemoveBackground} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <FileImage size={16} color="#00E5FF" />
              <Text style={styles.toggleText}>Add Watermark</Text>
            </View>
            <Switch value={addWatermark} onValueChange={setAddWatermark} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Wand2 size={16} color="#00E5FF" />
              <Text style={styles.toggleText}>Auto Enhance</Text>
            </View>
            <Switch value={autoEnhance} onValueChange={setAutoEnhance} />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Crop size={16} color="#00E5FF" />
              <Text style={styles.toggleText}>Smart Crop</Text>
            </View>
            <Switch value={smartCrop} onValueChange={setSmartCrop} />
          </View>
        </View>

        <TouchableOpacity style={styles.advancedToggle} onPress={() => setShowAdvanced(!showAdvanced)}>
          <Settings size={18} color="#00E5FF" />
          <Text style={styles.advancedText}>Advanced Settings</Text>
          {showAdvanced ? <ChevronUp size={18} color="#00E5FF" /> : <ChevronDown size={18} color="#00E5FF" />}
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Negative Prompt (What to avoid)</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="e.g., blurry, low quality, distorted..."
                placeholderTextColor="#666"
                value={negativePrompt}
                onChangeText={setNegativePrompt}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Seed Value (Reproducibility)</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="Random seed (leave empty for random)"
                placeholderTextColor="#666"
                value={seedValue}
                onChangeText={setSeedValue}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Custom Aspect Ratio</Text>
              <TextInput
                style={styles.smallInput}
                placeholder="e.g., 16:9, 4:3, 21:9"
                placeholderTextColor="#666"
                value={aspectRatio}
                onChangeText={setAspectRatio}
              />
            </View>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Package size={16} color="#00E5FF" />
                <Text style={styles.toggleText}>Batch Generate</Text>
              </View>
              <Switch value={batchGenerate} onValueChange={setBatchGenerate} />
            </View>
            {batchGenerate && (
              <TextInput
                style={styles.smallInput}
                placeholder="Number of variations (1-20)"
                placeholderTextColor="#666"
                value={batchCount}
                onChangeText={setBatchCount}
                keyboardType="number-pad"
              />
            )}
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.generateBtn}>
            <Sparkles size={20} color="#000" />
            <Text style={styles.generateBtnText}>Generate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Upload size={20} color="#00E5FF" />
            <Text style={styles.secondaryBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.creditsInfo}>
          <Zap size={16} color="#FFD700" />
          <Text style={styles.creditsText}>
            {generationStats.creditsRemaining.toLocaleString()} credits remaining
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>AI Features</Text>
      <View style={styles.featuresGrid}>
        {aiFeatures.map((feature, i) => (
          <TouchableOpacity key={i} style={[styles.featureCard, feature.enabled && styles.featureCardActive]}>
            <View style={styles.featureHeader}>
              <Wand2 size={18} color={feature.enabled ? '#00E5FF' : '#666'} />
              <Text style={[styles.featureName, feature.enabled && styles.featureNameActive]}>{feature.name}</Text>
            </View>
            <Text style={styles.featureDesc}>{feature.description}</Text>
            {feature.enabled && (
              <View style={styles.enabledBadge}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.enabledText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGalleryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.galleryHeader}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search generations..."
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.viewControls}>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <Grid size={18} color={viewMode === 'grid' ? '#00E5FF' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={18} color={viewMode === 'list' ? '#00E5FF' : '#666'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Images', 'Videos', 'Favorites', 'Recent', 'Popular'].map((f) => (
            <TouchableOpacity key={f} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <FileImage size={18} color="#00E5FF" />
          <Text style={styles.statValue}>{generationStats.totalGenerated}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <TrendingUp size={18} color="#10B981" />
          <Text style={styles.statValue}>{generationStats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statBox}>
          <Download size={18} color="#FFD700" />
          <Text style={styles.statValue}>{generationStats.totalDownloads}</Text>
          <Text style={styles.statLabel}>Downloads</Text>
        </View>
        <View style={styles.statBox}>
          <Heart size={18} color="#FF6B6B" />
          <Text style={styles.statValue}>{generationStats.totalLikes}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Generations</Text>
      <View style={viewMode === 'grid' ? styles.mediaGrid : styles.mediaList}>
        {recentGenerations.map((item) => (
          <View key={item.id} style={viewMode === 'grid' ? styles.mediaCard : styles.mediaListItem}>
            <View style={styles.mediaPreview}>
              <Image size={40} color="#333" />
            </View>
            <View style={styles.mediaInfo}>
              <Text style={styles.mediaPrompt} numberOfLines={2}>{item.prompt}</Text>
              <View style={styles.mediaMeta}>
                <View style={styles.metaItem}>
                  <Clock size={12} color="#666" />
                  <Text style={styles.metaText}>{Math.floor((Date.now() - item.timestamp) / 3600000)}h ago</Text>
                </View>
                <View style={styles.metaItem}>
                  <Heart size={12} color="#666" />
                  <Text style={styles.metaText}>{item.likes}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Download size={12} color="#666" />
                  <Text style={styles.metaText}>{item.downloads}</Text>
                </View>
              </View>
            </View>
            <View style={styles.mediaActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Eye size={16} color="#00E5FF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Download size={16} color="#00E5FF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Share2 size={16} color="#00E5FF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTemplatesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Professional Templates</Text>
      <View style={styles.templateGrid}>
        {templates.map((template) => (
          <TouchableOpacity key={template.id} style={styles.templateCard}>
            <View style={styles.templatePreview}>
              <Text style={styles.templateEmoji}>{template.preview}</Text>
            </View>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateCategory}>{template.category}</Text>
            <View style={styles.templateStats}>
              <Users size={12} color="#666" />
              <Text style={styles.templateUses}>{template.uses.toLocaleString()} uses</Text>
            </View>
            <TouchableOpacity style={styles.useTemplateBtn}>
              <Text style={styles.useTemplateBtnText}>Use Template</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderBatchesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Batch Generation Jobs</Text>
      <View style={styles.batchList}>
        {batchJobs.map((job) => (
          <View key={job.id} style={styles.batchCard}>
            <View style={styles.batchHeader}>
              <Package size={20} color="#00E5FF" />
              <Text style={styles.batchName}>{job.name}</Text>
              <View style={[styles.statusBadge, styles[`status${job.status}`]]}>
                <Text style={styles.statusText}>{job.status}</Text>
              </View>
            </View>
            <View style={styles.batchProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(job.completed / job.total) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {job.completed}/{job.total}
              </Text>
            </View>
            <View style={styles.batchFooter}>
              <Text style={styles.batchTime}>{job.time}</Text>
              <View style={styles.batchActions}>
                {job.status === 'processing' && (
                  <TouchableOpacity style={styles.batchActionBtn}>
                    <Pause size={14} color="#00E5FF" />
                  </TouchableOpacity>
                )}
                {job.status === 'completed' && (
                  <TouchableOpacity style={styles.batchActionBtn}>
                    <Download size={14} color="#00E5FF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.batchActionBtn}>
                  <Eye size={14} color="#00E5FF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Generation Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <FileImage size={24} color="#00E5FF" />
          <Text style={styles.analyticsValue}>{generationStats.totalGenerated}</Text>
          <Text style={styles.analyticsLabel}>Total Generated</Text>
          <View style={styles.analyticsChange}>
            <TrendingUp size={14} color="#10B981" />
            <Text style={styles.analyticsChangeText}>+{generationStats.thisMonth} this month</Text>
          </View>
        </View>
        <View style={styles.analyticsCard}>
          <Star size={24} color="#FFD700" />
          <Text style={styles.analyticsValue}>{generationStats.avgQuality}</Text>
          <Text style={styles.analyticsLabel}>Avg Quality Score</Text>
          <Text style={styles.analyticsSubtext}>Out of 5.0</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Clock size={24} color="#F59E0B" />
          <Text style={styles.analyticsValue}>{generationStats.avgGenerationTime}</Text>
          <Text style={styles.analyticsLabel}>Avg Gen Time</Text>
          <Text style={styles.analyticsSubtext}>Per image</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Palette size={24} color="#9333EA" />
          <Text style={styles.analyticsValue}>{generationStats.popularStyle}</Text>
          <Text style={styles.analyticsLabel}>Most Used Style</Text>
          <Text style={styles.analyticsSubtext}>42% of generations</Text>
        </View>
      </View>

      <View style={styles.storageCard}>
        <View style={styles.storageHeader}>
          <Text style={styles.storageTitle}>Storage Usage</Text>
          <Text style={styles.storageValue}>{generationStats.storageUsed} / {generationStats.storageLimit}</Text>
        </View>
        <View style={styles.storageBar}>
          <View style={[styles.storageBarFill, { width: `${(14.2 / 50) * 100}%` }]} />
        </View>
        <Text style={styles.storageText}>28% used · {(50 - 14.2).toFixed(1)} GB remaining</Text>
      </View>

      <View style={styles.creditsCard}>
        <View style={styles.creditsHeader}>
          <Zap size={24} color="#FFD700" />
          <Text style={styles.creditsTitle}>Generation Credits</Text>
        </View>
        <Text style={styles.creditsValue}>{generationStats.creditsRemaining.toLocaleString()}</Text>
        <Text style={styles.creditsLabel}>Credits Remaining</Text>
        <View style={styles.creditsBar}>
          <View style={[styles.creditsBarFill, { width: `${(generationStats.creditsRemaining / 10000) * 100}%` }]} />
        </View>
        <Text style={styles.creditsUsed}>{generationStats.creditsUsed.toLocaleString()} credits used</Text>
        <TouchableOpacity style={styles.buyCreditsBtn}>
          <DollarSign size={18} color="#000" />
          <Text style={styles.buyCreditsText}>Buy More Credits</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Export Options</Text>
      <View style={styles.exportGrid}>
        {exportFormats.map((format, i) => (
          <View key={i} style={styles.exportCard}>
            <Text style={styles.exportFormat}>{format.format}</Text>
            <View style={styles.exportInfo}>
              <Text style={styles.exportDetail}>Size: {format.size}</Text>
              <Text style={styles.exportDetail}>Quality: {format.quality}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Media Generator</Text>
        <Text style={styles.subtitle}>AI-powered image & video generation</Text>
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
            style={[styles.tab, activeTab === 'gallery' && styles.tabActive]}
            onPress={() => setActiveTab('gallery')}
          >
            <FileImage size={18} color={activeTab === 'gallery' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'gallery' && styles.tabTextActive]}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'templates' && styles.tabActive]}
            onPress={() => setActiveTab('templates')}
          >
            <Layout size={18} color={activeTab === 'templates' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'templates' && styles.tabTextActive]}>Templates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'batches' && styles.tabActive]}
            onPress={() => setActiveTab('batches')}
          >
            <Package size={18} color={activeTab === 'batches' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'batches' && styles.tabTextActive]}>Batches</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
            onPress={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} color={activeTab === 'analytics' ? '#00E5FF' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>Analytics</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'gallery' && renderGalleryTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'batches' && renderBatchesTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
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
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ccc',
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
  styleScroll: {
    flexDirection: 'row',
  },
  styleChip: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#222',
  },
  styleEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  styleText: {
    fontSize: 11,
    color: '#ccc',
  },
  optionsGrid: {
    gap: 16,
    marginBottom: 20,
  },
  optionGroup: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  optionBtnActive: {
    backgroundColor: '#00E5FF20',
    borderColor: '#00E5FF',
  },
  optionBtnText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500' as const,
  },
  optionBtnTextActive: {
    color: '#00E5FF',
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
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleText: {
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
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  inputGroup: {
    gap: 8,
  },
  smallInput: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#222',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  generateBtn: {
    flex: 1,
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  secondaryBtn: {
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
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFD70010',
    borderRadius: 6,
  },
  creditsText: {
    fontSize: 12,
    color: '#FFD700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  featureCardActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#00E5FF05',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#888',
  },
  featureNameActive: {
    color: '#fff',
  },
  featureDesc: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  enabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enabledText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600' as const,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  viewControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  viewBtnActive: {
    borderColor: '#00E5FF',
  },
  filterBar: {
    marginBottom: 20,
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaList: {
    gap: 12,
  },
  mediaCard: {
    width: '48%',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  mediaListItem: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 12,
  },
  mediaPreview: {
    aspectRatio: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaInfo: {
    flex: 1,
  },
  mediaPrompt: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  mediaMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  templatePreview: {
    aspectRatio: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateEmoji: {
    fontSize: 40,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
  },
  templateStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  templateUses: {
    fontSize: 11,
    color: '#888',
  },
  useTemplateBtn: {
    backgroundColor: '#00E5FF20',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  useTemplateBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  batchList: {
    gap: 12,
  },
  batchCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  batchName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statuscompleted: {
    backgroundColor: '#10B981',
  },
  statusprocessing: {
    backgroundColor: '#F59E0B',
  },
  statusqueued: {
    backgroundColor: '#666',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#fff',
    textTransform: 'uppercase' as const,
  },
  batchProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
  },
  batchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batchTime: {
    fontSize: 11,
    color: '#666',
  },
  batchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  batchActionBtn: {
    backgroundColor: '#111',
    borderRadius: 6,
    padding: 6,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  analyticsCard: {
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
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  analyticsLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center' as const,
  },
  analyticsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticsChangeText: {
    fontSize: 11,
    color: '#10B981',
  },
  analyticsSubtext: {
    fontSize: 10,
    color: '#444',
  },
  storageCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  storageValue: {
    fontSize: 14,
    color: '#00E5FF',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  storageText: {
    fontSize: 12,
    color: '#666',
  },
  creditsCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
    alignItems: 'center',
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  creditsValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFD700',
    marginBottom: 4,
  },
  creditsLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  creditsBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  creditsBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  creditsUsed: {
    fontSize: 11,
    color: '#666',
    marginBottom: 16,
  },
  buyCreditsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 20,
  },
  buyCreditsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
  },
  exportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exportCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  exportFormat: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginBottom: 8,
  },
  exportInfo: {
    gap: 4,
  },
  exportDetail: {
    fontSize: 11,
    color: '#888',
  },
});
