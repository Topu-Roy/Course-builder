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
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
                <Zap className="mr-2 h-4 w-4" />
                <span>AI-Powered Learning Revolution</span>
              </div>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:leading-[1.1]">
                Create Masterclasses <br />
                <span className="from-primary bg-linear-to-r to-purple-600 bg-clip-text text-transparent">
                  in Seconds
                </span>
              </h1>
              <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg sm:text-xl lg:mx-0">
                Transform any topic into a comprehensive course with the power of Google Gemini. Step-by-step
                curriculum, curated YouTube videos, and interactive content—automated for you.
              </p>
              <div className="flex flex-col flex-wrap justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/create">
                  <Button size="lg" className="h-14 px-8 text-base shadow-lg transition-all hover:scale-105">
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
              <div className="mt-10 flex items-center justify-center gap-4 lg:justify-start">
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
            <div className="relative w-full max-w-2xl flex-1 lg:max-w-none">
              <div className="bg-background relative z-10 overflow-hidden rounded-3xl border shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src={HeroImage}
                  alt="AI Course Builder Illustration"
                  className="w-full object-cover"
                  priority
                />
              </div>
              <div className="bg-primary/20 absolute -right-10 -bottom-10 -z-10 h-72 w-72 animate-pulse rounded-full blur-3xl" />
              <div className="absolute -top-10 -left-10 -z-10 h-72 w-72 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20 lg:py-32 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to learn anything
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
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
                className="group bg-background relative rounded-2xl border p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="group-hover:bg-primary/5 mb-6 inline-flex rounded-2xl bg-slate-50 p-4 transition-colors dark:bg-slate-900">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How it works</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Three simple steps to go from curiosity to mastery.
            </p>
          </div>

          <div className="flex flex-col gap-12 lg:flex-row lg:gap-8">
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
              <div key={idx} className="relative flex-1 px-4 text-center">
                <div className="mb-8 text-7xl font-black text-slate-100 dark:text-slate-800/50">{step.step}</div>
                <h3 className="mb-4 text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground mx-auto max-w-xs leading-relaxed">{step.description}</p>
                {idx < 2 && (
                  <div className="absolute top-1/2 right-0 hidden translate-x-1/2 -translate-y-1/2 transform text-slate-200 lg:block">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-center shadow-2xl sm:px-16 sm:py-28">
            <div className="relative z-10">
              <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
                Ready to build your knowledge?
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-lg opacity-90 sm:text-xl">
                Join thousands of students who are using AI to learn faster and more efficiently than ever before.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/create">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-10 text-lg font-bold shadow-xl transition-all hover:scale-105"
                  >
                    Get Started for Free
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-slate-50 py-16 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                  CB
                </div>
                <span className="text-2xl font-bold tracking-tight">Course Builder</span>
              </div>
              <p className="text-muted-foreground text-sm whitespace-nowrap">
                ©2026 Course Builder AI. All rights reserved.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm font-medium sm:flex sm:gap-12">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Platform</span>
                <Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors">
                  Explore
                </Link>
                <Link href="/create" className="text-muted-foreground hover:text-primary transition-colors">
                  Create
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Legal</span>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
