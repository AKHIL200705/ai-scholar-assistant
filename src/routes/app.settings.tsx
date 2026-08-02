import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getAiSettings, saveAiSettings } from "@/lib/supabase-service";

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
  const initialAi = getAiSettings();
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [fontSize, setFontSize] = useState([16]);
  const [aiProvider, setAiProvider] = useState(initialAi.provider || "gpt-4o-mini");
  const [openAiKey, setOpenAiKey] = useState(initialAi.apiKey || "");

  const handleSaveAi = (key: string, provider: string) => {
    saveAiSettings(key, provider);
    toast.success("AI Settings updated & saved to Supabase profile!");
  };

  return (
    <PageShell title="Settings" subtitle="Personalise your study workspace & AI Engine.">
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

        <Row label="AI Model Engine" hint="Select ChatGPT or Academic AI">
          <Select
            value={aiProvider}
            onValueChange={(model) => {
              setAiProvider(model);
              handleSaveAi(openAiKey, model);
            }}
          >
            <SelectTrigger className="w-48 border-glass-border bg-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">ChatGPT · GPT-4o Mini</SelectItem>
              <SelectItem value="gpt-4o">ChatGPT · GPT-4o (High Intelligence)</SelectItem>
              <SelectItem value="edge-function">Supabase Edge Function</SelectItem>
              <SelectItem value="academic-ai">Built-in Academic AI Engine</SelectItem>
            </SelectContent>
          </Select>
        </Row>

        <Row label="OpenAI API Key (ChatGPT)" hint="Stored securely in browser & Supabase User Profile">
          <div className="flex w-64 items-center gap-2">
            <Input
              type="password"
              placeholder="sk-..."
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              className="h-9 border-glass-border bg-glass text-xs"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSaveAi(openAiKey, aiProvider)}
              className="h-9 text-xs"
            >
              Save Key
            </Button>
          </div>
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

        <Row label="Private mode" hint="Don't store chat history in Supabase">
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
        className="mt-6 border-destructive/40 text-destructive hover-lift"
      >
        <LogOut className="mr-1 h-4 w-4" /> Log out
      </Button>
    </PageShell>
  );
}