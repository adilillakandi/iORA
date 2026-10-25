import React from 'react';
import { homeData } from '../data/homeData';
import CtaBanner from './CtaBanner';

export default function ProcessSection({ onOpenConsultation }) {
  const { processSteps } = homeData;

  return (
    <section className="process-section" aria-label="Our 5-Step Process">
      {processSteps.map((step, index) => {
        const formattedTitle = step.title.charAt(0).toUpperCase() + step.title.slice(1).toLowerCase();

        return (
          <div
            key={step.number}
            className="process-step-block"
            data-step={step.number}
            style={{
              '--step-idx': index,
              '--step-z': index + 1,
            }}
          >
            <div className="process-step-inner">
              {/* Row 1: Title on left, Description on right */}
              <div className="process-step-row-top">
                <div className="process-step-title-wrap">
                  <h3 className="process-step-title">
                    <span className="process-title-cap">{formattedTitle.charAt(0)}</span>
                    <span>{formattedTitle.slice(1)}</span>
                  </h3>
                </div>
                <div className="process-step-desc-wrap">
                  <p className="process-step-desc">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Row 2: Giant Number on left, Image on right */}
              <div className="process-step-row-bottom">
                <div className="process-huge-number" aria-hidden="true">
                  {step.number}
                </div>
                <div className="process-step-image">
                  <img
                    src={step.image}
                    alt={`${formattedTitle} showcase`}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <CtaBanner onOpenConsultation={onOpenConsultation} isStacked={true} />
    </section>
  );
}
