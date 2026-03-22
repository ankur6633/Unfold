"use client";

export default function AboutSection() {
  return (
    <section id="about" className="bg-zinc-50 py-24 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Why Choose Unfold?
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              We are committed to providing the highest quality laundry service in the city. 
              Our team of experts treats every garment with extreme care.
            </p>

            <dl className="mt-10 space-y-8">
              <div className="relative">
                <dt>
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                  </div>
                  <p className="ml-16 text-lg font-medium leading-6 text-zinc-900 dark:text-white">Expert Handling</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-zinc-500 dark:text-zinc-400">
                  Your clothes are treated using specific cleaning methods based on fabric type.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                  </div>
                  <p className="ml-16 text-lg font-medium leading-6 text-zinc-900 dark:text-white">Fast Turnaround</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-zinc-500 dark:text-zinc-400">
                  Get your fresh laundry back within 24-48 hours with our express service.
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
             <img
              src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=1000"
              alt="Laundry Service"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
