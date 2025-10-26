
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Save, X } from "lucide-react";

const ProfileInfo = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      if (!user?._id) return;

      // Get user profile data from backend
  const result = await apiService.getUser(user._id);
  const payload: any = result.data;
      const u = payload?.data || payload;
      if (u) {
        setUserData({
          firstName: u.first_name || "",
          lastName: u.last_name || "",
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!user?._id) return;

      const result = await apiService.updateUser(user._id, {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        address: userData.address,
      });

      if (result.error) {
        throw new Error(result.error);
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully",
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={user?.avatar}
                  alt={`${user?.first_name} ${user?.last_name}`}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.first_name || '') + ' ' + (user?.last_name || ''))}&background=10b981&color=fff&size=128`;
                  }}
                />
                <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-green-600 hover:bg-green-700"
                title="Change avatar"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-gray-600 mb-4 flex items-center justify-center md:justify-start">
                <Mail className="w-4 h-4 mr-2" />
                {userData.email}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <User className="w-3 h-3 mr-1" />
                  Premium Member
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Calendar className="w-3 h-3 mr-1" />
                  Since 2024
                </Badge>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  <MapPin className="w-3 h-3 mr-1" />
                  West Pokot
                </Badge>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isLoading}
                className={`px-6 py-3 ${isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isLoading ? (
                  "Saving..."
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="mt-2 w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                  disabled={!isEditing || isLoading}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                  disabled={!isEditing || isLoading}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                disabled={true}
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                disabled={!isEditing || isLoading}
                className="mt-1"
                placeholder="+254 XXX XXX XXX"
              />
            </div>
            
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Delivery Address</Label>
              <Input
                id="address"
                value={userData.address}
                onChange={(e) => setUserData({...userData, address: e.target.value})}
                disabled={!isEditing || isLoading}
                className="mt-1"
                placeholder="Your delivery address in West Pokot"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">12</div>
              <div className="text-sm text-purple-700">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">KSh 2,450</div>
              <div className="text-sm text-purple-700">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">4.9</div>
              <div className="text-sm text-purple-700">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">8</div>
              <div className="text-sm text-purple-700">Reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInfo;
