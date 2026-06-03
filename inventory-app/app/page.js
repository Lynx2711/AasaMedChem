export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Aasa MedChem Inventory App
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center my-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-zinc-900">
          Inventory App
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 max-w-2xl">
          Initial setup is complete, the database is connected, and role-based access control routes have been successfully implemented.
        </p>
      </div>
    </main>
  );
}
