"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, User, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react"

interface Tutorial {
    id: string
    title: string
    description: string
    duration: string
    level: "Beginner" | "Intermediate" | "Advanced"
    thumbnail: string
    videoUrl: string
    topics: string[]
}

const tutorials: Tutorial[] = [
    {
        id: "getting-started",
        title: "Getting Started with Freakend CLI",
        description:
            "Learn how to install and set up Freakend CLI, create your first project, and generate your first backend module.",
        duration: "8:45",
        level: "Beginner",
        thumbnail: "/placeholder.svg?height=200&width=350",
        videoUrl: "https://example.com/video1.mp4",
        topics: ["Installation", "Setup", "First Project", "Basic Commands"],
    },
    {
        id: "authentication",
        title: "Building Authentication Systems",
        description:
            "Deep dive into creating secure authentication with JWT tokens, password hashing, and user management.",
        duration: "15:30",
        level: "Intermediate",
        thumbnail: "/placeholder.svg?height=200&width=350",
        videoUrl: "https://example.com/video2.mp4",
        topics: ["JWT", "Password Security", "User Management", "Session Handling"],
    },
    {
        id: "crud-operations",
        title: "CRUD Operations Made Easy",
        description: "Master creating, reading, updating, and deleting data with Freakend's powerful CRUD generators.",
        duration: "12:20",
        level: "Beginner",
        thumbnail: "/placeholder.svg?height=200&width=350",
        videoUrl: "https://example.com/video3.mp4",
        topics: ["Database Operations", "API Endpoints", "Data Validation", "Error Handling"],
    },
    {
        id: "payment-integration",
        title: "Payment Processing Integration",
        description: "Integrate Stripe, PayPal, and other payment gateways seamlessly with Freakend's payment modules.",
        duration: "18:15",
        level: "Advanced",
        thumbnail: "/placeholder.svg?height=200&width=350",
        videoUrl: "https://example.com/video4.mp4",
        topics: ["Stripe Integration", "PayPal Setup", "Webhooks", "Security"],
    },
    {
        id: "file-upload",
        title: "File Upload and Management",
        description: "Handle file uploads, image processing, and cloud storage integration with AWS S3 and Cloudinary.",
        duration: "14:10",
        level: "Intermediate",
        thumbnail: "/placeholder.svg?height=200&width=350",
        videoUrl: "https://example.com/video5.mp4",
        topics: ["File Handling", "Image Processing", "Cloud Storage", "Security"],
    },
    {
        id: "email-services",
        title: "Email Services and Notifications",
        description: "Set up email templates, SMTP configuration, and automated email notifications for your applications.",
        duration: "11:45",
        level: "Intermediate",
        thumbnail: "/placeholder.svg?height=200&width=350",
        videoUrl: "https://example.com/video6.mp4",
        topics: ["Email Templates", "SMTP", "Notifications", "Automation"],
    },
]

