import React from 'react';
import Hero from '../components/Hero';
import NarrativeSlider from '../components/NarrativeSlider';
import WhatWeDo from '../components/WhatWeDo';
import CustomCollections from '../components/CustomCollections';
import FeaturedProjects from '../components/FeaturedProjects';
import ProcessSection from '../components/ProcessSection';

export default function HomePage({ onOpenConsultation, onNavigate }) {
  return (
    <div className="home-page">
      <Hero />
      <NarrativeSlider onLearnMore={() => onNavigate('about')} />
      <WhatWeDo />
      <CustomCollections
        onOpenConsultation={onOpenConsultation}
        onShopClick={() => onNavigate('shop')}
      />
      <FeaturedProjects
        onViewAll={() => onNavigate('portfolio')}
        onProjectClick={(proj) => onNavigate('project-detail', proj)}
      />
      <ProcessSection onOpenConsultation={onOpenConsultation} />
    </div>
  );
}
