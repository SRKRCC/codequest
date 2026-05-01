import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Edit, Trash2, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '@/context/AdminContext';

interface Solution {
    explanation: string;
    cpp: string;
    java: string;
    python: string;
    timeComplexity: string;
    spaceComplexity: string;
}

interface Challenge {
    _id: string;
    title: string;
    description: string;
    category: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    problemLink: string;
    platform: string;
    createdAt: string;
    solvedUsers: string[];
}

const ChallengeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [solution, setSolution] = useState<Solution | null>(null);
    const [loading, setLoading] = useState(true);
    const { deleteChallenge } = useAdminStore();

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/admin/challenges/${id}`,
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setChallenge(response.data.challenge);
                    setSolution(response.data.solution);
                }
            } catch (error) {
                console.error('Error fetching challenge:', error);
                toast.error('Failed to load challenge details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchChallenge();
        }
    }, [id]);

    const handleDelete = async () => {
        if (!challenge) return;

        if (window.confirm(`Are you sure you want to delete "${challenge.title}"?`)) {
            const success = await deleteChallenge(challenge._id);
            if (success) {
                toast.success('Challenge deleted successfully');
                navigate('/codingclubadmin/challenges');
            } else {
                toast.error('Failed to delete challenge');
            }
        }
    };

    const handleEdit = () => {
        navigate('/codingclubadmin/addchallenge', {
            state: { challenge, isEdit: true }
        });
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return 'bg-emerald-900/50 text-emerald-500 border-emerald-500/60';
            case 'medium':
                return 'bg-amber-900/50 text-amber-500 border-amber-500/60';
            case 'hard':
                return 'bg-rose-900/50 text-rose-500 border-rose-500/60';
            default:
                return 'bg-gray-500/30 text-gray-500 border-gray-500/60';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-700">Challenge not found</h2>
                <Button onClick={() => navigate('/codingclubadmin/challenges')} className="mt-4">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Challenges
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => navigate('/codingclubadmin/challenges')}
                    className="text-primary"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Challenges
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEdit} className="text-amber-500">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="outline" onClick={handleDelete} className="text-rose-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Challenge Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{challenge.title}</span>
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                                {challenge.difficulty}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-600 dark:text-gray-300">{challenge.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {challenge.category.map((cat, index) => (
                                            <Badge key={index} variant="secondary">
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Problem Info</h3>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">Platform:</span> {challenge.platform}
                                        </p>
                                        <p>
                                            <span className="font-medium">Points:</span> {challenge.points}
                                        </p>
                                        <p>
                                            <span className="font-medium">Created:</span>{' '}
                                            {new Date(challenge.createdAt).toLocaleDateString()}
                                        </p>
                                        <a
                                            href={challenge.problemLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline inline-flex items-center"
                                        >
                                            Problem Link <Check className="ml-2 h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Solution Card */}
                {solution && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Zap className="mr-2 h-5 w-5 text-primary" />
                                Solution Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{solution.explanation}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Complexity</h3>
                                        <div className="space-y-2">
                                            <p>
                                                <span className="font-medium">Time:</span> {solution.timeComplexity}
                                            </p>
                                            <p>
                                                <span className="font-medium">Space:</span> {solution.spaceComplexity}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Solutions</h3>

                                    {/* C++ Solution */}
                                    <div>
                                        <h4 className="font-medium mb-2">C++ Solution</h4>
                                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                            <pre className="text-sm">{solution.cpp}</pre>
                                        </ScrollArea>
                                    </div>

                                    {/* Java Solution */}
                                    <div>
                                        <h4 className="font-medium mb-2">Java Solution</h4>
                                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                            <pre className="text-sm">{solution.java}</pre>
                                        </ScrollArea>
                                    </div>

                                    {/* Python Solution */}
                                    <div>
                                        <h4 className="font-medium mb-2">Python Solution</h4>
                                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                            <pre className="text-sm">{solution.python}</pre>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ChallengeDetails;