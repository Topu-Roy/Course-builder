import HeroImage from "@/assets/hero-illustration.png";
import { ArrowRight, BookOpen, Layout, Rocket, Shield, Video, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-background relative overflow-hidden py-20 lg:py-32">
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
                <Zap className="mr-2 h-4 w-4" />
                <span>AI-Powered Learning Revolution</span>
              </div>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
                Create Masterclasses <br />
                <span className="from-primary bg-linear-to-r to-purple-600 bg-clip-text text-transparent">
                  in Seconds
                </span>
              </h1>
              <p className="text-muted-foreground mb-8 max-w-2xl text-lg sm:text-xl">
                Transform any topic into a comprehensive course with the power of Google Gemini. Step-by-step
                curriculum, curated YouTube videos, and interactive content—automated for you.
              </p>
              <div className="flex flex-col flex-wrap justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/create">
                  <Button size="lg" className="h-14 px-8 text-base shadow-lg">
                    Start Creating Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base shadow-sm">
                    Browse Courses
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="border-background inline-block h-10 w-10 rounded-full border-2 bg-slate-200"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm font-medium">Joined by 1,000+ modern learners</p>
              </div>
            </div>
            <div className="relative flex-1">
              <div className="bg-background relative z-10 overflow-hidden rounded-2xl border shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src={HeroImage}
                  alt="AI Course Builder Illustration"
                  className="w-full object-cover"
                  priority
                />
              </div>
              <div className="bg-primary/20 absolute -right-6 -bottom-6 -z-10 h-64 w-64 rounded-full blur-3xl" />
              <div className="absolute -top-6 -left-6 -z-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-24 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Everything you need to learn anything</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Our platform combines cutting-edge AI with reliable educational resources to give you the best
              learning experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Layout className="h-8 w-8 text-blue-500" />,
                title: "Structured Curriculums",
                description:
                  "Gemini AI analyzes your topic and breaks it down into logical, easy-to-follow chapters and lessons.",
              },
              {
                icon: <Video className="h-8 w-8 text-red-500" />,
                title: "Curated Video Content",
                description:
                  "Automatic YouTube integration finds the most relevant and high-quality videos for every specific lesson.",
              },
              {
                icon: <Zap className="h-8 w-8 text-yellow-500" />,
                title: "Instant Generation",
                description:
                  "From a single prompt to a full 10-chapter course in under 30 seconds. No more manual searching.",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-green-500" />,
                title: "Interactive Reading",
                description:
                  "AI-generated text content provides context and deep dives into the topics discussed in videos.",
              },
              {
                icon: <Shield className="h-8 w-8 text-purple-500" />,
                title: "Progress Tracking",
                description:
                  "Save courses to your library and track your progress through every chapter and block.",
              },
              {
                icon: <Rocket className="h-8 w-8 text-orange-500" />,
                title: "Expert Categories",
                description:
                  "From Technology to Business, Science to Health—build expertise in any category imaginable.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-background rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md"
              >
                <div className="group-hover:bg-primary/5 mb-4 inline-flex rounded-xl bg-slate-50 p-3 transition-colors dark:bg-slate-900">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Three simple steps to go from curiosity to mastery.
            </p>
          </div>

          <div className="flex flex-col gap-12 lg:flex-row">
            {[
              {
                step: "01",
                title: "Enter your Topic",
                description:
                  "Type in any topic you're interested in. Be as specific as you like, from 'Quantum Physics' to 'Vegan Sourdough Baking'.",
              },
              {
                step: "02",
                title: "AI Crafts the Course",
                description:
                  "Our AI engine designs a comprehensive curriculum and hunts for the best educational videos on YouTube.",
              },
              {
                step: "03",
                title: "Start Learning",
                description:
                  "Enroll in your new course and start learning immediately with a structured, interactive syllabus.",
              },
            ].map((step, idx) => (
              <div key={idx} className="relative flex-1 text-center">
                <div className="mb-6 text-6xl font-black text-slate-200 dark:text-slate-800">{step.step}</div>
                <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground mx-auto max-w-xs">{step.description}</p>
                {idx < 2 && (
                  <div className="absolute top-1/2 right-0 hidden translate-x-1/2 -translate-y-1/2 transform text-slate-300 lg:block">
                    <ArrowRight className="h-10 w-10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground overflow-hidden rounded-3xl px-8 py-16 text-center shadow-2xl sm:px-16 sm:py-24">
            <h2 className="mb-6 text-3xl font-bold sm:text-5xl">Ready to build your knowledge?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg opacity-90 sm:text-xl">
              Join thousands of students who are using AI to learn faster and more efficiently than ever before.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/create">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-slate-50 py-12 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-8 w-8 rounded" />
              <span className="text-xl font-bold">Course Builder</span>
            </div>
            <p className="text-muted-foreground text-sm">©2026 Course Builder AI. All rights reserved.</p>
            <div className="text-muted-foreground flex gap-6 text-sm font-medium">
              <Link href="/explore" className="hover:text-primary transition-colors">
                Explore
              </Link>
              <Link href="/create" className="hover:text-primary transition-colors">
                Create
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
