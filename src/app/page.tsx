import Navbar from "@/components/landing-page/Navbar";
import Hero from "@/components/landing-page/Hero";
import TrendingEvents from "@/components/landing-page/TrendingEvents";
import LocationDiscovery from "@/components/landing-page/LocationDiscovery";
import ShareJourney from "@/components/landing-page/ShareJourney";
import OrganizerSection from "@/components/landing-page/OrganizerSection";
import Footer from "@/components/landing-page/Footer";
import ScrollToTop from "@/components/landing-page/ScrollToTop";

export default async function Home() {

    return (
    <main className="min-h-screen bg-(--background-color) overflow-x-hidden font-inter">
      <ScrollToTop />
      <Navbar />
      <Hero />
      <TrendingEvents />
      <LocationDiscovery />
      <ShareJourney />
      <OrganizerSection />
      <Footer />
    </main>
  );
}