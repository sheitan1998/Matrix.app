import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { installUpdate } from "@/lib/updater";

export default function UpdateModal({ open, updateInfo, onOpenChange, onSkip, onInstalled }) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progressValue, setProgressValue] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isInstalling) return undefined;

    const timer = window.setInterval(() => {
      setProgressValue((previous) => (previous >= 90 ? 90 : previous + 10));
    }, 300);

    return () => window.clearInterval(timer);
  }, [isInstalling]);

  const handleInstall = async () => {
    setIsInstalling(true);
    setError("");

    try {
      await installUpdate();
      setProgressValue(100);
      onInstalled?.();
    } catch (installError) {
      setError(installError?.message || "Failed to install update.");
      setIsInstalling(false);
      setProgressValue(10);
    }
  };

  const latestVersion = updateInfo?.latest_version || "-";
  const currentVersion = updateInfo?.current_version || "-";
  const releaseNotes = updateInfo?.body || "No release notes available.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update available</DialogTitle>
          <DialogDescription>
            Current version: <strong>{currentVersion}</strong> • New version: <strong>{latestVersion}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-48 overflow-y-auto rounded-md border p-3 text-sm text-muted-foreground whitespace-pre-wrap">
            {releaseNotes}
          </div>

          {isInstalling ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Downloading and installing update... The app will restart automatically.
              </p>
              <Progress value={progressValue} />
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onSkip?.();
              onOpenChange?.(false);
            }}
            disabled={isInstalling}
          >
            Skip
          </Button>
          <Button onClick={handleInstall} disabled={isInstalling}>
            {isInstalling ? "Installing..." : "Install now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
