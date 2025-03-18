import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the DataGridDemo component
// This is necessary because MUI X Data Grid uses browser APIs
const DataGridDemo = dynamic(() => import('../components/DataGridDemo'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MUI X Grid Demo with Tailwind CSS
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DataGridDemo />
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-900 shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Demo application showcasing MUI X Data Grid v7 with inline editing and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
