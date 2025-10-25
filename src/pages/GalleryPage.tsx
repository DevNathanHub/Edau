
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";

const GalleryPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Our Farm Gallery</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore stunning images of our farm, products, and the beautiful environment we work in.
            </p>
          </div>
          
          <Gallery />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GalleryPage;
