
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";
import { Helmet } from "react-helmet-async";

const GalleryPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Farm Gallery - Edau Farm | Life at Our West Pokot Sustainable Farm</title>
        <meta name="description" content="Explore our farm gallery showcasing sustainable farming in West Pokot. View images of Acacia honey production, livestock, orchards, and our commitment to eco-friendly agriculture." />
        <meta name="keywords" content="farm gallery, West Pokot farm, sustainable farming photos, Acacia honey production, farm life, eco-friendly agriculture" />
        <meta property="og:title" content="Farm Gallery - Edau Farm" />
        <meta property="og:description" content="Visual journey through our sustainable farm in West Pokot, showcasing Acacia honey and eco-friendly practices." />
        <meta property="og:url" content="https://edau.loopnet.tech/gallery" />
        <link rel="canonical" href="https://edau.loopnet.tech/gallery" />
      </Helmet>
      <Navigation />
      <main className="flex-1 py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Farm Gallery</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Discover the beauty of Edau Farm through our curated collection of images.
              From lush landscapes and thriving crops to our happy animals and sustainable farming practices,
              explore what makes our farm special.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sustainable Farming
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Natural Products
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Family Heritage
              </span>
            </div>
          </div>
          
          <Gallery />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GalleryPage;
