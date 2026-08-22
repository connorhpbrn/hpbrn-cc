import { TooltipAnchor, TooltipRegion } from "./tooltip-anchor";
import { calendarCells, getActivity, type ActivityDay } from "./activity-data";

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
  const cells = calendarCells(days);

  function grid(gridCells: ActivityDay[], className: string) {
    return (
      <TooltipRegion className={className}>
        {gridCells.map((day) => (
          <TooltipAnchor
            key={day.date}
            className="activity-day"
            tooltip={formatTooltip(day)}
            data-level={day.level}
            data-project={day.project}
            aria-label={formatTooltip(day)}
            tabIndex={day.count > 0 ? 0 : undefined}
          />
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
