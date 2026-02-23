import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';

const categories = [
  { id: 1, name: '3D Design', icon: '📦', color: '#E8D4F8' },
  { id: 2, name: 'Graphic Design', icon: '🎨', color: '#D4E8F8' },
  { id: 3, name: 'Web Development', icon: '💻', color: '#D4E0F8' },
  { id: 4, name: 'SEO & Marketing', icon: '📊', color: '#D4F0F8' },
  { id: 5, name: 'Finance & Accounting', icon: '🏛️', color: '#D4E8F0' },
  { id: 6, name: 'Personal Development', icon: '📈', color: '#F8E8D4' },
  { id: 7, name: 'Office Productivity', icon: '⚙️', color: '#D4E8F8' },
  { id: 8, name: 'HR Management', icon: '🐼', color: '#F0D4F8' },
];
const AllCategoryScreen = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      height: '100vh',
      backgroundColor: '#F8F9FD',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Status Bar */}
      <div style={{
        height: '44px',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '16px',
        fontSize: '12px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span style={{ marginRight: '4px' }}>📶</span>
        <span style={{ marginRight: '4px' }}>📡</span>
        <span>🔋</span>
        <span style={{ marginLeft: '8px', fontWeight: '600' }}>9:41</span>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}>
          <ArrowLeft size={24} color="#000" />
        </button>
        <h1 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginLeft: '12px',
          margin: '0',
          color: '#000'
        }}>All Category</h1>
      </div>

      {/* Search Bar */}
      <div style={{
        display: 'flex',
        padding: '16px',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{
          flex: 1,
          backgroundColor: '#F5F5F5',
          borderRadius: '8px',
          padding: '0 16px',
          height: '48px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search for..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              width: '100%',
              color: '#000'
            }}
          />
        </div>
        <button style={{
          backgroundColor: '#007AFF',
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: '8px',
          border: 'none',
          cursor: 'pointer'
        }}>
          <Search size={20} color="#fff" />
        </button>
      </div>

      {/* Categories Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 8px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <div style={{
                height: '100px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '8px',
                backgroundColor: category.color,
                fontSize: '40px'
              }}>
                {category.icon}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#000',
                textAlign: 'center'
              }}>
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


export default AllCategoryScreen;
