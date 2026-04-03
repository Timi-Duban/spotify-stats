import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthBannersProps {
  authSuccess: string | null;
  authError: string | null;
}

export function AuthBanners({ authSuccess, authError }: AuthBannersProps) {
  return (
    <>
      {authSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-green-700 bg-green-900/20 p-4 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Account connected — now showing your stats.
        </div>
      )}
      {authError && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-red-700 bg-red-900/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not connect account: {decodeURIComponent(authError)}. Please try again.
        </div>
      )}
    </>
  );
}