export default function TutorialsPage() {
    const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [filter, setFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All")

    const filteredTutorials = filter === "All" ? tutorials : tutorials.filter((tutorial) => tutorial.level === filter)

    const openVideo = (tutorial: Tutorial) => {
        setSelectedTutorial(tutorial)
    }

    const closeVideo = () => {
        setSelectedTutorial(null)
        setIsFullscreen(false)
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Beginner":
                return "bg-green-600/20 text-green-400 border-green-600/30"
            case "Intermediate":
                return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
            case "Advanced":
                return "bg-red-600/20 text-red-400 border-red-600/30"
            default:
                return "bg-slate-600/20 text-slate-400 border-slate-600/30"
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 border-purple-600/30 mb-4">
                    Video Tutorials
                </Badge>
                <h1 className="text-4xl font-bold text-white dark:text-white light:text-slate-900 mb-4">Learn Freakend CLI</h1>
                <p className="text-xl text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-3xl">
                    Master Freakend CLI with our comprehensive video tutorials. From basic setup to advanced integrations, learn
                    everything you need to build production-ready backends.
                </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
                {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
                    <Button
                        key={level}
                        variant={filter === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(level as any)}
                        className={filter === level ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                        {level}
                    </Button>
                ))}
            </div>

            {/* Tutorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredTutorials.map((tutorial) => (
                    <Card
                        key={tutorial.id}
                        className="bg-slate-900 dark:bg-slate-900 light:bg-white border-slate-700 dark:border-slate-700 light:border-slate-200 hover:border-blue-500 transition-colors cursor-pointer group"
                        onClick={() => openVideo(tutorial)}
                    >
                        <div className="relative">
                            <img
                                src={tutorial.thumbnail || "/placeholder.svg"}
                                alt={tutorial.title}
                                className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg">
                                <Play className="h-12 w-12 text-white" />
                            </div>
                            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tutorial.duration}
                            </div>
                            <Badge variant="secondary" className={`absolute top-2 left-2 text-xs ${getLevelColor(tutorial.level)}`}>
                                {tutorial.level}
                            </Badge>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white dark:text-white light:text-slate-900 text-lg line-clamp-2">
                                {tutorial.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm mb-3 line-clamp-3">
                                {tutorial.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {tutorial.topics.slice(0, 3).map((topic) => (
                                    <Badge key={topic} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        {topic}
                                    </Badge>
                                ))}
                                {tutorial.topics.length > 3 && (
                                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                        +{tutorial.topics.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Video Modal */}
            {selectedTutorial && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div
                        className={`bg-slate-950 rounded-lg border border-slate-700 flex flex-col ${isFullscreen ? "w-full h-full" : "w-full max-w-4xl h-auto max-h-[90vh]"
                            }`}
                    >
                        {/* Video Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <Badge className={getLevelColor(selectedTutorial.level)}>{selectedTutorial.level}</Badge>
                                <h3 className="text-white font-semibold">{selectedTutorial.title}</h3>
                                <div className="flex items-center gap-1 text-slate-400 text-sm">
                                    <Clock className="h-4 w-4" />
                                    {selectedTutorial.duration}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0 hover:bg-slate-700">
                                    {isMuted ? (
                                        <VolumeX className="h-4 w-4 text-slate-400" />
                                    ) : (
                                        <Volume2 className="h-4 w-4 text-slate-400" />
                                    )}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0 hover:bg-slate-700">
                                    {isFullscreen ? (
                                        <Minimize2 className="h-4 w-4 text-slate-400" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4 text-slate-400" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeVideo}
                                    className="h-8 w-8 p-0 hover:bg-slate-700 text-slate-400"
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>

                        {/* Video Content */}
                        <div className="flex-1 flex flex-col lg:flex-row">
                            {/* Video Player */}
                            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                                <div className="text-center text-white">
                                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg mb-2">Video Player</p>
                                    <p className="text-sm text-slate-400">
                                        Video would be embedded here
                                        <br />
                                        (YouTube, Vimeo, or custom player)
                                    </p>
                                </div>
                            </div>

                            {/* Video Info Sidebar */}
                            {!isFullscreen && (
                                <div className="w-full lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-slate-700">
                                    <h4 className="text-white font-semibold mb-2">About this tutorial</h4>
                                    <p className="text-slate-300 text-sm mb-4">{selectedTutorial.description}</p>

                                    <h5 className="text-white font-medium mb-2">Topics covered:</h5>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {selectedTutorial.topics.map((topic) => (
                                            <Badge key={topic} variant="outline" className="text-xs border-slate-600 text-slate-400">
                                                {topic}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <User className="h-4 w-4" />
                                        <span>Instructor: Freakend Team</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
                <CardHeader>
                    <CardTitle className="text-white dark:text-white light:text-slate-900">Ready to start building?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-300 dark:text-slate-300 light:text-slate-600 mb-4">
                        Install Freakend CLI and start generating production-ready backend code in minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                            <a href="/docs/getting-started">Get Started</a>
                        </Button>
                        <Button variant="outline" className="border-slate-600" asChild>
                            <a href="/docs/cli-reference">View CLI Reference</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
