import { Keyword } from "./interactive";
import { ActivityGraph } from "./activity-graph";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-medium tracking-tight text-[var(--text)]">
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-xl space-y-12 px-6 py-12 md:space-y-14 md:py-16">
      <section>
        <img
          src="/favicon.ico"
          alt=""
          width={48}
          height={48}
          className="mb-5 h-12 w-12"
        />
        <h1 className="text-2xl font-medium tracking-tight">Connor Hepburn</h1>
        <p className="mt-4 max-w-lg text-[17px] font-normal leading-7 text-[var(--text-secondary)]">
          Born and raised in the <Keyword tooltip="we made that one empire">UK</Keyword>, lived in{" "}
          <Keyword tooltip="cheese and chocolate country">Switzerland</Keyword>{" "}
          for two years, then <Keyword tooltip="that thing idiots and geniuses do">dropped out</Keyword>{" "}
          of college to build more. Usually making things I use every day and{" "}
          <Keyword tooltip="philanthropy for broke people">open-sourcing</Keyword>{" "}
          them. A lot of that ends up being the kind of shit that makes{" "}
          <Keyword tooltip="that word no one can define">agents</Keyword> fun and useful.
        </p>
      </section>

      <section>
        <SectionTitle>Projects</SectionTitle>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="project-preview w-full overflow-visible">
            <img
              src="/images/creed-opengraph.jpg"
              alt="Creed — Own your context"
              width={1200}
              height={630}
              className="aspect-[40/21] w-full object-cover"
            />
            <div className="p-4">
              <p className="text-[15px] font-normal leading-6 text-[var(--text-secondary)]">
                One <Keyword tooltip="yours, not rented">open-source</Keyword> profile
                that gives every <Keyword tooltip="the machine reading this">AI</Keyword>{" "}
                your <Keyword tooltip="the stuff it needs to know">context</Keyword>.
              </p>
              <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
                Try it{" "}
                <a
                  href="https://creed.md"
                  target="_blank"
                  rel="noreferrer"
                  className="project-preview-cta"
                >
                  here
                </a>
              </p>
            </div>
          </article>
        </div>
      </section>

      <section>
        <SectionTitle>Activity</SectionTitle>
        <div className="mt-6">
          <ActivityGraph />
        </div>
      </section>

      <section>
        <SectionTitle>Connect</SectionTitle>
        <div className="mt-6 flex items-center gap-4 text-[var(--text-tertiary)]">
          <a
            href="https://x.com/connorhpbrn"
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className="transition-colors hover:text-[var(--text)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="h-[19px] w-[19px]"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://github.com/connorhpbrn"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="transition-colors hover:text-[var(--text)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-[19px] w-[19px]"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
          <a
            href="https://instagram.com/connorhpbrn"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="transition-colors hover:text-[var(--text)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-[19px] w-[19px]"
            >
              <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1.1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>
          <a
            href="mailto:connor@hpbrn.com"
            aria-label="Email"
            className="transition-colors hover:text-[var(--text)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-[19px] w-[19px]"
            >
              <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
              <path d="m3 6 9 6 9-6" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
