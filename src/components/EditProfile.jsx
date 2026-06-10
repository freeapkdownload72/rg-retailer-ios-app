import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Phone, Camera } from 'lucide-react';

function EditProfile({ customer, onSaveProfile, onClose }) {
  const [name, setName] = useState(customer?.name || 'Manisha Rawat');
  const [email] = useState(customer?.email || 'manisharawat7425@gmail.com');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [gender, setGender] = useState(customer?.gender || 'Male');
  const [ageGroup, setAgeGroup] = useState(customer?.ageGroup || '18-24');
  const [photoURL, setPhotoURL] = useState(customer?.photoURL || localStorage.getItem('rg_user_photo_url') || '');

  const fileInputRef = useRef(null);

  const genders = ['Male', 'Female', 'Other'];
  const ageGroups = ['18-24', '25-30', '31-40', '40+'];

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setPhotoURL(base64data);
        localStorage.setItem('rg_user_photo_url', base64data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    
    // Save to parent state and firestore
    onSaveProfile({
      name: name.trim(),
      phone: phone.trim(),
      gender,
      ageGroup,
      photoURL
    });
  };

  const getMonogram = () => {
    if (!name.trim()) return 'M';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 1).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Hidden File Picker Input */}
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--phone-card-border)', background: 'var(--phone-header-bg)' }}>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', margin: 0 }}>
          Edit Profile
        </h2>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', WebkitOverflowScrolling: 'touch' }}>
          
          {/* Avatar Monogram / Selected Image */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <div 
              onClick={handleAvatarClick}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: '#e93c76',
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: 900,
                fontFamily: "'Outfit', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(233,60,118,0.2)',
                overflow: 'hidden'
              }}>
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt="Profile Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getMonogram()
                )}
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--phone-card-bg)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <Camera size={12} />
              </div>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
              Tap to change photo
            </span>
          </div>

          {/* Full Name field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Full Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '16px', color: 'var(--phone-text-muted)' }} />
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--phone-card-border)',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: 'var(--phone-card-bg)',
                  color: 'var(--phone-text-title)',
                  outline: 'none',
                  fontFamily: "'Outfit', sans-serif"
                }}
              />
            </div>
          </div>

          {/* Email field (Disabled) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', color: 'var(--phone-text-muted)' }} />
              <input 
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--phone-card-border)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--phone-text-muted)',
                  outline: 'none',
                  background: 'var(--phone-bg)',
                  opacity: 0.8
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', marginLeft: '4px', fontWeight: 500 }}>
              Email cannot be changed
            </span>
          </div>

          {/* Phone field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Phone Number</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Phone size={16} style={{ position: 'absolute', left: '16px', color: 'var(--phone-text-muted)' }} />
              <input 
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--phone-card-border)',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: 'var(--phone-card-bg)',
                  color: 'var(--phone-text-title)',
                  outline: 'none',
                  fontFamily: "'Outfit', sans-serif"
                }}
              />
            </div>
          </div>

          {/* Gender selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Gender</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {genders.map(g => {
                const isSelected = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="interactive-element"
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '12px',
                      border: 'none',
                      background: isSelected ? 'var(--primary-color)' : 'var(--phone-card-border)',
                      color: isSelected ? '#ffffff' : 'var(--phone-text-body)',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Group selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Age Group</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {ageGroups.map(ag => {
                const isSelected = ageGroup === ag;
                return (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setAgeGroup(ag)}
                    className="interactive-element"
                    style={{
                      padding: '12px 0',
                      borderRadius: '12px',
                      border: 'none',
                      background: isSelected ? 'var(--primary-color)' : 'var(--phone-card-border)',
                      color: isSelected ? '#ffffff' : 'var(--phone-text-body)',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {ag}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sticky footer button */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--phone-card-border)', background: 'var(--phone-header-bg)' }}>
          <button
            type="submit"
            className="interactive-element"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 4px 14px rgba(255,109,51,0.2)',
              textAlign: 'center'
            }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
