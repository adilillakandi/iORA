import React from 'react';
import { aboutData } from '../data/aboutData';
import CtaBanner from '../components/CtaBanner';

export default function AboutPage({ onOpenConsultation }) {
  const { hero, ourStory, visionMission, factory, workingProcess } = aboutData;

  return (
    <div className="about-page">
      {/* 1. About Hero */}
      <section
        className="hero-section about-hero"
        style={{ backgroundImage: `url(${hero.bgImage})`, minHeight: '902px' }}
        aria-label="About iORA Hero"
      >
        <div className="hero-overlay" style={{ paddingBottom: 'clamp(60px, 14vw, 283px)' }}>
          <div className="hero-content">
            <h1 className="hero-headline" style={{ whiteSpace: 'pre-line' }}>
              {hero.headline}
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="about-story-section" aria-label="Our Story">
        <div className="section-container">
          <div className="story-intro-row">
            <div className="story-label">{ourStory.sectionLabel}</div>
            <h2 className="story-statement" style={{ whiteSpace: 'pre-line' }}>
              {ourStory.statement}
            </h2>
          </div>

          <div className="story-detail-grid">
            <div className="story-image-wrap">
              <img
                src={ourStory.image}
                alt="Crafted living space study by iORA"
                loading="lazy"
              />
            </div>

            <div className="story-narrative-wrap">
              <h3 className="story-subheading" style={{ whiteSpace: 'pre-line' }}>
                {ourStory.heading}
              </h3>
              {ourStory.paragraphs.map((p, idx) => (
                <p key={idx} className="story-paragraph">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vision and Mission Section */}
      <section className="about-vision-section" aria-label="Vision and Mission">
        <div className="section-container">
          <h2 className="vision-main-heading" style={{ whiteSpace: 'pre-line' }}>
            {visionMission.heading}
          </h2>

          <div className="vision-mission-grid">
            {/* Vision */}
            <div className="purpose-card">
              <div className="purpose-label">{visionMission.vision.label}</div>
              <h3 className="purpose-title" style={{ whiteSpace: 'pre-line' }}>
                {visionMission.vision.title}
              </h3>
              <p className="purpose-desc">{visionMission.vision.description}</p>
            </div>

            {/* Mission */}
            <div className="purpose-card">
              <div className="purpose-label">{visionMission.mission.label}</div>
              <h3 className="purpose-title" style={{ whiteSpace: 'pre-line' }}>
                {visionMission.mission.title}
              </h3>
              <p className="purpose-desc">{visionMission.mission.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Own Factory Section */}
      <section className="about-factory-section" aria-label="Our Own Factory">
        <div className="section-container">
          <div className="factory-intro-grid">
            <div className="factory-heading-block">
              <div className="factory-label">{factory.sectionLabel}</div>
              <h2 className="factory-main-heading" style={{ whiteSpace: 'pre-line' }}>
                {factory.heading}
              </h2>
            </div>
            <div className="factory-story-block">
              <p className="factory-story-text">{factory.story}</p>
            </div>
          </div>

          {/* Panoramic Workshop Photo */}
          <div className="factory-banner-wrap">
            <img
              src={factory.bannerImage}
              alt="iORA internal manufacturing workshop and craft unit"
              loading="lazy"
            />
          </div>

          {/* 3 Factory Principles */}
          <div className="factory-principles-grid">
            {factory.principles.map((principle) => (
              <div key={principle.id} className="factory-principle-card">
                <h3 className="principle-title">{principle.title}</h3>
                <p className="principle-desc">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Our Working Process Section */}
      <section className="about-process-section" aria-label="Our Working Process">
        <div className="section-container">
          <div className="process-intro-grid">
            <div className="process-heading-block">
              <div className="process-label">{workingProcess.sectionLabel}</div>
              <h2 className="process-main-heading" style={{ whiteSpace: 'pre-line' }}>
                {workingProcess.heading}
              </h2>
            </div>
            <div className="process-intro-text-block">
              <p className="process-intro-text">{workingProcess.intro}</p>
            </div>
          </div>

          {/* 6 Steps Grid (2 rows x 3 columns) */}
          <div className="process-steps-6-grid">
            {workingProcess.steps.map((step) => (
              <div key={step.number} className="step-6-card">
                <div className="step-6-number">{step.number}</div>
                <h3 className="step-6-title">{step.title}</h3>
                <p className="step-6-desc">{step.description}</p>
                <div className="step-6-outcome">{step.outcome}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <CtaBanner onOpenConsultation={onOpenConsultation} />
    </div>
  );
}
