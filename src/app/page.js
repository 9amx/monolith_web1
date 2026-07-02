import ScrollProgress from '@/components/ScrollProgress';
import FloatingElements from '@/components/FloatingElements';
import MenuOverlay from '@/components/MenuOverlay';
import HeroSection from '@/components/HeroSection';
import ShowreelSection from '@/components/ShowreelSection';
import StatsSection from '@/components/StatsSection';
import AboutSection from '@/components/AboutSection';
import ComparisonSection from '@/components/ComparisonSection';
import WorksSection from '@/components/WorksSection';
import ApproachSection from '@/components/ApproachSection';
import ServicesSection from '@/components/ServicesSection';
import ReviewsSection from '@/components/ReviewsSection';
import FaqSection from '@/components/FaqSection';
import PaymentSection from '@/components/PaymentSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <FloatingElements />
      <MenuOverlay />
      <HeroSection />
      <WorksSection />
      <StatsSection />
      <AboutSection />
      <ComparisonSection />
      <ReviewsSection />
      <ApproachSection />
      <ServicesSection />
      <FaqSection />
      <PaymentSection />
      <ContactSection />
      <Footer />
    </>
  );
}
