import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUpdateUserProfile } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ChevronRight, AlertCircle, Watch, Mic, PenLine, SkipForward } from 'lucide-react';

export default function OnboardingQuiz() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { mutateAsync: updateProfile, isPending: loading } = useUpdateUserProfile();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        age_group: '',
        gender: '',
        occupation: '',
        wearable_connected: false
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleSkip = async () => {
        // Save empty data to ensure user record exists (so they aren't prompted again if we use 404 check)
        try {
            await updateProfile({});
        } catch (e) {
            console.error("Failed to init skipped profile", e);
        }
        navigate('/app/dashboard');
    };

    const handleSubmit = async (journalMode?: 'text' | 'voice') => {
        try {
            // Save profile data
            await updateProfile(formData);

            // Redirect based on choice
            if (journalMode === 'text') {
                navigate('/app/journal?mode=text');
            } else if (journalMode === 'voice') {
                navigate('/app/journal?mode=voice');
            } else {
                navigate('/app/dashboard');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            // Even if error, might want to proceed or show toast
            // For now, let's just proceed
            navigate('/app/dashboard');
        }
    };

    const steps = [
        // Step 1: Name
        {
            id: 1,
            title: "What represents you?",
            description: "Let's start with your name or a nickname.",
            content: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            ),
            isValid: () => formData.name.length > 0
        },
        // Step 2: Age Group
        {
            id: 2,
            title: "Age Group",
            description: "This helps us tailor your experience.",
            content: (
                <div className="space-y-4">
                    <RadioGroup
                        value={formData.age_group}
                        onValueChange={(val) => {
                            updateField('age_group', val);
                            // Auto advance for better UX
                            setTimeout(handleNext, 300);
                        }}
                    >
                        {['18-24', '25-34', '35-44', '45-54', '55+'].map((age) => (
                            <div key={age} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => updateField('age_group', age)}>
                                <RadioGroupItem value={age} id={age} />
                                <Label htmlFor={age} className="flex-1 cursor-pointer">{age}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ),
            isValid: () => !!formData.age_group
        },
        // Step 3: Gender
        {
            id: 3,
            title: "Gender Identity",
            description: "Optional, for better personalization.",
            content: (
                <div className="space-y-4">
                    <RadioGroup
                        value={formData.gender}
                        onValueChange={(val) => {
                            updateField('gender', val);
                            setTimeout(handleNext, 300);
                        }}
                    >
                        {['Female', 'Male', 'Prefer not to say'].map((gen) => (
                            <div key={gen} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors" onClick={() => updateField('gender', gen)}>
                                <RadioGroupItem value={gen} id={gen} />
                                <Label htmlFor={gen} className="flex-1 cursor-pointer">{gen}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ),
            isValid: () => !!formData.gender
        },
        // Step 4: Occupation
        {
            id: 4,
            title: "What do you do?",
            description: "Work can be a big source of stress or joy.",
            content: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                            id="occupation"
                            placeholder="e.g. Designer, Teacher, Student..."
                            value={formData.occupation}
                            onChange={(e) => updateField('occupation', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            autoFocus
                        />
                    </div>
                </div>
            ),
            isValid: () => formData.occupation.length > 0
        },
        // Step 5: Wearable
        {
            id: 5,
            title: "Connect Wearable",
            description: "Sync your health data for better insights.",
            content: (
                <div className="space-y-4">
                    <div
                        className={`border-2 p-6 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-4 text-center ${formData.wearable_connected ? 'border-primary bg-primary/5' : 'border-dashed hover:border-gray-400'}`}
                        onClick={() => updateField('wearable_connected', !formData.wearable_connected)}
                    >
                        <div className={`p-4 rounded-full ${formData.wearable_connected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Watch size={32} />
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">Apple Health / Fitbit</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {formData.wearable_connected ? "Connected!" : "Tap to connect"}
                            </p>
                        </div>
                        {formData.wearable_connected && <CheckCircle2 className="text-primary w-6 h-6" />}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        We only read steps and sleep data.
                    </p>
                </div>
            ),
            isValid: () => true // Optional step
        },
        // Step 6: Journal Choice
        {
            id: 6,
            title: "You're all set!",
            description: "How would you like to start your journey?",
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md group" onClick={() => handleSubmit('text')}>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full gap-4">
                            <div className="p-4 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <PenLine size={32} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Write a Journal</h3>
                                <p className="text-sm text-muted-foreground mt-2">Reflect on your day with text.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-md group" onClick={() => handleSubmit('voice')}>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full gap-4">
                            <div className="p-4 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <Mic size={32} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Voice Journal</h3>
                                <p className="text-sm text-muted-foreground mt-2">Speak your mind freely.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ),
            isValid: () => true
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg shadow-xl relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <CardHeader className="text-center pt-8 pb-2">
                    <CardTitle className="text-2xl font-bold">{currentStep.title}</CardTitle>
                    <CardDescription className="text-base">{currentStep.description}</CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="min-h-[200px] flex flex-col justify-center"
                        >
                            {currentStep.content}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="flex justify-between items-center p-6 bg-gray-50/50">
                    {/* Skip Button (Bottom Left or Right as requested - user said bottom right, but putting it left for back/skip balance is common, but I will put it right if it's the only secondary action, or align differently) */}
                    {/* Actually user said "bottom right of the window let user to skip this process". */}
                    {/* Standard flow: Back (Left) -- Next (Right). Skip usually Top Right or Bottom Center. */}
                    {/* Users requests "small option on the bottom right ... to skip". */}

                    <div className="flex gap-2 w-full justify-between items-center">
                        {step > 1 && step < 6 ? (
                            <Button variant="ghost" onClick={() => setStep(prev => prev - 1)}>
                                Back
                            </Button>
                        ) : (
                            <div /> /* Spacer */
                        )}

                        <div className="flex items-center gap-2">
                            {step < 6 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSkip}
                                        className="text-muted-foreground hover:text-foreground mr-2"
                                    >
                                        Skip
                                    </Button>
                                    <Button onClick={handleNext} disabled={!currentStep.isValid()}>
                                        Next <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </>
                            )}
                            {/* Step 6 has its own actions in content */}
                        </div>
                    </div>
                </CardFooter>
            </Card>

            {/* Global Skip Button as requested "bottom right of the window" */}
            {/* If the Card is centered, "window" might mean screen. I'll stick to the card footer for mobile friendliness, but can add a fixed one if needed. Card footer is safer. */}
        </div>
    );
}
