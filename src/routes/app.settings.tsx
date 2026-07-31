import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Doubt Resolution Assistant" },
      { name: "description", content: "Theme, language, AI model, notifications, font size and privacy controls." },
      { property: "og:title", content: "Settings — AI Doubt Resolution Assistant" },
      { property: "og:description", content: "Tune your AI study assistant to your preferences." },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-glass-border py-4 last:border-0">
      <div className="min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [fontSize, setFontSize] = useState([16]);

  return (
    <PageShell title="Settings" subtitle="Personalise your study workspace.">
      <div className="glass rounded-3xl p-6">
        <Row label="Dark mode" hint="Switch between light and dark themes">
          <Switch
            checked={theme === "dark"}
            onCheckedChange={() => {
              toggle();
              toast.success(`Switched to ${theme === "dark" ? "Light" : "Dark"} mode`);
            }}
            aria-label="Dark mode"
          />
        </Row>
        <Row label="Language">
          <Select
            defaultValue="en"
            onValueChange={(lang) => toast.success(`Language set to ${lang.toUpperCase()}`)}
          >
            <SelectTrigger className="w-40 border-glass-border bg-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Notifications" hint="Streak reminders and quiz results">
          <Switch
            checked={notifications}
            onCheckedChange={(val) => {
              setNotifications(val);
              toast.success(`Notifications ${val ? "enabled" : "disabled"}`);
            }}
            aria-label="Notifications"
          />
        </Row>
        <Row label="AI model" hint="Choose the reasoning engine">
          <Select
            defaultValue="pro"
            onValueChange={(model) => toast.success(`AI Model updated to ${model}`)}
          >
            <SelectTrigger className="w-44 border-glass-border bg-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flash">Fast · concise</SelectItem>
              <SelectItem value="pro">Balanced · default</SelectItem>
              <SelectItem value="reason">Deep reasoning</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label={`Font size · ${fontSize[0]}px`} hint="Applies to answers and notes">
          <div className="w-40">
            <Slider
              value={fontSize}
              onValueChange={(val) => {
                setFontSize(val);
                document.documentElement.style.setProperty("--app-font-size", `${val[0]}px`);
              }}
              min={12}
              max={22}
              step={1}
            />
          </div>
        </Row>
        <Row label="Private mode" hint="Don't store chat history">
          <Switch
            checked={privacy}
            onCheckedChange={(val) => {
              setPrivacy(val);
              toast.info(`Private mode ${val ? "enabled" : "disabled"}`);
            }}
            aria-label="Private mode"
          />
        </Row>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          toast.success("Successfully logged out.");
          navigate({ to: "/login" });
        }}
        className="border-destructive/40 text-destructive hover-lift"
      >
        <LogOut className="mr-1 h-4 w-4" /> Log out
      </Button>
    </PageShell>
  );
}