import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import FeaturesBanner from '@/components/FeaturesBanner';

// Lazy load components that are below the fold
const AboutSection = dynamic(() => import('@/components/AboutSection'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const BestSellingProducts = dynamic(() => import('@/components/BestSellingProducts'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const FeaturedBeekeeper = dynamic(() => import('@/components/FeaturedBeekeeper'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const CustomerTestimonials = dynamic(() => import('@/components/CustomerTestimonials'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const NewsletterSignup = dynamic(() => import('@/components/NewsletterSignup'), {
  loading: () => <div className="h-32 bg-gray-50 animate-pulse" />,
});
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
});

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
