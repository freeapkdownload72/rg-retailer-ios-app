import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Home, 
  MapPin, 
  MoreVertical, 
  Plus, 
  Phone, 
  Briefcase, 
  Navigation, 
  X, 
  User 
} from 'lucide-react';

function MyAddresses({ savedAddresses = [], onAddAddress, onDeleteAddress, onClose }) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Advanced Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [type, setType] = useState('Home'); // Home, Office, Other

  const handleUseCurrentLocation = () => {
    setName(name || 'Manisha Rawat');
    setPhone(phone || '7425987654');
    setLine1('Flat 402, Royal Residency');
    setLine2('Linking Road, Bandra West');
    setCity('Mumbai');
    setState('Maharashtra');
    setPincode('400050');
    
    // Play subtle haptic feedback or sound if available
    try {
      if (navigator.vibrate) navigator.vibrate(15);
    } catch(e){}
    alert("Bandra West location coordinates synced successfully!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !line1.trim() || !pincode.trim() || !city.trim() || !state.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    if (phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (pincode.length < 6) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    // Compile legacy detail string for checkout compatibility
    const detailString = `${line1}${line2.trim() ? ', ' + line2.trim() : ''}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;

    onAddAddress({
      id: `addr_${Date.now()}`,
      name: name.trim(),
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      type: type,
      detail: detailString,
      isDefault: savedAddresses.length === 0
    });

    // Reset Form
    setName('');
    setPhone('');
    setLine1('');
    setLine2('');
    setPincode('');
    setCity('');
    setState('');
    setType('Home');
    setShowAddForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--phone-card-border)', background: 'var(--phone-header-bg)' }}>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', margin: 0 }}>
          Saved Addresses
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Toggle Form Button */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="interactive-element"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '20px',
              border: '2px dashed var(--primary-color)',
              backgroundColor: 'rgba(249, 115, 22, 0.05)',
              color: 'var(--primary-color)',
              fontSize: '14.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <Plus size={18} />
            Add New Address
          </button>
        ) : (
          <form 
            onSubmit={handleSubmit}
            style={{
              padding: '18px',
              borderRadius: '24px',
              border: '1.5px solid var(--phone-card-border)',
              backgroundColor: 'var(--phone-card-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0 }}>New Shipping Address</h3>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                style={{ background: 'var(--phone-bg)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* GPS Location Shortcut */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="interactive-element"
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                border: '1.5px solid var(--phone-text-title)',
                background: 'transparent',
                color: 'var(--phone-text-title)',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Navigation size={13} />
              Use my current location
            </button>
            
            {/* Address Type segmented buttons */}
            <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
              {[
                { id: 'Home', label: 'Home', icon: <Home size={13} /> },
                { id: 'Office', label: 'Office', icon: <Briefcase size={13} /> },
                { id: 'Other', label: 'Other', icon: <User size={13} /> }
              ].map(pill => {
                const isActive = type === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setType(pill.id)}
                    className="interactive-element"
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: isActive ? '1.5px solid var(--primary-color)' : '1.5px solid var(--phone-card-border)',
                      backgroundColor: isActive ? 'rgba(249, 115, 22, 0.08)' : 'var(--phone-bg)',
                      color: isActive ? 'var(--primary-color)' : 'var(--phone-text-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    {pill.icon}
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Full Name *</span>
              <input 
                type="text" 
                required
                placeholder="Contact Person Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1.2px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Phone Number *</span>
              <input 
                type="tel" 
                required
                maxLength="10"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1.2px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Address Line 1 *</span>
              <input 
                type="text" 
                required
                placeholder="Flat / House No., Building, Street"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1.2px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Address Line 2 (Optional)</span>
              <input 
                type="text" 
                placeholder="Area, Locality, Landmark"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1.2px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>PIN Code *</span>
                <input 
                  type="text" 
                  required
                  maxLength="6"
                  placeholder="6-digit PIN"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1.2px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>City *</span>
                <input 
                  type="text" 
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1.2px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>State *</span>
              <input 
                type="text" 
                required
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1.2px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="interactive-element"
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--phone-card-border)', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="interactive-element"
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary-color)', color: '#ffffff', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Saved Addresses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {savedAddresses.map(addr => {
            const resolvedType = addr.type || 'Home';
            return (
              <div 
                key={addr.id}
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  border: '1.5px solid var(--phone-card-border)',
                  backgroundColor: 'var(--phone-card-bg)',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Header inside address card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--primary-color)' }}>
                      {resolvedType === 'Office' || resolvedType === 'Work' ? (
                        <Briefcase size={13} />
                      ) : resolvedType === 'Home' ? (
                        <Home size={13} />
                      ) : (
                        <MapPin size={13} />
                      )}
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      {resolvedType}
                    </span>
                    {addr.isDefault && (
                      <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.3px' }}>
                        Default
                      </span>
                    )}
                  </div>

                  {/* Actions Button */}
                  <button 
                    onClick={() => {
                      if (window.confirm("Remove this saved address?")) {
                        onDeleteAddress(addr.id);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--phone-text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Remove address"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Address details - Defensive Render */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>
                    {addr.name}
                  </span>
                  
                  <p style={{ fontSize: '13px', color: 'var(--phone-text-body)', lineHeight: '1.45', margin: 0, fontWeight: 500 }}>
                    {addr.line1 ? (
                      <>
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ''}
                        <br />
                        {addr.city}, {addr.state} – {addr.pincode || addr.pinCode}
                      </>
                    ) : (
                      addr.detail || 'Address details missing.'
                    )}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--phone-text-muted)', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                    <Phone size={12} style={{ color: 'var(--primary-color)' }} />
                    <span>{addr.phone}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {savedAddresses.length === 0 && !showAddForm && (
            <div style={{ textAlign: 'center', padding: '36px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)' }}>
                <MapPin size={20} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--phone-text-title)' }}>No Saved Addresses</span>
              <p style={{ fontSize: '12px', color: 'var(--phone-text-muted)', margin: 0, lineHeight: '1.4' }}>
                Add your shipping address details to enable swift checkout in one click!
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MyAddresses;
