import { TooltipAnchor, TooltipRegion } from "./interactive";

type ActivityDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  project: "creed" | "hpbrn" | "other" | "none";
};

type CalendarDay = {
  date: string;
  contributionCount: number;
  contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
};

const USERNAME = "connorhpbrn";
const REPO_OWNERS = [USERNAME, "hpbrn"];
const CREED_REPOSITORIES = ["creed", "creed-status", "creed-docs"];
const HPBRN_REPOSITORIES = ["hpbrn-cc", "hpbrn-com"];

const levelMap: Record<CalendarDay["contributionLevel"], ActivityDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function projectForDay(
  count: number,
  date: string,
  creedDates: Set<string>,
  hpbrnDates: Set<string>,
): ActivityDay["project"] {
  if (count === 0) return "none";
  if (creedDates.has(date)) return "creed";
  if (hpbrnDates.has(date)) return "hpbrn";
  return "other";
}

function datesFromGraphql(
  repositories: { repository: { name: string }; contributions: { nodes?: { occurredAt: string }[] } }[],
  names: string[],
) {
  const dates = new Set<string>();
  for (const repository of repositories) {
    if (!names.includes(repository.repository.name.toLowerCase())) continue;
    for (const contribution of repository.contributions.nodes ?? []) {
      dates.add(contribution.occurredAt.slice(0, 10));
    }
  }
  return dates;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

async function fetchGraphqlActivity(from: Date, to: Date, token: string) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "hpbrn.cc",
    },
    body: JSON.stringify({
      query: `
        query Activity($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    contributionLevel
                  }
                }
              }
              commitContributionsByRepository(maxRepositories: 100) {
                repository { name }
                contributions(first: 100) {
                  nodes { occurredAt }
                }
              }
            }
          }
        }
      `,
      variables: {
        login: USERNAME,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
    next: { revalidate: 3600 },
  });

  if (!response.ok) throw new Error(`GitHub GraphQL returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0].message);

  const collection = payload.data?.user?.contributionsCollection;
  if (!collection) throw new Error("GitHub contribution data was unavailable");

  const repositories = collection.commitContributionsByRepository ?? [];
  const creedDates = datesFromGraphql(repositories, CREED_REPOSITORIES);
  const hpbrnDates = datesFromGraphql(repositories, HPBRN_REPOSITORIES);
  if (!collection.contributionCalendar.weeks.length) {
    throw new Error("GitHub contribution calendar was empty");
  }

  return collection.contributionCalendar.weeks
    .flatMap((week: { contributionDays: CalendarDay[] }) => week.contributionDays)
    .map((day: CalendarDay): ActivityDay => ({
      date: day.date,
      count: day.contributionCount,
      level: levelMap[day.contributionLevel],
      project: projectForDay(day.contributionCount, day.date, creedDates, hpbrnDates),
    }));
}

function parsePublicCalendar(html: string) {
  const days = new Map<string, { count: number; level: ActivityDay["level"] }>();
  const cellPattern = /<td[^>]*data-date="([^"]+)"[^>]*data-level="([0-4])"[^>]*><\/td>\s*<tool-tip[^>]*>([^<]*)<\/tool-tip>/g;

  for (const match of html.matchAll(cellPattern)) {
    const countMatch = match[3].match(/([\d,]+) contribution/);
    days.set(match[1], {
      count: countMatch ? Number(countMatch[1].replaceAll(",", "")) : 0,
      level: Number(match[2]) as ActivityDay["level"],
    });
  }
  return days;
}

async function fetchPublicRepoDates(names: string[], from: Date, token?: string) {
  const dates = new Set<string>();
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hpbrn.cc",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  for (const owner of REPO_OWNERS) {
    for (const repository of names) {
      for (let page = 1; page <= 5; page += 1) {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repository}/commits?since=${encodeURIComponent(from.toISOString())}&per_page=100&page=${page}`,
          { headers, next: { revalidate: 3600 } },
        );
        if (!response.ok) break;
        const commits = await response.json();
        for (const commit of commits) {
          if (commit.author?.login?.toLowerCase() !== USERNAME) continue;
          const date = commit.commit?.author?.date?.slice(0, 10);
          if (date) dates.add(date);
        }
        if (commits.length < 100) break;
      }
    }
  }
  return dates;
}

