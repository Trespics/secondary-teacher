import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Shield, 
  Save, 
  BookOpen,    
  Award,
  Calendar,
  Lock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const TeacherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialization: "",
    experience_years: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/teacher/profile");
      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.teacher_details?.bio || "",
        specialization: data.teacher_details?.specialization || "",
        experience_years: data.teacher_details?.experience_years?.toString() || "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/teacher/profile", {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        specialization: form.specialization,
        experience_years: form.experience_years ? parseInt(form.experience_years) : null,
      });
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {    
    return (
      <PortalLayout type="teacher">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout type="teacher">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="teacher-container p-6 max-w-6xl mx-auto"
      >
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information, security settings, and professional bio.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - ID Card & Image */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-sm border-none bg-gradient-to-b from-indigo-500 to-indigo-700 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl" />
                    <CardContent className="p-8 pb-10 flex flex-col items-center text-center relative z-10">
                        <div className="relative mb-6">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-indigo-100">
                                <AvatarFallback className="text-indigo-700 font-bold text-4xl">
                                    {profile?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 p-2 bg-white text-indigo-600 rounded-full shadow-md hover:bg-slate-50 transition-colors border">
                                <Camera size={18} fill="currentColor" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{profile?.name}</h2>
                        <p className="text-indigo-200 font-medium mb-4 flex items-center justify-center gap-2">
                            <Shield size={16} /> Staff ID: {profile?.id?.substring(0,8) || "T-8942"}
                        </p>
                        <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1">Senior Teacher</Badge>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-none">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <BookOpen size={16} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Specialization</p>
                                <p className="font-medium text-slate-800">{profile?.teacher_details?.specialization || "General Educator"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <Calendar size={16} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Joined</p>
                                <p className="font-medium text-slate-800">{new Date(profile?.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm border-none bg-card">
                    <form onSubmit={handleUpdate}>
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                                <User size={20} className="text-indigo-600"/> Personal Information
                            </CardTitle>
                            <CardDescription>Update your contact details and biography.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input id="name" className="pl-10 h-11 bg-slate-50 border-slate-200" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address (Read-only)</Label>
                                    <div className="relative opacity-60">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <Input id="email" readOnly className="pl-10 h-11 bg-slate-100 border-transparent cursor-not-allowed" value={form.email} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <Input id="phone" className="pl-10 h-11 bg-slate-50 border-slate-200" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="specialization" className="text-sm font-bold text-slate-700">Specialization</Label>
                                    <Input id="specialization" className="h-11 bg-slate-50 border-slate-200" value={form.specialization} onChange={(e) => setForm({...form, specialization: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experience" className="text-sm font-bold text-slate-700">Experience (Years)</Label>
                                    <Input id="experience" type="number" className="h-11 bg-slate-50 border-slate-200" value={form.experience_years} onChange={(e) => setForm({...form, experience_years: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-sm font-bold text-slate-700">Professional Biography</Label>
                                <Textarea id="bio" placeholder="Write a short intro..." className="min-h-[120px] bg-slate-50 border-slate-200" value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} />
                                <p className="text-xs text-slate-500">This will be visible on your public directory profile.</p>
                            </div>
                        </CardContent>
                        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 rounded-b-xl">
                            <Button type="button" variant="outline" className="h-11 px-6">Cancel</Button>
                            <Button type="submit" disabled={saving} className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 gap-2 font-semibold shadow-sm text-white">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Card>
                
                <Card className="shadow-sm border border-red-100">
                    <CardHeader className="bg-red-50/50 border-b border-red-100">
                        <CardTitle className="text-red-800 text-lg flex items-center gap-2"><Shield size={18}/> Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Current Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwordForm.currentPassword} 
                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">New Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwordForm.newPassword} 
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Confirm New Password</Label>
                                    <Input 
                                        type="password" 
                                        value={passwordForm.confirmPassword} 
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 shrink-0 h-11 px-6" disabled={changingPassword}>
                                    {changingPassword ? <Loader2 size={16} className="animate-spin mr-2" /> : <Lock size={16} className="mr-2" />}
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default TeacherProfile;
