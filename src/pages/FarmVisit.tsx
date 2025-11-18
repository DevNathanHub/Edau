import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FarmVisitBooking from "@/components/FarmVisitBooking";
import { Helmet } from "react-helmet-async";

const FarmVisit = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Book Farm Visit - Edau Farm | Experience West Pokot Sustainable Farming</title>
        <meta name="description" content="Book a guided farm visit to Edau Farm in West Pokot. Experience Acacia honey production, meet our livestock, and learn about sustainable farming practices." />
        <meta name="keywords" content="farm visit, West Pokot tour, sustainable farming experience, Acacia honey farm, farm tour booking, agricultural tourism" />
        <meta property="og:title" content="Book Farm Visit - Edau Farm" />
        <meta property="og:description" content="Experience sustainable farming in West Pokot. Book your guided farm visit today." />
        <meta property="og:url" content="https://edau.loopnet.tech/farm-visit" />
        <link rel="canonical" href="https://edau.loopnet.tech/farm-visit" />
      </Helmet>
      <Navigation />
      <main className="flex-1">
        <FarmVisitBooking />
      </main>
      <Footer />
    </div>
  );
};

export default FarmVisit;