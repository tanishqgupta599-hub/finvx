"use client";
import { Card, CardContent } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { useAppStore } from "@/state/app-store";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import type { ProfileMode } from "@/domain/models";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { CountrySelector } from "@/components/profile/CountrySelector";
import { CountryCode, getCountryConfig } from "@/lib/countries";
// Conditionally import Clerk
const hasClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_key_here';

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
  const updateProfile = useAppStore((s) => s.updateProfile);
  const notificationPreferences = useAppStore(
    (s) => s.notificationPreferences,
  );
  const updateNotificationPreferences = useAppStore(
    (s) => s.updateNotificationPreferences,
  );
  
  // Safe Clerk usage - only if configured
  const [user, setUser] = useState<any>(null);
  const [signOut, setSignOut] = useState<((options?: any) => void) | null>(null);
  
  useEffect(() => {
    if (hasClerkKeys) {
      import("@clerk/nextjs")
        .then((clerk) => {
          // Try to use hooks if ClerkProvider is present
          try {
            // We can't call hooks here, so we'll handle signOut differently
            setSignOut(() => (options?: any) => {
              clerk.useClerk().signOut(options);
            });
          } catch (e) {
            // Clerk not available
          }
        })
        .catch(() => {
          // Clerk not available
        });
    }
  }, []);

  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const updateProfileField = (field: "name" | "email" | "country", value: string) => {
    updateProfile({ [field]: value });
  };

  const updateCountry = (countryCode: CountryCode) => {
    const countryConfig = getCountryConfig(countryCode);
    updateProfile({
      country: countryConfig.name,
      countryCode: countryCode,
      currency: countryConfig.currency,
    });
    toast.success(`Country updated to ${countryConfig.name}`);
  };

  const updateNotifications = (key: keyof typeof notificationPreferences, value: boolean) => {
    updateNotificationPreferences({
      ...notificationPreferences,
      [key]: value,
    });
  };

  const displayName =
    profile?.name || user?.fullName || user?.primaryEmailAddress?.emailAddress || "there";

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
              <CountrySelector
                value={profile?.countryCode as CountryCode | undefined}
                onChange={updateCountry}
                showLabel={false}
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
            <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-3">
              <div>Email</div>
              <Switch
                checked={notificationPreferences.email}
                onCheckedChange={(c) => {
                  updateNotifications("email", c);
                  toast.message(`Email notifications ${c ? "on" : "off"}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-3">
              <div>Push</div>
              <Switch
                checked={notificationPreferences.push}
                onCheckedChange={(c) => {
                  updateNotifications("push", c);
                  toast.message(`Push notifications ${c ? "on" : "off"}`);
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-3">
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
            <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-3">
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
                className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
              >
                <span>Terms of use</span>
                <span className="text-xs text-zinc-500">View</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
              >
                <span>Privacy policy</span>
                <span className="text-xs text-zinc-500">View</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
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
          <div className="space-y-3 text-sm">
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                toast.success("Link copied");
              }}
              className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
            >
              <span className="font-medium">Share this app</span>
              <span className="text-xs text-zinc-500">Copy link</span>
            </button>
            <button
              onClick={() => window.open("mailto:support@example.com")}
              className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
            >
              <span className="font-medium">Contact support</span>
              <span className="text-xs text-zinc-500">Email us</span>
            </button>
            <button
              onClick={() => {
                toast.info("Opening FAQs...");
              }}
              className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
            >
              <span className="font-medium">FAQs</span>
              <span className="text-xs text-zinc-500">View</span>
            </button>
          </div>
        </CardContent>
      </Card>

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
                if (signOut) {
                  signOut({ redirectUrl: "/sign-in" });
                  toast.success("Logged out successfully");
                } else {
                  toast.info("Sign out not available. Clerk not configured.");
                }
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
                className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-sm"
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
