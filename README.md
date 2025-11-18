# UMKMotion - Astro + React + TypeScript + Tailwind CSS

A modern web application built with Astro, React, TypeScript, and Tailwind CSS.

## 🚀 Features

* **Astro** - Modern static site generator with excellent performance
* **React** - Interactive UI components with full hydration support
* **TypeScript** - Type-safe development with excellent IDE support
* **Tailwind CSS** - Utility-first CSS framework for rapid styling

## 📦 Installation

To get started:

```bash
npm install
```

### 🧩 Setup Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then adjust the values inside `.env` based on your project requirements.

## 🛠️ Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Button.tsx      # Reusable button component
│   └── Card.tsx        # Card layout component
├── pages/              # Astro pages
│   ├── index.astro     # Home page
│   └── demo.astro      # React components demo
├── styles/
│   └── global.css      # Global styles with Tailwind
└── ...
```

## 🎨 Components

### Button Component

A fully typed React button component with variants and sizes:

* Variants: `primary`, `secondary`
* Sizes: `sm`, `md`, `lg`
* Full TypeScript support

### Card Component

A flexible card layout component for content organization.

## 🔧 Available Scripts

* `npm run dev` - Start development server
* `npm run build` - Build for production
* `npm run preview` - Preview production build
* `npm run astro` - Run Astro CLI commands

## 🌐 Pages

* `/` - Home page with project overview
* `/demo` - Interactive React components demonstration

## 🎯 Next Steps

1. Add more React components as needed
2. Implement routing with Astro's file-based routing
3. Add state management if required
4. Deploy to your preferred hosting platform

## 📚 Learn More

* Astro Documentation
* React Documentation
* TypeScript Documentation
* Tailwind CSS Documentation
