
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for chicks
const chicksData = [
  {
    id: 1,
    title: "Rhode Island Red Chicks",
    price: 12.99,
    description: "Healthy 3-month old Rhode Island Red chicks. Great egg layers with friendly temperament.",
    image: "/placeholder.svg",
    emoji: "🐔"
  },
  {
    id: 2,
    title: "Leghorn Chicks",
    price: 10.99,
    description: "Prolific white egg layers, these 3-month old Leghorn chicks are ready for your backyard flock.",
    image: "/placeholder.svg",
    emoji: "🐔"
  },
  {
    id: 3,
    title: "Plymouth Rock Chicks",
    price: 11.99,
    description: "Beautiful barred pattern 3-month old Plymouth Rock chicks. Dual purpose for eggs and meat.",
    image: "/placeholder.svg",
    emoji: "🐔"
  },
  {
    id: 4,
    title: "Orpington Chicks",
    price: 14.99,
    description: "Fluffy and friendly 3-month old Buff Orpington chicks. Excellent mothers and good egg layers.",
    image: "/placeholder.svg",
    emoji: "🐔"
  }
];

const ChicksForSale = () => {
  const handleAddToCart = (chickId: number) => {
    toast({
      title: "Added to cart",
      description: "Chick added to your shopping cart",
    });
  };

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">3-Month-Old Chicks For Sale</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chicksData.map((chick) => (
          <Card key={chick.id} className="overflow-hidden">
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">{chick.emoji}</div>
                <p className="text-sm text-gray-600 font-medium">{chick.title}</p>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{chick.title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-600 mb-2">{chick.description}</p>
              <p className="text-lg font-semibold text-green-700">${chick.price.toFixed(2)} each</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleAddToCart(chick.id)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChicksForSale;
