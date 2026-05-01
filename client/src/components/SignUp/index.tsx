import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ParticlesBackground } from "@/components/particles-background";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ChevronDown, Check, BookOpen, Building } from "lucide-react";
import institutions from "@/lib/colleges";
import branches from "@/lib/branches";


interface FormData {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    registrationNumber: string;
    branch: string;
    collegeName: string;
    isAffiliate: boolean;
}

export default function RegisterPage() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        registrationNumber: "",
        branch: "",
        collegeName: "",
        isAffiliate: false,
    });

    const [otp, setOtp] = useState<string>(""); // State for OTP input
    const [isOtpSent, setIsOtpSent] = useState<boolean>(false); // Track if OTP is sent
    const [error, setError] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
    
    // States for dropdowns
    const [collegePopoverOpen, setCollegePopoverOpen] = useState(false);
    const [branchPopoverOpen, setBranchPopoverOpen] = useState(false);
    const [collegeSearchValue, setCollegeSearchValue] = useState("");
    const [branchSearchValue, setBranchSearchValue] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check for OAuth error messages in URL params
    useEffect(() => {
        const errorParam = searchParams.get('error');
        const messageParam = searchParams.get('message');
        
        if (errorParam === 'no_account' && messageParam) {
            toast.error(messageParam);
            setError(messageParam);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [searchParams]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle affiliate checkbox change
    const handleAffiliateChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isAffiliate: checked }));
    };

    // Handle OTP input changes
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const usernameRegex = /^[a-z][a-z0-9_]*$/;
        setError("");

        if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.registrationNumber || !formData.branch || !formData.collegeName) {
            toast.error("All fields are required");
            setError("All fields are required");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setError("Passwords do not match");
            return;
        }

        if (!usernameRegex.test(formData.username)) {
            toast.error("Username must start with letters and contain only lowercase letters, numbers, and underscores");
            setError("Username must start with letters and contain only lowercase letters, numbers, and underscores");
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
                name: formData.name.trim(),
                username: formData.username.trim().toLowerCase(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                registrationNumber: formData.registrationNumber.trim(),
                branch: formData.branch.trim(),
                collegeName: formData.collegeName.trim(),
                isAffiliate: formData.isAffiliate,
            }, { headers: { "Content-Type": "application/json" } });

            toast.success(response.data.message);
            setIsOtpSent(true); // Show OTP input form
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.response) {
                toast.error(err.response.data.message || "Something went wromg, Please try again.");
                setError(err.response.data.message || "Something went wrong. Please try again.");
            } else if (err.request) {
                toast.error("No response from server. Check if backend is running");
                setError("No response from server. Check if backend is running.");
            } else {
                toast.error("Network error: " + err.message);
                setError("Network error: " + err.message);
            }
        }
    };

    // Handle OTP verification
    const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify`, {
                email: formData.email.trim().toLowerCase(),
                otp,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            toast.success(response.data.message);
            navigate("/login");
        } catch (err: any) {
            console.error("OTP verification error:", err);
            if (err.response) {
                toast.error(err.response.data.error);
                setError(err.response.data.error || "Invalid OTP. Please try again.");
            } else {
                toast.error("Network error: " + err.message);
                setError("Network error: " + err.message);
            }
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-6">
            <ParticlesBackground />
            <Card className="w-full max-w-2xl mx-4 shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        {isOtpSent ? "Verify Your Email" : "Create an account"}
                    </CardTitle>
                    <CardDescription>
                        {isOtpSent ? "Enter the OTP sent to your email" : "Enter your information to get started with CodeQuest"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isOtpSent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Personal Information */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Your name *</Label>
                                    <Input name="name" id="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username *</Label>
                                    <Input name="username" id="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input name="email" id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="registrationNumber">Registration Number *</Label>
                                    <Input name="registrationNumber" id="registrationNumber" placeholder="Enter your registration number" value={formData.registrationNumber} onChange={handleChange} required />
                                </div>

                                {/* Academic Information */}
                                <div className="space-y-2">
                                    <Label htmlFor="branch" className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Branch *
                                    </Label>
                                    <Popover open={branchPopoverOpen} onOpenChange={(open) => {
                                        setBranchPopoverOpen(open);
                                        if (!open) setBranchSearchValue("");
                                    }}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={branchPopoverOpen}
                                                className="w-full justify-between h-10"
                                            >
                                                {formData.branch ? formData.branch : "Select branch..."}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                                            <Command shouldFilter={false}>
                                                <CommandInput 
                                                    placeholder="Search branch..." 
                                                    className="h-9" 
                                                    value={branchSearchValue}
                                                    onValueChange={setBranchSearchValue}
                                                />
                                                <CommandList className="max-h-[150px] overflow-y-auto">
                                                    <CommandEmpty>No branch found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {branches
                                                            .filter((branch) => 
                                                                branch.toLowerCase().includes(branchSearchValue.toLowerCase())
                                                            )
                                                            .map((branch) => (
                                                                <CommandItem
                                                                    key={branch}
                                                                    value={branch}
                                                                    onSelect={() => {
                                                                        setFormData((prev) => ({ ...prev, branch: branch }));
                                                                        setBranchPopoverOpen(false);
                                                                        setBranchSearchValue("");
                                                                    }}
                                                                    className="flex items-center"
                                                                >
                                                                    {branch}
                                                                    {formData.branch === branch && (
                                                                        <Check className="ml-auto h-4 w-4" />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="collegeName" className="flex items-center gap-2">
                                        <Building className="w-4 h-4" /> College *
                                    </Label>
                                    <Popover open={collegePopoverOpen} onOpenChange={(open) => {
                                        setCollegePopoverOpen(open);
                                        if (!open) setCollegeSearchValue("");
                                    }}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={collegePopoverOpen}
                                                className="w-full justify-between h-10"
                                            >
                                                {formData.collegeName ? formData.collegeName : "Select college..."}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                                            <Command shouldFilter={false}>
                                                <CommandInput 
                                                    placeholder="Search college..." 
                                                    className="h-9" 
                                                    value={collegeSearchValue}
                                                    onValueChange={setCollegeSearchValue}
                                                />
                                                <CommandList className="max-h-[150px] overflow-y-auto">
                                                    <CommandEmpty>No college found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {institutions
                                                            .filter((college) => 
                                                                college.toLowerCase().includes(collegeSearchValue.toLowerCase())
                                                            )
                                                            .map((college) => (
                                                                <CommandItem
                                                                    key={college}
                                                                    value={college}
                                                                    onSelect={() => {
                                                                        setFormData((prev) => ({ ...prev, collegeName: college }));
                                                                        setCollegePopoverOpen(false);
                                                                        setCollegeSearchValue("");
                                                                    }}
                                                                    className="flex items-center"
                                                                >
                                                                    {college}
                                                                    {formData.collegeName === college && (
                                                                        <Check className="ml-auto h-4 w-4" />
                                                                    )}
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Password Fields */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <div className="relative">
                                        <Input name="password" id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={formData.password} onChange={handleChange} required />
                                        <Button type="button" variant="ghost" size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                                            onClick={togglePasswordVisibility}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                    <div className="relative">
                                        <Input name="confirmPassword" id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />
                                        <Button type="button" variant="ghost" size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                                            onClick={toggleConfirmPasswordVisibility}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Affiliate Checkbox */}
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="isAffiliate" 
                                    checked={formData.isAffiliate} 
                                    onCheckedChange={handleAffiliateChange} 
                                />
                                <Label
                                    htmlFor="isAffiliate"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Are you an Affiliate of SRKR CODING CLUB?
                                </Label>
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <Button type="submit" className="w-full h-11">Create Account</Button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP sent to {formData?.email}</Label>
                                <Input name="otp" id="otp" placeholder="6-digit OTP" value={otp} onChange={handleOtpChange} required />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button type="submit" className="w-full">Verify Email</Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
