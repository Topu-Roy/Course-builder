# AI Course Builder

An intelligent platform for creating and managing educational courses with AI assistance.

## Features

### 🤖 AI-Powered Creation

- **Automated Outlines**: Generate comprehensive course structures from a simple prompt.
- **Smart Content Generation**: AI creates initial chapter content including text and code examples.
- **Video Enrichment**: Intelligent agents automatically find and embed relevant YouTube videos for course sections.

### 📝 Block-Based Editor

- **Flexible Content**: Build chapters using modular blocks (Heading, Text, Code, Image, Video).
- **Drag & Drop**: Easily reorganize content with a drag-and-drop interface (powered by `@dnd-kit`).
- **Rich Media Support**: Embed images and videos directly into your lessons.

### 📚 Course Management

- **Category Filtering**: Organize and find courses by category (Technology, Business, Art, etc.).
- **Progress Tracking**: Mark chapters as completed and track your learning journey.
- **Fluid Navigation**: Intuitive sidebar navigation and course overview.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & shadcn/ui
- **AI**: [Google Gemini](https://deepmind.google/technologies/gemini/) via Vercel AI SDK
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

## Getting Started

1.  **Clone the repository**

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file with the following keys:

    ```env
    DATABASE_URL="your-postgresql-url"
    GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
    ```

4.  **Run Database Migrations**

    ```bash
    npx prisma db push
    ```

5.  **Run the Development Server**

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `src/server/actions`: Server Actions for AI generation, course mutations, and database interactions.
- `src/components`: Reusable UI components including the `ChapterContentEditor`.
- `src/app`: App Router pages and layouts.
- `prisma/schema.prisma`: Database schema definition.
