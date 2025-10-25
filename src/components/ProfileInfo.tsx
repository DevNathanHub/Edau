
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
          className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isLoading ? "Saving..." : (isEditing ? "Save Changes" : "Edit Profile")}
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={userData.firstName}
              onChange={(e) => setUserData({...userData, firstName: e.target.value})}
              disabled={!isEditing || isLoading}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name</Label>
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
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={userData.email}
            disabled={true} // Email can't be changed through this form
            className="mt-1 bg-gray-50"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={userData.phone}
            onChange={(e) => setUserData({...userData, phone: e.target.value})}
            disabled={!isEditing || isLoading}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={userData.address}
            onChange={(e) => setUserData({...userData, address: e.target.value})}
            disabled={!isEditing || isLoading}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
