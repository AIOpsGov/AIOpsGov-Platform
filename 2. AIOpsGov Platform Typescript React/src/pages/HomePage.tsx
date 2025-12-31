/**
 * Home Page Component
 * Landing page with navigation to different dashboards
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Text, Button } from '@fluentui/react-components';
import {
  ScaleFill24Regular,
  Building24Regular,
  HeartPulse24Regular,
  Money24Regular,
  Cart24Regular,
  HatGraduation24Regular,
  Shield24Regular,
  Home24Regular,
  Box24Regular,
  DrinkCoffee24Regular,
  Laptop24Regular,
  City24Regular,
  VehicleCar24Regular,
  Lightbulb24Regular,
  Pill24Regular,
  LeafOne24Regular,
  Video24Regular,
  VehicleTruck24Regular,
  People24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';
import { DASHBOARD_CONFIGS } from '../core/config/dashboardConfigs';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Icon mapping
  const iconMap: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
    Scale: ScaleFill24Regular,
    HomeGroup: Building24Regular,
    Health: HeartPulse24Regular,
    Money: Money24Regular,
    ShoppingCart: Cart24Regular,
    Education: HatGraduation24Regular,
    Shield: Shield24Regular,
    Home: Home24Regular,
    Product: Box24Regular,
    Cafe: DrinkCoffee24Regular,
    Devices4: Laptop24Regular,
    CityNext: City24Regular,
    Vehicles: VehicleCar24Regular,
    Lightbulb: Lightbulb24Regular,
    Pill: Pill24Regular,
    Plant: LeafOne24Regular,
    Video: Video24Regular,
    DeliveryTruck: VehicleTruck24Regular,
    People: People24Regular,
    Settings: Settings24Regular,
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || null;
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.hero}>
        <Text size={900} weight="bold" className={styles.heroTitle}>
          Welcome to AIOpsGov AI Metrics Hub
        </Text>
        <Text size={500} className={styles.heroSubtitle}>
          Monitor Microsoft Copilot agents across 20 industries
        </Text>
      </div>

      {/* Copilot Dashboards Section */}
      <div className={styles.section}>
        <Text size={600} weight="semibold" className={styles.sectionTitle}>
          Copilot Agent Dashboards
        </Text>
        
        <div className={styles.cardsGrid}>
          {DASHBOARD_CONFIGS.map(dashboard => {
            const IconComponent = getIconComponent(dashboard.icon);
            
            return (
              <Card key={dashboard.id} className={styles.navCard}>
                <div 
                  className={styles.cardIcon} 
                  style={{ 
                    background: `linear-gradient(135deg, ${dashboard.color}20 0%, ${dashboard.color}40 100%)` 
                  }}
                >
                  {IconComponent && (
                    <IconComponent style={{ width: '64px', height: '64px', color: dashboard.color }} />
                  )}
                </div>
                <div className={styles.cardContent}>
                  <Text size={600} weight="bold" className={styles.cardTitle}>
                    {dashboard.name}
                  </Text>
                  <Text size={300} className={styles.cardIndustry} style={{ color: dashboard.color }}>
                    {dashboard.industry}
                  </Text>
                  <Text size={400} className={styles.cardDescription}>
                    {dashboard.description}
                  </Text>
                  <Button
                    appearance="primary"
                    size="large"
                    style={{
                      backgroundColor: '#000000',
                      color: '#FFFFFF',
                      border: 'none',
                      minWidth: '180px',
                      marginTop: '0.5rem'
                    }}
                    onClick={() => navigate(dashboard.route)}
                  >
                    View Dashboard
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
