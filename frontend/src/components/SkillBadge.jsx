export default function SkillBadge({ skill, variant = 'matched' }) {
  const styles = {
    matched: 'badge-green',
    missing: 'badge-red',
  }
  return (
    <span className={`inline-flex items-center capitalize ${styles[variant]}`}>
      {skill}
    </span>
  )
}
