"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconRobot } from "@tabler/icons-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerAgent, setUrl, resetRegistrationState } from "@/lib/features/agents-slice";
import { AppDispatch, RootState } from "@/lib/store";

interface AddAgentDialogProps {
  trigger?: React.ReactNode;
}

export function AddAgentDialog({ trigger }: AddAgentDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { registrationStatus, registrationError, url } = useSelector((state: RootState) => state.agents);
  const loading = registrationStatus === "loading";

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(resetRegistrationState());
    }
  }, [open, dispatch]);

  // Handle success redirection
  useEffect(() => {
    if (registrationStatus === "success") {
      setOpen(false);
      // Only redirect if NOT already on dashboard/chat if preferred, 
      // but for now redirecting to dashboard is safe/expected as per requirements.
      router.push("/dashboard");
      dispatch(resetRegistrationState());
    }
  }, [registrationStatus, router, dispatch]);

  const saveAgent = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      dispatch(registerAgent(url));
    },
    [dispatch, url]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="ghost">
            <IconRobot /> Register an Agent
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={saveAgent}>
          <DialogHeader>
            <DialogTitle>Add Agent</DialogTitle>
            <DialogDescription>Link to your agent</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                name="link"
                required
                placeholder="https://example.com/agent"
                value={url}
                onChange={(e) => dispatch(setUrl(e.target.value))}
              />
            </div>
            {registrationError && <p className="text-red-500 text-sm">{registrationError}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
