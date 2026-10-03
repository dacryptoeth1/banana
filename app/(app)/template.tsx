/** Remounts on every navigation, so each route fades and rises in (CSS only, see .page-enter). */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
