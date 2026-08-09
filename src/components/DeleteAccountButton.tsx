import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Loader2 } from "lucide-react";

/**
 * DeleteAccountButton
 * -------------------
 * Reusable in-app "Delete Account" action for App Store / Google Play compliance.
 *
 * Flow:
 *  1. User taps "Delete Account" -> permanent-deletion confirmation dialog.
 *  2. On confirm, calls the `delete-account` Supabase edge function, which
 *     permanently deletes the auth record and all associated data.
 *  3. Signs the user out and shows a "Your account has been deleted" screen.
 *
 * This component is designed to be placed in an account / settings screen.
 * It is safe to render even when no user is signed in (it no-ops with a toast).
 */
export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast({
          title: "No account to delete",
          description: "You are not currently signed in.",
          variant: "destructive",
        });
        setOpen(false);
        return;
      }

      const { error } = await supabase.functions.invoke("delete-account", {
        method: "POST",
      });

      if (error) {
        throw error;
      }

      // Permanently deleted. Sign out and clear any local session state.
      await supabase.auth.signOut();
      setOpen(false);
      setDeleted(true);
    } catch (err) {
      console.error("Delete account failed:", err);
      toast({
        title: "Could not delete account",
        description:
          err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Post-deletion confirmation screen.
  if (deleted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 bg-card p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Trash2 className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Your account has been deleted</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account and all associated data have been permanently removed. You have been
            signed out.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Return to home
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Account
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is <strong>permanent</strong>. Your account, profile, and all
              associated data will be permanently deleted and cannot be recovered. You will be
              signed out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Yes, delete my account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
