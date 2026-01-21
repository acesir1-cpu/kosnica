import Hero from '@/components/Hero';
import FeaturesBanner from '@/components/FeaturesBanner';
import AboutSection from '@/components/AboutSection';
import BestSellingProducts from '@/components/BestSellingProducts';
import FeaturedBeekeeper from '@/components/FeaturedBeekeeper';
import CustomerTestimonials from '@/components/CustomerTestimonials';
import NewsletterSignup from '@/components/NewsletterSignup';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturesBanner />
      <AboutSection />
      <BestSellingProducts />
      <FeaturedBeekeeper />
      <CustomerTestimonials />
      <NewsletterSignup />
      <Footer />
      {/* Additional sections will be added here */}
    </>
  );
}
