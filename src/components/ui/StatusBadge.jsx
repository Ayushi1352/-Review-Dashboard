import { AlertTriangle, CheckCircle2, CircleAlert, Clock, Hourglass } from 'lucide-react';
import Badge from './Badge';
import { STATUS_META } from '../../utils/status';

const ICONS = {
  submitted: CheckCircle2,
  late: CheckCircle2,
  overdue: CircleAlert,
  'due-soon': AlertTriangle,
  pending: Clock,
  missing: CircleAlert,
  awaiting: Hourglass,
};

export default function StatusBadge({ status, className }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <Badge tone={meta.tone} icon={ICONS[status]} className={className}>
      {meta.label}
    </Badge>
  );
}
