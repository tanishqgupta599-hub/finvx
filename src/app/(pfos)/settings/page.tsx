"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import type { ProfileMode } from "@/domain/models";
import { toast } from "sonner";
import { useState } from "react";
import { useAuthStore } from "@/state/auth-store";

export default function Settings() {
  const demoDataEnabled = useAppStore((s) => s.demoDataEnabled);
  const enableDemoData = useAppStore((s) => s.enableDemoData);
  const disableDemoData = useAppStore((s) => s.disableDemoData);
  const seedDemoData = useAppStore((s) => s.seedDemoData);
  const clearData = useAppStore((s) => s.clearData);
  const overwhelmMode = useAppStore((s) => s.overwhelmMode);
  const toggleOverwhelmMode = useAppStore((s) => s.toggleOverwhelmMode);
  const mode = useAppStore((s) => s.profileMode);
  const setProfileMode = useAppStore((s) => s.setProfileMode);
  const flags = useAppStore((s) => s.featureFlags);
  const setFlag = useAppStore((s) => s.setFeatureFlag);
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const notificationPreferences = useAppStore(
    (s) => s.notificationPreferences,
  );
  const updateNotificationPreferences = useAppStore(
    (s) => s.updateNotificationPreferences,
  );
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const updateProfileField = (field: "name" | "email" | "country", value: string) => {
    const base = profile ?? {
      id: "local-user",
      name: "",
      email: "",
      mode,
    };
    const next = { ...base, [field]: value };
    setProfile(next);
  };

  const updateNotifications = (key: keyof typeof notificationPreferences, value: boolean) => {
    updateNotificationPreferences({
      ...notificationPreferences,
      [key]: value,
    });
  };

  const displayName =
    profile?.name || authUser?.name || authUser?.email || "there";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Account
        </div>
        <div className="text-xl font-semibold text-white">
          {`Welcome, ${displayName}.`}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="text-sm font-medium">Profile and life stage</div>
            <div className="mt-2 grid gap-2 text-sm">
              <Input
                placeholder="Name"
                value={profile?.name ?? ""}
                onChange={(e) => updateProfileField("name", e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                value={profile?.email ?? ""}
                onChange={(e) => updateProfileField("email", e.target.value)}
              />
              <Input
                placeholder="Country"
                value={profile?.country ?? ""}
                onChange={(e) => updateProfileField("country", e.target.value)}
              />
              <div className="mt-2 text-xs text-zinc-500">
                Your chosen mode lightly changes how dense the app feels.
              </div>
              <Select
                value={mode}
                onChange={(v) => {
                  setProfileMode(v as ProfileMode);
                  toast.message(`Mode: ${v}`);
                }}
              >
                <option value="Growth">Growth</option>
                <option value="Balanced">Balanced</option>
                <option value="Peace">Peace</option>
                <option value="Senior">Senior</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm font-medium">Demo data</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">Enable demo dataset</div>
              <Switch
                checked={demoDataEnabled}
                onCheckedChange={(c) => {
                  if (c) {
                    enableDemoData();
                  } else {
                    disableDemoData();
                  }
                  toast.success(c ? "Demo data enabled" : "Demo data disabled");
                }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => {
                  seedDemoData();
                  toast.success("Seeded demo data");
                }}
              >
                Seed
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  clearData();
                  toast.info("Cleared data");
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="text-sm font-medium">Overwhelm and density</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">Overwhelm Mode</div>
              <Switch
                checked={overwhelmMode}
                onCheckedChange={() => {
                  toggleOverwhelmMode();
                  toast.message("Toggled Overwhelm Mode");
                }}
              />
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              When on, dashboards show fewer charts and numbers. You can still reach the same
              information, just more gently.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm font-medium">Security (stub)</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">App lock</div>
              <Switch
                checked={appLockEnabled}
                onCheckedChange={(c) => {
                  setAppLockEnabled(c);
                  toast.message(
                    c
                      ? "App lock preference saved locally (stub)"
                      : "App lock turned off (stub)",
                  );
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">Biometric unlock</div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={(c) => {
                  setBiometricEnabled(c);
                  toast.message(
                    c
                      ? "Biometric preference noted (stub)"
                      : "Biometric preference cleared (stub)",
                  );
                }}
              />
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              These controls are front-end only in this demo. Real locking would live in your
              chosen platform or OS.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="text-sm font-medium">Notifications</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
              <div>Email</div>
              <Switch
                checked={notificationPreferences.email}
                onCheckedChange={(c) => {
                  updateNotifications("email", c);
                  toast.message(`Email notifications ${c ? "on" : "off"}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
              <div>Push</div>
              <Switch
                checked={notificationPreferences.push}
                onCheckedChange={(c) => {
                  updateNotifications("push", c);
                  toast.message(`Push notifications ${c ? "on" : "off"}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
              <div>Product updates</div>
              <Switch
                checked={notificationPreferences.productUpdates}
                onCheckedChange={(c) => {
                  updateNotifications("productUpdates", c);
                  toast.message(
                    `Product updates ${c ? "subscribed" : "muted"}`,
                  );
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
              <div>Reminders</div>
              <Switch
                checked={notificationPreferences.reminders}
                onCheckedChange={(c) => {
                  updateNotifications("reminders", c);
                  toast.message(
                    `Reminders ${c ? "will be sent" : "are paused"}`,
                  );
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="text-sm font-medium">Data and privacy</div>
            <div className="mt-2 text-xs text-zinc-500">
              These buttons model how you might control your data in a real deployment.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  toast.message("Data export requested (stub)", {
                    description:
                      "In production, this would queue a downloadable export or email.",
                  })
                }
              >
                Request data export
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  toast.message("Delete request noted (stub)", {
                    description:
                      "Actual deletion would be handled by your backend and legal policy.",
                  })
                }
              >
                Request delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm font-medium">Legal</div>
            <div className="mt-2 text-xs text-zinc-500">
              Links are placeholders. In a real app they would open full policy pages.
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <a
                href="#"
                className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-left hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <span>Terms of use</span>
                <span className="text-xs text-zinc-500">View</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-left hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <span>Privacy policy</span>
                <span className="text-xs text-zinc-500">View</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-left hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <span>Risk and disclaimer</span>
                <span className="text-xs text-zinc-500">View</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="text-sm font-medium">Session</div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              You are currently logged in as <span className="text-white">{displayName}</span>.
            </div>
            <Button
              variant="secondary"
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => {
                logout();
                toast.success("Logged out successfully");
              }}
            >
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-sm font-medium">Feature flags</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(flags).map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900"
              >
                <div className="capitalize">
                  {k.replace(/([A-Z])/g, " $1")}
                </div>
                <Switch
                  checked={v}
                  onCheckedChange={(c) => {
                    setFlag(k as keyof typeof flags, c);
                    toast.message(`${k} ${c ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
