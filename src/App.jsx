import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ServicesPage from './pages/ServicesPage';
import ShopPage from './pages/ShopPage';
import ShopDetailPage from './pages/ShopDetailPage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';
import ConsultationModal from './components/ConsultationModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Check if URL pathname starts with /admin
    if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin') return 'admin';
    if (hash === 'portfolio' || hash === 'projects') return 'portfolio';
    if (hash === 'project-detail') return 'project-detail';
    if (hash === 'services' || hash === 'what-we-do') return 'services';
    if (hash === 'shop') return 'shop';
    if (hash === 'shop-details') return 'shop-details';
    if (hash === 'about') return 'about';
    return 'home';
  });

  const [activeSection, setActiveSection] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState(null);
  const [selectedProject, setSelectedProject] = useState(() => {
    try {
      const saved = sessionStorage.getItem('iora_selected_project') || localStorage.getItem('iora_selected_project');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedProduct, setSelectedProduct] = useState(() => {
    try {
      const saved = sessionStorage.getItem('iora_selected_product') || localStorage.getItem('iora_selected_product');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync URL routing (both pathname /admin and hash changes)
  useEffect(() => {
    const handleUrlChange = () => {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin')) {
        setCurrentPage('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') {
        setCurrentPage('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'portfolio' || hash === 'projects') {
        setCurrentPage('portfolio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'project-detail') {
        setCurrentPage('project-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'services' || hash === 'what-we-do') {
        setCurrentPage('services');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'shop') {
        setCurrentPage('shop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'shop-details') {
        setCurrentPage('shop-details');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'about') {
        setCurrentPage('about');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === 'home' || hash === '') {
        setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Handle navigation
  const handleNavigate = (pageOrSection, extraData = null) => {
    if (extraData) {
      if (pageOrSection === 'shop-details') {
        setSelectedProduct(extraData);
        try {
          sessionStorage.setItem('iora_selected_product', JSON.stringify(extraData));
          localStorage.setItem('iora_selected_product', JSON.stringify(extraData));
        } catch {
          // ignore
        }
      } else {
        setSelectedProject(extraData);
        try {
          sessionStorage.setItem('iora_selected_project', JSON.stringify(extraData));
          localStorage.setItem('iora_selected_project', JSON.stringify(extraData));
        } catch {
          // ignore
        }
      }
    }

    if (pageOrSection === 'admin') {
      setCurrentPage('admin');
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If navigating away from /admin, reset URL pathname
    if (window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }

    if (pageOrSection === 'portfolio' || pageOrSection === 'projects') {
      setCurrentPage('portfolio');
      window.location.hash = 'portfolio';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'project-detail') {
      setCurrentPage('project-detail');
      window.location.hash = 'project-detail';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'services' || pageOrSection === 'what-we-do') {
      setCurrentPage('services');
      window.location.hash = 'services';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'shop') {
      setCurrentPage('shop');
      window.location.hash = 'shop';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'shop-details') {
      setCurrentPage('shop-details');
      window.location.hash = 'shop-details';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'about') {
      setCurrentPage('about');
      window.location.hash = 'about';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pageOrSection === 'home') {
      setCurrentPage('home');
      window.location.hash = 'home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // In-page section on home
      if (currentPage !== 'home') {
        setCurrentPage('home');
        window.location.hash = pageOrSection;
        setTimeout(() => {
          const el = document.getElementById(pageOrSection);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        const el = document.getElementById(pageOrSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenConsultation = (prefill = null) => {
    setModalPrefill(prefill);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalPrefill(null);
  };

  // Scroll spy on Home page
  useEffect(() => {
    if (currentPage !== 'home') return;

    const sections = ['home', 'portfolio'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  if (currentPage === 'admin') {
    return (
      <div className="app-container admin-screen-active">
        <AdminPage onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Universal Sticky Header / Navbar */}
      <Navbar
        currentPage={currentPage}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Main Page View */}
      <main>
        {currentPage === 'project-detail' ? (
          <ProjectDetailPage
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
            selectedProject={selectedProject}
          />
        ) : currentPage === 'portfolio' ? (
          <PortfolioPage
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
          />
        ) : currentPage === 'services' ? (
          <ServicesPage
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
          />
        ) : currentPage === 'shop' ? (
          <ShopPage
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
          />
        ) : currentPage === 'shop-details' ? (
          <ShopDetailPage
            onNavigate={handleNavigate}
            onOpenConsultation={handleOpenConsultation}
            selectedProduct={selectedProduct}
          />
        ) : currentPage === 'about' ? (
          <AboutPage onOpenConsultation={() => handleOpenConsultation()} />
        ) : (
          <HomePage
            onOpenConsultation={handleOpenConsultation}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Quote / Consultation Modal */}
      <ConsultationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        prefillData={modalPrefill}
      />
    </div>
  );
}
