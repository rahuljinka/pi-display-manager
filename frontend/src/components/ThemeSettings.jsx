import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { themes } from '../theme/themes';
import { Card, Button, SectionHeader } from './ui';

export default function ThemeSettings() {
  const { themeName, setTheme } = useTheme();

  return (
    <div style={{ width: '100%' }}>
      <SectionHeader title="Theme Settings" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
        {Object.keys(themes).map((name) => (
          <Card 
            key={name}
            style={{
              border: themeName === name ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => setTheme(name)}
          >
            {themeName === name && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'var(--color-primary)',
                color: 'white',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
                borderBottomLeftRadius: 'var(--radius-md)'
              }}>
                ACTIVE
              </div>
            )}
            
            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{themes[name].name}</span>
            
            <div style={{ display: 'flex', gap: '4px', marginTop: 'var(--spacing-xs)' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: themes[name].colors.background, border: '1px solid #ccc' }} />
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: themes[name].colors.surface, border: '1px solid #ccc' }} />
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: themes[name].colors.primary }} />
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: themes[name].colors.success }} />
            </div>
            
            <Button 
              variant={themeName === name ? 'primary' : 'ghost'} 
              size="sm" 
              style={{ marginTop: 'var(--spacing-sm)' }}
              onClick={(e) => {
                e.stopPropagation();
                setTheme(name);
              }}
            >
              Select
            </Button>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3>Preview</h3>
        <Card style={{ border: '1px solid var(--color-border)' }}>
          <p>This is how components will look in the <strong>{themes[themeName].name}</strong> theme.</p>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
