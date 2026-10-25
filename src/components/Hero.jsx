import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { homeData } from '../data/homeData';

const subtitleVariants = {
  initial: {
    y: -12,
  },
  animate: {
    y: [-12, 0, 0],
    transition: {
      y: { duration: 2, times: [0, 0.6337, 1], ease: ["easeInOut", "linear"], repeat: Infinity },
    },
  },
};

const headlineVariants = {
  initial: {
    scaleX: 0.96,
    scaleY: 0.96,
  },
  animate: {
    scaleX: [0.96, 0.96, 1, 1],
    scaleY: [0.96, 0.96, 1, 1],
    transition: {
      scaleX: { duration: 2, times: [0, 0.0316, 0.6337, 1], ease: ["linear", "easeOut", "linear"], repeat: Infinity },
      scaleY: { duration: 2, times: [0, 0.0316, 0.6337, 1], ease: ["linear", "easeOut", "linear"], repeat: Infinity },
    },
  },
};

export default function Hero() {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start('animate');
  }, [controls]);

  return (
    <section
      id="home"
      className="hero-section"
      aria-label="iORA Hero Introduction"
    >
      {/* Background Video */}
      <video
        className="hero-bg-video"
        autoPlay
        loop
        muted
        playsInline
        poster={homeData.hero.bgImage}
      >
        <source src={homeData.hero.video} type="video/mp4" />
      </video>

      <div className="hero-overlay">
        <motion.div
          className="hero-content"
          initial="initial"
          animate={controls}
        >
          {/* Subtitle Bar: Horizontal Rule + Metadata Row */}
          <motion.div
            className="hero-meta-block"
            variants={subtitleVariants}
          >
            <div className="hero-meta-divider" />
            
            <div className="hero-meta-row">
              <div className="hero-meta-left">
                Experiential<br />Interior Design
              </div>
              <div className="hero-meta-right">
                {homeData.hero.subtitleRight}
              </div>
            </div>
          </motion.div>

          {/* Headline with ABC Arizona Flare & Motion Animation */}
          <motion.div
            style={{ transformOrigin: 'center', width: 'fit-content' }}
            variants={headlineVariants}
          >
            <h1 className="hero-headline">
              <span className="hero-headline-line">Elevate Your Space with</span>
              <span className="hero-headline-line">Timeless Elegance.</span>
            </h1>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
