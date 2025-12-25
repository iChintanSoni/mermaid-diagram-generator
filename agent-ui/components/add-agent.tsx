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
import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export function AddAgentDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  const saveAgent = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Access data using FormData
      const formData = new FormData(event.currentTarget);
      console.log("Link:", formData.get("link"));

      // Navigate and close dialog
      setOpen(false);
      router.push("/dashboard/chat");
    },
    [router]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <IconRobot /> Register an Agent
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        {/* Form is now inside the Portal content */}
        <form onSubmit={saveAgent}>
          <DialogHeader>
            <DialogTitle>Add Agent</DialogTitle>
            <DialogDescription>Link to your agent</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="link">Link</Label>
              <Input id="link" name="link" required />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Register</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
