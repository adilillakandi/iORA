import React, { useRef, useEffect, useState, useCallback } from 'react';
import { homeData } from '../data/homeData';

const REPEAT_SETS = 4;
const SCROLL_SPEED = 40; // Pixels per second for smooth, luxurious glide

export default function NarrativeSlider({ onLearnMore }) {
  const galleryRef = useRef(null);
  const { narrative } = homeData;

  const [isDragging, setIsDragging] = useState(false);
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const scrollPosRef = useRef(0);
  const lastTimeRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  // Pause auto-scroll temporarily (e.g. after user clicks buttons or finishes drag)
  const pauseTemporarily = useCallback((durationMs = 2500) => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      if (galleryRef.current) {
        scrollPosRef.current = galleryRef.current.scrollLeft;
      }
      lastTimeRef.current = performance.now();
    }, durationMs);
  }, []);

  // Set up seamless infinite marquee auto-scroll
  useEffect(() => {
    const track = galleryRef.current;
    if (!track) return;

    // Check for user prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize scroll position to Set 1 (so user can scroll backward or forward immediately)
    const initScroll = () => {
      const singleSetWidth = track.scrollWidth / REPEAT_SETS;
      if (singleSetWidth > 0 && track.scrollLeft === 0) {
        track.scrollLeft = singleSetWidth;
        scrollPosRef.current = singleSetWidth;
      }
    };

    initScroll();

    const handleLoop = (currentTime) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }
      let delta = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Cap delta if tab was inactive to avoid large leaps
      if (delta > 0.1) delta = 0.016;

      const singleSetWidth = track.scrollWidth / REPEAT_SETS;

      // Only advance when not hovered, not dragged, and not actively interacting
      if (
        !isHoveredRef.current &&
        !isDraggingRef.current &&
        !isInteractingRef.current &&
        singleSetWidth > 0
      ) {
        if (scrollPosRef.current === 0 && track.scrollLeft !== 0) {
          scrollPosRef.current = track.scrollLeft;
        }

        scrollPosRef.current += SCROLL_SPEED * delta;

        // When reaching end of Set 2, seamlessly wrap back by singleSetWidth to Set 1
        if (scrollPosRef.current >= singleSetWidth * 2) {
          scrollPosRef.current -= singleSetWidth;
        } else if (scrollPosRef.current < singleSetWidth) {
          scrollPosRef.current += singleSetWidth;
        }

        track.scrollLeft = scrollPosRef.current;
      }

      animFrameIdRef.current = requestAnimationFrame(handleLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(handleLoop);

    // Sync position on native scroll (e.g. trackpad swipe)
    const onScroll = () => {
      if (isDraggingRef.current || isHoveredRef.current || isInteractingRef.current) {
        scrollPosRef.current = track.scrollLeft;
        const singleSetWidth = track.scrollWidth / REPEAT_SETS;
        if (singleSetWidth > 0) {
          if (track.scrollLeft >= singleSetWidth * 2.8) {
            track.scrollLeft -= singleSetWidth;
            scrollPosRef.current = track.scrollLeft;
          } else if (track.scrollLeft <= singleSetWidth * 0.2) {
            track.scrollLeft += singleSetWidth;
            scrollPosRef.current = track.scrollLeft;
          }
        }
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        lastTimeRef.current = performance.now();
        if (track) {
          scrollPosRef.current = track.scrollLeft;
        }
      }
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      track.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pauseTemporarily]);

  // Button navigation with boundary wrapping
  const scrollGallery = (direction) => {
    const track = galleryRef.current;
    if (!track) return;

    pauseTemporarily(2800);

    const singleSetWidth = track.scrollWidth / REPEAT_SETS;
    const scrollAmount = direction === 'left' ? -450 : 450;

    if (singleSetWidth > 0) {
      if (direction === 'left' && track.scrollLeft <= singleSetWidth) {
        track.scrollLeft += singleSetWidth;
        scrollPosRef.current = track.scrollLeft;
      } else if (direction === 'right' && track.scrollLeft >= singleSetWidth * 2) {
        track.scrollLeft -= singleSetWidth;
        scrollPosRef.current = track.scrollLeft;
      }
    }

    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Mouse hover pause handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (galleryRef.current) {
      scrollPosRef.current = galleryRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (galleryRef.current) {
      scrollPosRef.current = galleryRef.current.scrollLeft;
    }
    lastTimeRef.current = performance.now();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      pauseTemporarily(2000);
    }
  };

  // Grab & drag interactions for mouse
  const handleMouseDown = (e) => {
    if (!galleryRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - galleryRef.current.offsetLeft;
    scrollStartRef.current = galleryRef.current.scrollLeft;
    pauseTemporarily(2500);

    const handleWindowMouseMove = (moveEvent) => {
      if (!isDraggingRef.current || !galleryRef.current) return;
      moveEvent.preventDefault();
      const x = moveEvent.pageX - galleryRef.current.offsetLeft;
      const walk = (x - startXRef.current) * 1.2;
      galleryRef.current.scrollLeft = scrollStartRef.current - walk;
      scrollPosRef.current = galleryRef.current.scrollLeft;
    };

    const handleWindowMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        pauseTemporarily(2000);
      }
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  // Touch handlers for mobile
  const handleTouchStart = () => {
    isDraggingRef.current = true;
    pauseTemporarily(2500);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (galleryRef.current) {
      scrollPosRef.current = galleryRef.current.scrollLeft;
    }
    pauseTemporarily(2000);
  };

  return (
    <section id="about" className="narrative-section" aria-label="About iORA">
      <div className="section-container">
        <div className="narrative-grid">
          <div>
            <div className="narrative-lead-tag">
              SPECIALISTS IN RESIDENTIAL AND BESPOKE<br className="narrative-desktop-br" />INTERIOR SOLUTIONS
            </div>
            <h2 className="narrative-heading">
              <span className="narrative-heading-line">We design enduring spaces defined</span>
              <span className="narrative-heading-line">by clarity, craftsmanship, and quiet</span>
              <span className="narrative-heading-line">sophistication.</span>
            </h2>
            <button
              className="narrative-btn"
              onClick={onLearnMore}
              id="narrative-learn-more-btn"
            >
              <span>{narrative.buttonText}</span>
              <img src={narrative.buttonArrow} alt="" aria-hidden="true" />
            </button>
          </div>

          <div>
            <p className="narrative-paragraph">
              {narrative.paragraph}
            </p>
          </div>
        </div>

        {/* Carousel Header Controls */}
        <div className="narrative-slider-header">
          <button
            className="slider-nav-btn"
            onClick={() => scrollGallery('left')}
            aria-label="Previous slide"
            id="narrative-prev-slide"
          >
            <img src={narrative.prevIcon} alt="Previous" />
          </button>
          <button
            className="slider-nav-btn"
            onClick={() => scrollGallery('right')}
            aria-label="Next slide"
            id="narrative-next-slide"
          >
            <img src={narrative.nextIcon} alt="Next" />
          </button>
        </div>
      </div>

      {/* Carousel Horizontal Scroll Track - Full Bleed */}
      <div
        className={`narrative-gallery-track ${isDragging ? 'is-dragging' : ''}`}
        ref={galleryRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: REPEAT_SETS }).flatMap((_, setIdx) =>
          narrative.slides.map((slide) => (
            <div
              key={`${slide.id}-set-${setIdx}`}
              className="narrative-gallery-card"
              style={{ width: `${slide.width}px`, height: `${slide.height}px` }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                width={slide.width}
                height={slide.height}
                loading={setIdx <= 1 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
