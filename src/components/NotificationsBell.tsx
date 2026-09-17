import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useOrg";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationsBell({ userId }: { userId: string | undefined }) {
  const { data: items = [] } = useNotifications(userId);
  const qc = useQueryClient();
  const unread = items.filter((n) => !n.read_at).length;

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          Notifications
          {unread > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Mes notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAll.mutate()}>
              Tout lire
            </Button>
          )}
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune notification.</p>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              className={`rounded border border-border p-2 text-sm ${n.read_at ? "opacity-60" : ""}`}
            >
              <p className="font-medium">{n.title}</p>
              {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
              <p className="mt-1 text-[10px] text-muted-foreground">
                {new Date(n.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
