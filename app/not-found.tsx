// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-8">
      {/* Background Gradient Shapes */}
      <div
        className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-purple-200/60 to-emerald-200/60 blur-[100px] -z-0"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-gradient-to-r from-purple-200/60 to-pink-200/60 blur-[100px] -z-0"
        aria-hidden="true"
      />

      <div className="z-10 text-center">
        {/* Gradient 404 Heading */}
        <h1 className="text-[10rem] font-extrabold leading-none tracking-tighter filter drop-shadow-sm sm:text-[12rem]">
          <span className="bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-800 sm:text-4xl">
          Page Not Found.
        </h2>
        
        <p className="mt-4 text-base text-gray-600">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        <Link
          href="/"
          className="mt-10 inline-block rounded-md bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
}