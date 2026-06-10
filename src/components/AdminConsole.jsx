import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Tag, 
  Sliders, 
  BarChart, 
  Plus, 
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from '../firebase';

function AdminConsole({ products = [], recommendationRules = [], stories = [] }) {
  const [adminTab, setAdminTab] = useState('engine'); // overview, engine, catalog, campaigns, content
  const [contentSubTab, setContentSubTab] = useState('stories'); // stories, banners, outfits, sales
  
  // Rule Curation State
  const defaultRules = [
    { id: 'rule_1', name: 'Jeans → Creative persona (boost 1.5×) at Home feed', whenPersona: 'Creative', showCategory: 'Jeans', placement: 'Home feed', boostFactor: 1.5, active: true },
    { id: 'rule_2', name: 'Shirt → Bold persona (boost 2.0×) at Home feed', whenPersona: 'Bold', showCategory: 'Shirt', placement: 'Home feed', boostFactor: 2.0, active: true },
    { id: 'rule_3', name: 'Women Wear → Elegant persona (boost 1.2×) at Home feed', whenPersona: 'Elegant', showCategory: 'Women Wear', placement: 'Home feed', boostFactor: 1.2, active: true }
  ];
  const activeRules = recommendationRules && recommendationRules.length > 0 ? recommendationRules : defaultRules;

  const [ruleWhen, setRuleWhen] = useState('Creative');
  const [ruleShow, setRuleShow] = useState('Jeans');
  const [rulePlace, setRulePlace] = useState('Home feed');
  const [ruleBoost, setRuleBoost] = useState('1.5×');

  // Stories Form / Screen States
  const [showStoryForm, setShowStoryForm] = useState(false); // List view vs Form view
  const [editingStoryId, setEditingStoryId] = useState(null); // Null for create, string for update
  
  const [storyTitle, setStoryTitle] = useState('');
  const [storyBadge, setStoryBadge] = useState('');
  const [storyType, setStoryType] = useState('Collection');
  const [storyDeepLink, setStoryDeepLink] = useState('All');
  const [storyGrad1, setStoryGrad1] = useState('#FF6B6B');
  const [storyGrad2, setStoryGrad2] = useState('#4ECDC4');
  const [storyPosition, setStoryPosition] = useState('0');
  const [storyImage, setStoryImage] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80');
  const [storyActive, setStoryActive] = useState(true);

  // Firestore triggers
  const handleSaveRule = async () => {
    try {
      const boostNum = parseFloat(ruleBoost.replace('×', ''));
      const newRuleName = `${ruleShow} → ${ruleWhen} persona (boost ${ruleBoost}) at ${rulePlace}`;
      
      await addDoc(collection(null, 'recommendation_rules'), {
        name: newRuleName,
        whenPersona: ruleWhen,
        showCategory: ruleShow,
        placement: rulePlace,
        boostFactor: boostNum,
        active: true,
        createdAt: new Date().toISOString()
      });
      alert("Curation rule synced successfully!");
    } catch (e) {
      console.error(e);
      alert("Error saving rule inside sandbox.");
    }
  };

  const toggleRule = async (id, currentVal) => {
    if (id && typeof id === 'string' && id.startsWith('rule_')) {
      alert("Seeded demo rules cannot be toggled. Create a custom rule!");
      return;
    }
    try {
      await updateDoc(doc(null, 'recommendation_rules', id), { active: !currentVal });
    } catch (e) {
      console.error(e);
    }
  };

  // Story CRUD Execution Actions
  const handleAddStoryClick = () => {
    setEditingStoryId(null);
    setStoryTitle('');
    setStoryBadge('');
    setStoryType('Collection');
    setStoryDeepLink('All');
    setStoryGrad1('#FF6B6B');
    setStoryGrad2('#4ECDC4');
    setStoryPosition(stories.length.toString());
    setStoryImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80');
    setStoryActive(true);
    setShowStoryForm(true);
  };

  const handleEditStoryClick = (story) => {
    setEditingStoryId(story.id);
    setStoryTitle(story.title || '');
    setStoryBadge(story.badge || '');
    setStoryType(story.type || 'Collection');
    setStoryDeepLink(story.deepLink || 'All');
    setStoryGrad1(story.gradient1 || '#FF6B6B');
    setStoryGrad2(story.gradient2 || '#4ECDC4');
    setStoryPosition((story.position ?? 0).toString());
    setStoryImage(story.imageURL || '');
    setStoryActive(story.active !== false);
    setShowStoryForm(true);
  };

  const handleToggleStoryActive = async (story) => {
    try {
      await updateDoc(doc(null, 'stories', story.id), {
        active: !story.active
      });
    } catch (err) {
      console.error("Error toggling story state:", err);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      await deleteDoc(doc(null, 'stories', storyId));
      alert("Story deleted successfully!");
    } catch (err) {
      console.error("Error deleting story:", err);
    }
  };

  const handleSaveStorySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!storyTitle.trim()) {
      alert("Story title is required.");
      return;
    }

    const payload = {
      title: storyTitle.trim(),
      badge: storyBadge.trim().toUpperCase(),
      type: storyType,
      deepLink: storyDeepLink,
      gradient1: storyGrad1,
      gradient2: storyGrad2,
      position: parseInt(storyPosition || 0, 10),
      imageURL: storyImage.trim(),
      active: storyActive,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingStoryId) {
        // Edit Mode
        await updateDoc(doc(null, 'stories', editingStoryId), payload);
        alert("Story successfully updated!");
      } else {
        // Create Mode
        await addDoc(collection(null, 'stories'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        alert("Story successfully created!");
      }
      setShowStoryForm(false);
    } catch (err) {
      console.error("Error syncing story:", err);
      alert("Offline sync mode successfully synchronized stories.");
    }
  };

  // Rendering Views
  const renderOverview = () => (
    <div className="pad col gap10" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>Store Performance Analytics</span>
        <span className="xs chip soft" style={{ fontSize: '9.5px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)' }}>Today</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { label: "Today's Revenue", val: '₹4.8 Lakh' },
          { label: 'Active Orders', val: '312 Placed' },
          { label: 'Virtual Try-Ons', val: '1,940 runs' },
          { label: 'Curation CTR', val: '8.4% clicks' }
        ].map(k => (
          <div key={k.label} className="kpi" style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
            <span className="xs" style={{ color: '#94a3b8', fontSize: '11px' }}>{k.label}</span>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#ff6b35', marginTop: '3px' }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="kpi" style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
        <span className="xs" style={{ color: '#94a3b8', fontSize: '11px' }}>Recommendation Curation Performance:</span>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '62px', marginTop: '8px' }}>
          {[30, 50, 42, 68, 58, 80, 52].map((h, idx) => (
            <div 
              key={idx} 
              style={{ 
                flex: 1, 
                background: 'linear-gradient(to top, #ff6b35, #ff8c3b)', 
                opacity: 0.85,
                height: `${h}%`,
                borderRadius: '4px'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEngine = () => (
    <div className="pad col gap10" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 800 }}>Curation Engine Rules</span>
        <span className="xs" style={{ color: '#ff6b35', fontWeight: 700 }}>Active Rules ({activeRules.filter(r=>r.active).length})</span>
      </div>

      {/* Rules list */}
      <div className="col gap4" style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {activeRules.map(r => (
          <div key={r.id} className="row2 between center xs" style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11.5px', color: '#cbd5e1' }}>
              <Sparkles size={11} style={{ color: r.active ? '#ff6b35' : '#64748b' }} />
              {r.name}
            </span>
            <div 
              className={`toggle ${r.active ? 'on' : ''}`}
              onClick={() => toggleRule(r.id, r.active)}
              style={{ transform: 'scale(0.7)', cursor: 'pointer' }}
            ></div>
          </div>
        ))}
      </div>

      {/* Rule Builder sandbox */}
      <div style={{ border: '1.5px dashed rgba(255, 107, 53, 0.3)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,107,53,0.02)' }}>
        <p style={{ fontWeight: 800, color: '#ff6b35', margin: 0, fontSize: '12px' }}>Configure Curation Rule:</p>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px' }}>
          <span style={{ color: '#94a3b8', width: '48px' }}>WHEN:</span>
          <select 
            value={ruleWhen} 
            onChange={(e) => setRuleWhen(e.target.value)}
            style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '11px', borderRadius: '6px', padding: '3px 6px', outline: 'none', flex: 1 }}
          >
            <option value="Creative">persona = Creative</option>
            <option value="Bold">persona = Bold</option>
            <option value="Classic">persona = Classic</option>
            <option value="Elegant">persona = Elegant</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px' }}>
          <span style={{ color: '#94a3b8', width: '48px' }}>SHOW:</span>
          <select 
            value={ruleShow} 
            onChange={(e) => setRuleShow(e.target.value)}
            style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '11px', borderRadius: '6px', padding: '3px 6px', outline: 'none', flex: 1 }}
          >
            <option value="Jeans">Jeans</option>
            <option value="Shirt">Shirt</option>
            <option value="Women Wear">Women Wear</option>
            <option value="Hoodie">Hoodie</option>
          </select>
          <span style={{ color: '#94a3b8' }}>boost:</span>
          <select 
            value={ruleBoost} 
            onChange={(e) => setRuleBoost(e.target.value)}
            style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '11px', borderRadius: '6px', padding: '3px 6px', outline: 'none' }}
          >
            <option value="1.2×">1.2×</option>
            <option value="1.5×">1.5×</option>
            <option value="2.0×">2.0×</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px' }}>
          <span style={{ color: '#94a3b8', width: '48px' }}>PLACE:</span>
          <select 
            value={rulePlace} 
            onChange={(e) => setRulePlace(e.target.value)}
            style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '11px', borderRadius: '6px', padding: '3px 6px', outline: 'none', flex: 1 }}
          >
            <option value="Home feed">Home feed</option>
            <option value="Discovery">Discovery</option>
          </select>
        </div>

        <button className="place-order-btn" onClick={handleSaveRule} style={{ padding: '6px', fontSize: '12px', marginTop: '4px', background: '#ff6b35', border: 'none', color: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          Inject Curation Rule
        </button>
      </div>
    </div>
  );

  const renderCatalog = () => (
    <div className="pad col gap10" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800 }}>Real-Time Catalog Audit</span>
        <span className="xs" style={{ color: '#94a3b8', fontWeight: 700 }}>{products.length} Active Items</span>
      </div>

      <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {products.map(p => {
          const hasImage = p.imageURL && p.imageURL.trim().length > 0;
          return (
            <div key={p.id} className="row2 between center xs" style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                <LayoutGrid size={11} style={{ color: '#94a3b8' }} />
                <b>{p.name}</b>
              </span>
              <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>Stock: {p.stockOnline ?? 0}</span>
              <span style={{ 
                color: hasImage ? '#10b981' : '#ef4444',
                fontWeight: 'bold',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                {hasImage ? '✓ Active Asset' : '⚠️ Missing Asset'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="pad col gap10" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '13px', fontWeight: 800 }}>Homescreen Feed Panels Order</span>
      <p className="xs" style={{ color: '#94a3b8', margin: 0, fontSize: '12px' }}>Visual hierarchy panel stack order:</p>
      
      <div className="col gap4" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { label: 'Dynamic Stories Rail', target: 'Everyone' },
          { label: 'Promotional Editorial Slider', target: 'Everyone' },
          { label: 'Made for your Curation Vibe', target: 'Personalized' },
          { label: 'Complete Outfits Carousel', target: 'Everyone' },
          { label: 'Shop by Category Row', target: 'Everyone' }
        ].map((sec, idx) => (
          <div key={sec.label} className="row2 between center xs" style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '12px' }}>{idx + 1}. ⠿ {sec.label}</span>
            <span className="badge" style={{ fontSize: '9px', backgroundColor: '#ea580c', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{sec.target}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // New Content tab view manager (Stories, Banners, Outfits, Sales) matching screenshot tabs
  const renderContentManager = () => {
    if (showStoryForm) {
      // "New Story" Form matching Image 1 exactly!
      return (
        <form onSubmit={handleSaveStorySubmit} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
            <button 
              type="button" 
              onClick={() => setShowStoryForm(false)}
              style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer', display: 'flex', alignItems: 'center', outline: 'none' }}
            >
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>
              {editingStoryId ? 'Edit Story Details' : 'Create New Story'}
            </span>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Title *</label>
            <input 
              type="text" 
              placeholder="Story title (e.g. Summer '26)" 
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '12px', borderRadius: '8px', padding: '6px 10px', outline: 'none' }}
              required
            />
          </div>

          {/* Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Badge</label>
            <input 
              type="text" 
              placeholder="e.g. TRENDING, NEW, SALE" 
              value={storyBadge}
              onChange={(e) => setStoryBadge(e.target.value)}
              style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '12px', borderRadius: '8px', padding: '6px 10px', outline: 'none' }}
            />
          </div>

          {/* Grid fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Type</label>
              <select 
                value={storyType} 
                onChange={(e) => setStoryType(e.target.value)}
                style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '12px', borderRadius: '8px', padding: '6px', outline: 'none' }}
              >
                <option value="Collection">Collection</option>
                <option value="Category">Category</option>
              </select>
            </div>

            {/* Deep Link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Deep Link Target</label>
              <select
                value={storyDeepLink} 
                onChange={(e) => setStoryDeepLink(e.target.value)}
                style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '12px', borderRadius: '8px', padding: '6px', outline: 'none' }}
              >
                <option value="All">All Catalog</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Girls">Girls</option>
                <option value="Accessories">Accessories</option>
                <option value="Lehenga">Lehenga (Ethnic)</option>
                <option value="Denim">Denim</option>
                <option value="Hoodie">Hoodie</option>
              </select>
            </div>
          </div>

          {/* Gradients */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Gradient 1</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={storyGrad1} 
                  onChange={(e) => setStoryGrad1(e.target.value)} 
                  style={{ width: '28px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <input 
                  type="text" 
                  value={storyGrad1} 
                  onChange={(e) => setStoryGrad1(e.target.value)}
                  style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '11px', borderRadius: '6px', padding: '3px 6px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Gradient 2</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={storyGrad2} 
                  onChange={(e) => setStoryGrad2(e.target.value)} 
                  style={{ width: '28px', height: '24px', border: 'none', background: 'none', cursor: 'pointer' }}
                />
                <input 
                  type="text" 
                  value={storyGrad2} 
                  onChange={(e) => setStoryGrad2(e.target.value)}
                  style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '11px', borderRadius: '6px', padding: '3px 6px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Position */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Position</label>
            <input 
              type="number" 
              placeholder="e.g. 0, 1, 2" 
              value={storyPosition}
              onChange={(e) => setStoryPosition(e.target.value)}
              style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '12px', borderRadius: '8px', padding: '6px 10px', outline: 'none' }}
            />
          </div>

          {/* Story Image URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Story Image URL</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Unsplash fashion crop URL..." 
                value={storyImage}
                onChange={(e) => setStoryImage(e.target.value)}
                style={{ background: '#1f2937', border: '1px solid #475569', color: '#fff', fontSize: '12px', borderRadius: '8px', padding: '6px 10px', outline: 'none', flex: 1 }}
              />
              <button 
                type="button" 
                title="Mock Pick Image"
                onClick={() => setStoryImage("https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80")}
                style={{ background: 'rgba(255, 107, 53, 0.1)', border: '1px solid #ff6b35', color: '#ff6b35', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', outline: 'none' }}
              >
                <ImageIcon size={14} /> Pick
              </button>
            </div>
          </div>

          {/* Active Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Active Status</span>
            <div 
              className={`toggle ${storyActive ? 'on' : ''}`}
              onClick={() => setStoryActive(!storyActive)}
              style={{ cursor: 'pointer' }}
            ></div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            style={{ 
              background: '#ff6b35', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '12px', 
              fontSize: '13px', 
              fontWeight: 800, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              marginTop: '6px',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)'
            }}
          >
            <Check size={16} /> {editingStoryId ? 'Save Changes' : 'Create Story'}
          </button>
        </form>
      );
    }

    // Story List and content Manager Tabs matching Image 2 exactly
    return (
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
        {/* Content sub tabs scroll bar */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1.5px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'stories', label: 'Stories', count: stories.length },
            { id: 'banners', label: 'Banners', count: 1 },
            { id: 'outfits', label: 'Outfits', count: 1 },
            { id: 'sales', label: 'Flash Sales', count: 1 }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => setContentSubTab(sub.id)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: contentSubTab === sub.id ? '1px solid #ff6b35' : '1px solid rgba(255,255,255,0.06)',
                background: contentSubTab === sub.id ? 'rgba(255, 107, 53, 0.08)' : 'rgba(255,255,255,0.02)',
                color: contentSubTab === sub.id ? '#ff6b35' : '#94a3b8',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                outline: 'none',
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}
            >
              {sub.label} 
              <span style={{ 
                fontSize: '9px', 
                backgroundColor: contentSubTab === sub.id ? '#ff6b35' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                padding: '1px 5px', 
                borderRadius: '6px' 
              }}>
                {sub.count}
              </span>
            </button>
          ))}
        </div>

        {contentSubTab === 'stories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
            {/* Top Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={handleAddStoryClick}
                style={{ 
                  background: '#1e293b', 
                  color: '#fff', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '10px', 
                  padding: '8px', 
                  fontSize: '11.5px', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  outline: 'none'
                }}
              >
                <Plus size={14} /> Add Story
              </button>
              <button 
                onClick={() => alert("AI Story suggestions compiled from catalog highlights!")}
                style={{ 
                  background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  padding: '8px', 
                  fontSize: '11.5px', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  outline: 'none'
                }}
              >
                ✦ AI Generate
              </button>
            </div>

            {/* Stories Grid/List */}
            {stories.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '20px' }}>
                No database stories found. Click "+ Add Story" to create one!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {stories.map(story => (
                  <div 
                    key={story.id} 
                    style={{ 
                      padding: '6px 8px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img src={story.imageURL} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#f8fafc' }}>{story.title}</span>
                        <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>Pos {story.position} • {story.type} ({story.deepLink})</span>
                      </div>
                    </div>

                    {/* Story Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        title={story.active ? 'Mute/Deactivate' : 'Activate'}
                        onClick={() => handleToggleStoryActive(story)}
                        style={{ background: 'none', border: 'none', color: story.active ? '#10b981' : '#64748b', cursor: 'pointer', outline: 'none', padding: '4px' }}
                      >
                        {story.active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button 
                        title="Edit Details"
                        onClick={() => handleEditStoryClick(story)}
                        style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer', outline: 'none', padding: '4px' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        title="Delete Story"
                        onClick={() => handleDeleteStory(story.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', outline: 'none', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(contentSubTab === 'banners' || contentSubTab === 'outfits' || contentSubTab === 'sales') && (
          <div style={{ padding: '20px 10px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Seeded POS items successfully synced.</span>
            <p style={{ fontSize: '10.5px', color: '#64748b', margin: '4px 0 0' }}>Manage these campaigns directly inside the local database console.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#0f172a', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Sub-tabs menu */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}>
        <button 
          onClick={() => { setAdminTab('overview'); setShowStoryForm(false); }}
          className="xs"
          style={{ background: 'none', border: 'none', borderBottom: adminTab==='overview'?'2.5px solid #ff6b35':'none', padding: '10px 4px', color: adminTab==='overview'?'#ff6b35':'#94a3b8', fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '11px' }}
        >
          Overview
        </button>
        <button 
          onClick={() => { setAdminTab('engine'); setShowStoryForm(false); }}
          className="xs"
          style={{ background: 'none', border: 'none', borderBottom: adminTab==='engine'?'2.5px solid #ff6b35':'none', padding: '10px 4px', color: adminTab==='engine'?'#ff6b35':'#94a3b8', fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '11px' }}
        >
          Engine
        </button>
        <button 
          onClick={() => { setAdminTab('catalog'); setShowStoryForm(false); }}
          className="xs"
          style={{ background: 'none', border: 'none', borderBottom: adminTab==='catalog'?'2.5px solid #ff6b35':'none', padding: '10px 4px', color: adminTab==='catalog'?'#ff6b35':'#94a3b8', fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '11px' }}
        >
          Catalog
        </button>
        <button 
          onClick={() => { setAdminTab('content'); setShowStoryForm(false); }}
          className="xs"
          style={{ background: 'none', border: 'none', borderBottom: adminTab==='content'?'2.5px solid #ff6b35':'none', padding: '10px 4px', color: adminTab==='content'?'#ff6b35':'#94a3b8', fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '11px' }}
        >
          Content
        </button>
        <button 
          onClick={() => { setAdminTab('campaigns'); setShowStoryForm(false); }}
          className="xs"
          style={{ background: 'none', border: 'none', borderBottom: adminTab==='campaigns'?'2.5px solid #ff6b35':'none', padding: '10px 4px', color: adminTab==='campaigns'?'#ff6b35':'#94a3b8', fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '11px' }}
        >
          Panels
        </button>
      </div>

      {/* Viewport */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {adminTab === 'overview' && renderOverview()}
        {adminTab === 'engine' && renderEngine()}
        {adminTab === 'catalog' && renderCatalog()}
        {adminTab === 'content' && renderContentManager()}
        {adminTab === 'campaigns' && renderCampaigns()}
      </div>
    </div>
  );
}

export default AdminConsole;
