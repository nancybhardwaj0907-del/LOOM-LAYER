import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings as SettingsIcon, 
  Ruler, 
  Bell, 
  Database, 
  Layers, 
  Palette, 
  CheckCircle2, 
  Camera, 
  Leaf,
  Upload,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCw,
  Sliders,
  Sparkles,
  Zap,
  Scale,
  Cpu,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useUserProfile } from '../context/useUserProfile';
import { useProjects } from '../context/useProjects';

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile, updateAvatar, resetAvatar, updateSection } = useUserProfile();
  const { projects } = useProjects();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Local state initialized from profile context
  const [localProfile, setLocalProfile] = useState({
    name: profile.name || 'Nancy',
    email: profile.email || 'nonu@example.com',
    role: profile.role || 'Student / Developer',
    organization: profile.organization || 'Loom & Layer',
    bio: profile.bio || 'Atelier pattern grading & sustainable circular nesting specialist.'
  });

  const [localPrefs, setLocalPrefs] = useState({ ...profile.preferences });
  const [localUnits, setLocalUnits] = useState({ ...profile.units });
  const [localNotifs, setLocalNotifs] = useState({ ...profile.notifications });
  const [localAppearance, setLocalAppearance] = useState({ ...profile.appearance });

  // Helper function to compress image into a lightweight data URL
  const compressImage = (file, maxWidth = 320, maxHeight = 320, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Photo Upload
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file, 320, 320, 0.85);
      updateAvatar(compressedDataUrl);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Canvas compression error, falling back to direct reader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          updateAvatar(dataUrl);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    resetAvatar();
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveProfile = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateProfile(localProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePreferences = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateSection('preferences', localPrefs);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveUnits = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateSection('units', localUnits);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveNotifications = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateSection('notifications', localNotifs);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveAppearance = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    updateSection('appearance', localAppearance);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'units', label: 'Units & Measurements', icon: Ruler },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. HEADER BAR
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#EAE2DE] shadow-xs bg-[#F3E6E4] shrink-0">
            <img
              src={profile.avatar || "/atelier/user_avatar.jpg"}
              alt="Designer Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/atelier/user_avatar.jpg";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#4A252B] tracking-tight">
              Settings
            </h1>
            <p className="text-xs text-[#81777B]">
              Manage your account preferences and application settings.
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-[#F3E6E4] border border-[#C08274] text-[#783751] text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#783751] shrink-0" />
            <span>Settings updated and saved successfully!</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-[#783751] text-xs font-bold px-2 py-0.5 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================
          2. TWO-COLUMN LAYOUT: SUB-NAV + SETTINGS CONTENT
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sub-Navigation Menu (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EAE2DE] p-3 shadow-xs space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#F3E6E4] text-[#783751] font-bold border border-[#C08274]'
                    : 'text-stone-700 hover:bg-[#FBF7F5] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#783751]' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EAE2DE] p-6 sm:p-7 shadow-xs relative overflow-hidden">
          
          {/* Subtle Botanical Leaf Accent in background */}
          <div className="absolute top-6 right-6 pointer-events-none opacity-20 text-[#783751]">
            <Leaf className="w-24 h-24" />
          </div>

          {/* ========================================================
              TAB 1: PROFILE INFORMATION
              ======================================================== */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-sm font-semibold text-[#4A252B] mb-6">
                Profile Information
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl relative z-10">
                
                {/* Avatar Photo Section with Functional File Picker */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#EAE2DE] bg-[#F3E6E4] shrink-0 shadow-xs relative group">
                    <img
                      src={profile.avatar || "/atelier/user_avatar.jpg"}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/atelier/user_avatar.jpg";
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#EAE2DE] bg-[#FBF7F5] text-stone-700 hover:bg-white hover:border-[#783751] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#783751]" />
                        <span>Change Photo</span>
                      </button>

                      {profile.avatar && profile.avatar !== '/atelier/user_avatar.jpg' && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400">JPG, PNG or WebP. Max size 5MB.</p>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={localProfile.name}
                      onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all"
                      placeholder="e.g. Nancy"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={localProfile.email}
                      onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all"
                      placeholder="e.g. nonu@example.com"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Role
                    </label>
                    <input
                      type="text"
                      value={localProfile.role}
                      onChange={(e) => setLocalProfile({ ...localProfile, role: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all"
                      placeholder="e.g. Student / Developer"
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={localProfile.organization}
                      onChange={(e) => setLocalProfile({ ...localProfile, organization: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all"
                      placeholder="e.g. Loom & Layer"
                    />
                  </div>
                </div>

                {/* Bio / Atelier Notes */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Atelier Notes & Bio
                  </label>
                  <textarea
                    rows={2}
                    value={localProfile.bio}
                    onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all resize-none"
                    placeholder="Short description of your atelier or production focus..."
                  />
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ========================================================
              TAB 2: PREFERENCES
              ======================================================== */}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-sm font-semibold text-[#4A252B] mb-6">
                Cutting & Nesting Preferences
              </h2>

              <form onSubmit={handleSavePreferences} className="space-y-6 max-w-xl relative z-10">
                
                {/* Default Fabric Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Default Fabric Material
                  </label>
                  <select
                    value={localPrefs.defaultFabric}
                    onChange={(e) => setLocalPrefs({ ...localPrefs, defaultFabric: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all cursor-pointer"
                  >
                    <option value="Cotton">Cotton (Plain Weave / Poplin)</option>
                    <option value="Denim">Heavy Denim (Twill)</option>
                    <option value="Linen">Linen (Bespoke Suiting)</option>
                    <option value="Jersey">Jersey (Stretch Knit)</option>
                    <option value="Polyester">Polyester (Performance)</option>
                    <option value="Silk">Silk / Satin (Delicate Weave)</option>
                  </select>
                </div>

                {/* Default Blade Clearance Spacing */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Default Clearance Spacing (cm)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="3.0"
                      value={localPrefs.defaultSpacing}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, defaultSpacing: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all"
                    />
                    <span className="text-xs font-mono font-semibold px-3 py-2 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE] text-stone-600">
                      cm
                    </span>
                  </div>
                  <p className="text-[11px] text-[#81777B] mt-1">Recommended 0.5 cm for automated CNC cutter beds.</p>
                </div>

                {/* Toggle Controls */}
                <div className="space-y-3 pt-2">
                  {/* Rotation Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Allow 180° Pattern Rotation</span>
                      <span className="text-[11px] text-[#81777B]">Permit symmetric garment pieces to rotate for higher nesting yield</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalPrefs({ ...localPrefs, allowRotation: !localPrefs.allowRotation })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localPrefs.allowRotation ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${
                          localPrefs.allowRotation ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Grain Lock Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Strict Grainline Alignment Lock</span>
                      <span className="text-[11px] text-[#81777B]">Strictly respect warp and weft textile fiber directions</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalPrefs({ ...localPrefs, respectGrain: !localPrefs.respectGrain })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localPrefs.respectGrain ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${
                          localPrefs.respectGrain ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Auto-save Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Auto-save Nested Marker Layouts</span>
                      <span className="text-[11px] text-[#81777B]">Automatically persist layout variants to browser storage</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalPrefs({ ...localPrefs, autoSaveLayouts: !localPrefs.autoSaveLayouts })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localPrefs.autoSaveLayouts ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${
                          localPrefs.autoSaveLayouts ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ========================================================
              TAB 3: UNITS & MEASUREMENTS
              ======================================================== */}
          {activeTab === 'units' && (
            <div>
              <h2 className="text-sm font-semibold text-[#4A252B] mb-6">
                Units & Measurement Standards
              </h2>

              <form onSubmit={handleSaveUnits} className="space-y-6 max-w-xl relative z-10">
                
                {/* Unit System Cards */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-2">
                    Measurement System
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocalUnits({ ...localUnits, unitSystem: 'metric', areaUnit: 'm²', weightUnit: 'kg' })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        localUnits.unitSystem === 'metric'
                          ? 'border-[#C08274] bg-[#F3E6E4] ring-1 ring-[#783751]'
                          : 'border-[#EAE2DE] bg-[#FBF7F5]'
                      }`}
                    >
                      <span className="text-xs font-bold text-stone-900 block">Metric System</span>
                      <span className="text-[11px] text-[#81777B]">Centimeters (cm), Meters (m), Kilograms (kg)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocalUnits({ ...localUnits, unitSystem: 'imperial', areaUnit: 'yd²', weightUnit: 'lb' })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        localUnits.unitSystem === 'imperial'
                          ? 'border-[#C08274] bg-[#F3E6E4] ring-1 ring-[#783751]'
                          : 'border-[#EAE2DE] bg-[#FBF7F5]'
                      }`}
                    >
                      <span className="text-xs font-bold text-stone-900 block">Imperial System</span>
                      <span className="text-[11px] text-[#81777B]">Inches (in), Yards (yd), Pounds (lb)</span>
                    </button>
                  </div>
                </div>

                {/* Precision & Decimals */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Decimal Coordinate Precision
                    </label>
                    <select
                      value={localUnits.precision}
                      onChange={(e) => setLocalUnits({ ...localUnits, precision: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all cursor-pointer"
                    >
                      <option value={0}>0 decimals (e.g. 150 cm)</option>
                      <option value={1}>1 decimal (e.g. 150.5 cm)</option>
                      <option value={2}>2 decimals (e.g. 150.55 cm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                      Fabric Area Metric
                    </label>
                    <select
                      value={localUnits.areaUnit}
                      onChange={(e) => setLocalUnits({ ...localUnits, areaUnit: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all cursor-pointer"
                    >
                      <option value="m²">Square Meters (m²)</option>
                      <option value="yd²">Square Yards (yd²)</option>
                      <option value="ft²">Square Feet (ft²)</option>
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer"
                  >
                    Save Units
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ========================================================
              TAB 4: NOTIFICATIONS
              ======================================================== */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-sm font-semibold text-[#4A252B] mb-6">
                Notification & Alert Preferences
              </h2>

              <form onSubmit={handleSaveNotifications} className="space-y-4 max-w-xl relative z-10">
                
                {/* Email Delivery Input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Notification Recipient Email
                  </label>
                  <input
                    type="email"
                    value={localNotifs.notificationEmail || localProfile.email}
                    onChange={(e) => setLocalNotifs({ ...localNotifs, notificationEmail: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] text-stone-900 focus:bg-white focus:outline-none focus:border-[#783751] transition-all"
                  />
                </div>

                {/* Notification Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Nesting Optimization Finished</span>
                      <span className="text-[11px] text-[#81777B]">Receive an alert when algorithmic cutting solver completes</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalNotifs({ ...localNotifs, emailNestingDone: !localNotifs.emailNestingDone })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localNotifs.emailNestingDone ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${localNotifs.emailNestingDone ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">High Scrap Offcut Warning</span>
                      <span className="text-[11px] text-[#81777B]">Alert when pattern arrangement generates more than 25% waste</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalNotifs({ ...localNotifs, scrapAlerts: !localNotifs.scrapAlerts })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localNotifs.scrapAlerts ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${localNotifs.scrapAlerts ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Weekly ESG & Sustainability Digest</span>
                      <span className="text-[11px] text-[#81777B]">Weekly report on meters saved and upcycled products made</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalNotifs({ ...localNotifs, weeklyESG: !localNotifs.weeklyESG })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localNotifs.weeklyESG ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${localNotifs.weeklyESG ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer"
                  >
                    Save Notifications
                  </button>
                </div>

              </form>
            </div>
          )}



          {/* ========================================================
              TAB 7: APPEARANCE
              ======================================================== */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-sm font-semibold text-[#4A252B] mb-6">
                Visual Theme & Display Options
              </h2>

              <form onSubmit={handleSaveAppearance} className="space-y-5 max-w-xl relative z-10">
                
                {/* Theme Palette Cards */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-2">
                    Application Palette
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-[#C08274] bg-[#F3E6E4] ring-1 ring-[#783751]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-[#783751]" />
                        <span className="text-xs font-bold text-stone-900">Soft Peach, Dusty Rose & Burgundy</span>
                      </div>
                      <span className="text-[11px] text-[#81777B]">Warm ivory canvas, burgundy accents & blush rose surfaces</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#EAE2DE] bg-[#FBF7F5] opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full bg-stone-900" />
                        <span className="text-xs font-bold text-stone-900">Editorial Dark Mode</span>
                      </div>
                      <span className="text-[11px] text-[#81777B]">High-contrast cutting room night mode (Auto-synced)</span>
                    </div>
                  </div>
                </div>

                {/* Appearance Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">High Contrast Canvas Rulers</span>
                      <span className="text-[11px] text-[#81777B]">Crisp 1cm calibration markings along fabric length and width</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalAppearance({ ...localAppearance, highContrastRulers: !localAppearance.highContrastRulers })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localAppearance.highContrastRulers ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${localAppearance.highContrastRulers ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE]">
                    <div>
                      <span className="text-xs font-semibold text-stone-900 block">Botanical Art Watermarks</span>
                      <span className="text-[11px] text-[#81777B]">Display subtle sustainable fashion botanical illustrations</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalAppearance({ ...localAppearance, botanicalAccents: !localAppearance.botanicalAccents })}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        localAppearance.botanicalAccents ? 'bg-[#783751]' : 'bg-stone-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform absolute top-1 ${localAppearance.botanicalAccents ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer"
                  >
                    Save Appearance
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
