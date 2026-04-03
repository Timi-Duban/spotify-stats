import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TIME_RANGE_LABELS, type TimeRange, type SpotifyUser } from '@/types/spotify';

interface UserControlsProps {
  users: SpotifyUser[];
  selectedUserId: string;
  selectedUser: SpotifyUser | undefined;
  timeRange: TimeRange;
  onUserChange: (id: string) => void;
  onTimeRangeChange: (range: TimeRange) => void;
  onDeleteUser: () => void;
}

export function UserControls({
  users,
  selectedUserId,
  selectedUser,
  timeRange,
  onUserChange,
  onTimeRangeChange,
  onDeleteUser,
}: UserControlsProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      {selectedUser && (
        <Avatar className="h-10 w-10">
          <AvatarImage src={selectedUser.avatarUrl} />
          <AvatarFallback>{selectedUser.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}

      <Select value={selectedUserId} onValueChange={onUserChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(TIME_RANGE_LABELS) as [TimeRange, string][]).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedUser && (
        <button
          onClick={onDeleteUser}
          className="rounded p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Remove this account"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
