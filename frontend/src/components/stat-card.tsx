type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "lime" | "amber" | "blue";
};

export function StatCard({ label, value, detail, tone = "lime" }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <p className="eyebrow">{label}</p>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__detail">{detail}</p>
    </article>
  );
}