async function fetchPublicActivity(from: Date, to: Date, token?: string) {
  const years = Array.from(new Set([from.getUTCFullYear(), to.getUTCFullYear()]));
  const calendars = await Promise.all(
    years.map(async (year) => {
      const response = await fetch(
        `https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`,
        { next: { revalidate: 3600 } },
      );
      if (!response.ok) throw new Error(`GitHub calendar returned ${response.status}`);
      return parsePublicCalendar(await response.text());
    }),
  );
  const publicDays = new Map(calendars.flatMap((calendar) => [...calendar]));
  if (publicDays.size === 0) {
    throw new Error("GitHub public contribution calendar was empty");
  }
  const [creedDates, hpbrnDates] = await Promise.all([
    fetchPublicRepoDates(CREED_REPOSITORIES, from, token),
    fetchPublicRepoDates(HPBRN_REPOSITORIES, from, token),
  ]);

  return dateRange(from, to).map((date): ActivityDay => {
    const key = isoDate(date);
    const activity = publicDays.get(key) ?? { count: 0, level: 0 as const };
    return {
      date: key,
      count: activity.count,
      level: activity.level,
      project: projectForDay(activity.count, key, creedDates, hpbrnDates),
    };
  });
}

function dateRange(from: Date, to: Date) {
  const dates: Date[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) dates.push(date);
  return dates;
}

async function getActivity() {
  const to = new Date();
  to.setUTCHours(23, 59, 59, 999);
  const from = addDays(to, -364);
  from.setUTCHours(0, 0, 0, 0);
  const token = process.env.GITHUB_TOKEN;

  if (token) {
    try {
      return await fetchGraphqlActivity(from, to, token);
    } catch {
      // Fall through to public GitHub data if the optional token expires.
    }
  }

  try {
    return await fetchPublicActivity(from, to, token);
  } catch {
    return null;
  }
}

function calendarCells(days: ActivityDay[]): ActivityDay[] {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const first = new Date(`${days[0].date}T00:00:00Z`);
  const last = new Date(`${days.at(-1)!.date}T00:00:00Z`);
  const start = addDays(first, -first.getUTCDay());
  const end = addDays(last, 6 - last.getUTCDay());

  return dateRange(start, end).map((date) => {
    const key = isoDate(date);
    return byDate.get(key) ?? { date: key, count: 0, level: 0, project: "none" };
  });
}

function formatTooltip(day: ActivityDay) {
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day.date}T12:00:00Z`));
  return `${date} · ${day.count} ${day.count === 1 ? "contribution" : "contributions"}`;
}

export async function ActivityGraph() {
  const days = await getActivity();
  if (!days) {
    return <p className="text-(--text-secondary)">GitHub activity is unavailable.</p>;
  }
  const cells = calendarCells(days);

  function grid(gridCells: ActivityDay[], className: string) {
    return (
      <TooltipRegion className={className}>
        {gridCells.map((day) => (
          day.count > 0 ? (
            <TooltipAnchor
              key={day.date}
              className="activity-day"
              tooltip={formatTooltip(day)}
              data-level={day.level}
              data-project={day.project}
              aria-label={formatTooltip(day)}
              tabIndex={0}
            />
          ) : (
            <span
              key={day.date}
              className="activity-day"
              data-level={day.level}
              data-project={day.project}
              aria-hidden="true"
            />
          )
        ))}
      </TooltipRegion>
    );
  }

  return (
    <>
      <div className="activity-scroll activity-scroll-desktop" aria-label="GitHub contribution activity for the past year">
        {grid(cells, "activity-grid")}
      </div>
      <div className="activity-scroll activity-scroll-mobile" aria-label="Recent GitHub contribution activity">
        {grid(cells.slice(-30 * 7), "activity-grid activity-grid-mobile")}
      </div>
    </>
  );
}
