export default function SkillBadge({ skill, variant = 'matched' }) {
  const styles = {
    matched: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    missing: 'bg-red-500/15 text-red-300 border-red-500/30',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${styles[variant]}`}>
      {skill}
    </span>
  )
}
