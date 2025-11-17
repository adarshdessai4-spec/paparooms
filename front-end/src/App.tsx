import React from "react";

const quickDestinations = [
  {
    label: "Near me",
    type: "icon",
  },
  {
    label: "Bangalore",
    img: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Chennai",
    img: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Delhi",
    img: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=300&q=80",
  },
  {
    label: "Gurgaon",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=300&q=80",
  },
];

const bottomTabs = [
  { label: "Home", icon: "home", active: true },
  { label: "Search", icon: "search" },
  { label: "Bookings", icon: "calendar" },
  { label: "Offers", icon: "gift" },
  { label: "Account", icon: "user" },
];

const Icon: React.FC<{ name: string; className?: string }> = ({
  name,
  className = "",
}) => {
  const paths: Record<string, string> = {
    home: "M3 10.5 12 3l9 7.5v8.5a1 1 0 0 1-1 1h-5.5V14h-5v6H4a1 1 0 0 1-1-1z",
    search:
      "M20.5 20.5 16 16m2-5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z",
    calendar:
      "M6 5V3m12 2V3M5 8h14M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
    gift: "M3 9h18v12H3zM3 9h18l-2.5-3.5H5.5zm9 0v12m-3-12V5.4a2.4 2.4 0 0 1 4.8 0V9",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.333 0-6 1.5-6 4v2h12v-2c0-2.5-2.667-4-6-4Z",
    translate:
      "M4 5h16M5 5s0 7 7 7m0 0a4 4 0 0 0 4 4m1 4-2.5-6M4 19l4.5-11",
    phone: "M6.5 4A2.5 2.5 0 0 0 4 6.5c0 7.456 6.044 13.5 13.5 13.5A2.5 2.5 0 0 0 20 17.5v-1.308a1 1 0 0 0-.671-.942l-3.244-1.148a1 1 0 0 0-1.05.272L13.4 16.01a9.5 9.5 0 0 1-4.41-4.41l1.636-1.635a1 1 0 0 0 .272-1.05L9.75 5.671A1 1 0 0 0 8.808 5H7.5Z",
    arrow: "M4 12h12m0 0-3-3m3 3-3 3",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-100 font-sans">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
        <main className="pb-20">
          <header className="flex items-center justify-between px-5 pt-6 pb-3">
            <div />
            <div className="text-2xl font-extrabold tracking-[0.6em]">
              OYO
            </div>
            <div className="flex items-center gap-5">
              <button
                aria-label="Change language"
                className="text-gray-800"
              >
                <Icon name="translate" className="h-5 w-5" />
              </button>
              <button
                aria-label="Call support"
                className="text-gray-800"
              >
                <Icon name="phone" className="h-5 w-5" />
              </button>
            </div>
          </header>

          <section className="px-5">
            <h1 className="mb-4 text-2xl font-semibold">
              Find hotels at best prices
            </h1>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Destination
                </p>
                <p className="pt-0.5 text-base font-medium text-gray-600">
                  Search for city, location or hotel
                </p>
              </div>

              <div className="flex border-b border-gray-200">
                <div className="w-1/2 border-r border-gray-200 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Date
                  </p>
                  <p className="pt-0.5 text-base font-medium text-gray-900">
                    17 Nov – 18 Nov
                  </p>
                </div>
                <div className="w-1/2 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Rooms and guests
                  </p>
                  <p className="pt-0.5 text-base font-medium text-gray-900">
                    1 room · 1 guest
                  </p>
                </div>
              </div>
            </div>

            <button className="mt-4 w-full rounded-2xl bg-[#FF385C] py-3 text-base font-semibold text-white shadow-[0_8px_24px_rgba(255,56,92,0.35)]">
              Search
            </button>
          </section>

          <section className="mt-7 px-5">
            <h2 className="mb-4 text-lg font-semibold">
              Explore your next destination
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {quickDestinations.map((destination) => (
                <button
                  key={destination.label}
                  className="flex min-w-[72px] flex-col items-center gap-2 rounded-2xl bg-white"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    {destination.type === "icon" ? (
                      <div className="flex h-full w-full items-center justify-center text-sky-500">
                        <Icon name="arrow" className="h-7 w-7" />
                      </div>
                    ) : (
                      <img
                        src={destination.img}
                        alt={destination.label}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {destination.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 px-5">
            <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
              <div className="relative h-48 w-full">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                  alt="Offer banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  <p className="text-2xl font-semibold leading-tight">
                    Book 1, get 1 free!
                  </p>
                  <p className="text-sm font-medium">
                    Book for 2 nights, pay for 1
                  </p>
                  <div className="flex justify-end">
                    <button className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-sky-700 shadow-md">
                      <Icon name="phone" className="h-4 w-4" />
                      Call to book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white/95">
          <div className="flex items-center justify-between px-6 py-2 text-[11px]">
            {bottomTabs.map((tab) => (
              <button
                key={tab.label}
                className={`flex flex-col items-center gap-1 ${
                  tab.active ? "text-[#FF385C]" : "text-gray-500"
                }`}
              >
                <Icon name={tab.icon} className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;
