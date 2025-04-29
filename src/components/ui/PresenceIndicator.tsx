import { cn } from '@/lib/utils'; // Assuming shadcn/ui utility
import { FC } from 'react';

type PresenceAvailability =
  | 'Available'
  | 'AvailableIdle'
  | 'Away'
  | 'BeRightBack'
  | 'Busy'
  | 'BusyIdle'
  | 'DoNotDisturb'
  | 'Offline'
  | 'PresenceUnknown';

interface PresenceIndicatorProps {
  availability: PresenceAvailability | string | undefined; // Allow string for flexibility
  className?: string;
}

const getStatusColor = (availability: PresenceAvailability | string | undefined): string => {
  switch (availability) {
    case 'Available':
    case 'AvailableIdle': // Treat idle as available for simplicity?
      return 'bg-green-500';
    case 'Busy':
    case 'BusyIdle':
    case 'DoNotDisturb':
      return 'bg-red-500';
    case 'Away':
    case 'BeRightBack':
      return 'bg-yellow-500';
    case 'Offline':
    case 'PresenceUnknown':
    default:
      return 'bg-gray-400';
  }
};

export const PresenceIndicator: FC<PresenceIndicatorProps> = ({ availability, className }) => {
  const colorClass = getStatusColor(availability);

  return (
    <span
      className={cn(
        'inline-block h-3 w-3 rounded-full border-2 border-white', // Added border for contrast
        colorClass,
        className
      )}
      title={`Status: ${availability || 'Unknown'}`} // Add tooltip
      data-testid="presence-indicator"
    />
  );
}; 