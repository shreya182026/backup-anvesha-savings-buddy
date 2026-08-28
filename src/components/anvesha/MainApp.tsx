import { useState } from "react";
import {
  Home,
  IndianRupee,
  Target,
  Wallet as WalletIcon,
  User,
  MessageCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  useAnvesha,
  recommendedSaving,
  essentialDaily,
  flexibleDaily,
  availableSpending,
  type Tab,
} from "@/lib/anvesha/store";
import { makeT, inr, LANGUAGES, type Lang } from "@/lib/anvesha/i18n";
import {
  Button,
  Card,
  Field,
  Choice,
  Toggle,
  Progress,
  AnviBubble,
  AnviAvatar,
  Modal,
  TopBar,
  Banner,
  SimNote,
} from "./ui";
import { GoalForm } from "./Onboarding";
import { cn } from "@/lib/utils";

/* ---------------- Bottom navigation ---------------- */

const NAV: { tab: Tab; icon: typeof Home; key: string }[] = [
  { tab: "home", icon: Home, key: "home" },
  { tab: "money", icon: IndianRupee, key: "money" },
  { tab: "goals", icon: Target, key: "goals" },
  { tab: "wallet", icon: WalletIcon, key: "wallet" },
  { tab: "profile", icon: User, key: "profile" },
];

function BottomNav() {
  const { state, setTab } = useAnvesha();
  const t = makeT(state.lang);
  return (
    <nav className="grid grid-cols-5 border-t border-border bg-card px-1 pb-2 pt-1.5">
      {NAV.map(({ tab, icon: Icon, key }) => {
        const active = state.tab === tab;
        return (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
            {t(key)}
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------- Home ---------------- */

function StatCard({
  label,
  value,
  tone = "default",
  children,
}: {
  label: string;
  value: string;
  tone?: "default" | "accent" | "brand";
  children?: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        tone === "accent" && "bg-accent-soft",
        tone === "brand" && "bg-brand-gradient text-primary-foreground",
      )}
    >
      <p className={cn("text-xs font-medium", tone === "brand" ? "opacity-85" : "text-muted-foreground")}>
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold", tone === "accent" && "text-accent")}>{value}</p>
      {children}
    </Card>
  );
}

function HomeTab() {
  const { state, setTab, openOverlay } = useAnvesha();
  const t = makeT(state.lang);
  const rec = recommendedSaving(state);
  const goal = state.goals[0];

  return (
    <div className="space-y-3 px-4 pb-6 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("goodMorning")},</p>
          <h1 className="text-2xl font-bold">{state.name}</h1>
        </div>
        <AnviAvatar size={44} />
      </div>

      <AnviBubble>
        {rec > 0
          ? `You've earned ${inr(state.todayIncome)} today. After your usual costs, ${inr(rec)} is safe to save.`
          : "Today's earnings are low, so I'm not suggesting any saving. That's completely fine."}
      </AnviBubble>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("todayIncome")} value={inr(state.todayIncome)} />
        <StatCard label={t("todayExpenses")} value={inr(state.todayExpenses)} />
      </div>

      <Card className="bg-accent-soft">
        <p className="text-xs font-medium text-muted-foreground">{t("safeToSave")}</p>
        <p className="mt-1 text-3xl font-bold text-accent">{inr(rec)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This is a recommendation, not a mandatory deduction.
        </p>
        <div className="mt-3">
          <Button
            variant="accent"
            disabled={rec <= 0}
            onClick={() => openOverlay({ kind: "saveAction", amount: rec })}
          >
            {t("save")} {inr(rec)}
          </Button>
        </div>
      </Card>

      <StatCard label={t("savingsWallet")} value={inr(state.walletBalance)} tone="brand">
        <button
          onClick={() => setTab("wallet")}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold opacity-90"
        >
          Open wallet <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </StatCard>

      <Card>
        <p className="text-xs font-medium text-muted-foreground">{t("emergencyBuffer")}</p>
        <p className="mt-1 text-xl font-bold">
          {inr(state.emergencyBuffer)}{" "}
          <span className="text-sm font-medium text-muted-foreground">
            / {inr(state.emergencyBufferTarget)}
          </span>
        </p>
        <div className="mt-2">
          <Progress value={state.emergencyBuffer} max={state.emergencyBufferTarget} tone="primary" />
        </div>
      </Card>

      {goal && (
        <Card onClick={() => openOverlay({ kind: "goalDetail", id: goal.id })}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{t("activeGoal")}</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-1 font-semibold">{goal.name}</p>
          <p className="text-lg font-bold text-accent">
            {inr(goal.current)}{" "}
            <span className="text-sm font-medium text-muted-foreground">/ {inr(goal.target)}</span>
          </p>
          <div className="mt-2">
            <Progress value={goal.current} max={goal.target} />
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{t("weeklyProgress")}</p>
          <p className="text-xs font-semibold">
            {inr(state.savedThisWeek)} / {inr(state.weeklyTarget)}
          </p>
        </div>
        <div className="mt-2">
          <Progress value={state.savedThisWeek} max={state.weeklyTarget} />
        </div>
      </Card>

      <Button variant="outline" onClick={() => setTab("money")}>
        Add today's money
      </Button>
    </div>
  );
}

/* ---------------- Daily money ---------------- */

function MoneyTab() {
  const { state, set, openOverlay, setTab } = useAnvesha();
  const [income, setIncome] = useState(String(state.todayIncome));
  const [spent, setSpent] = useState(state.todayExpenses > 0 ? "yes" : "no");
  const [amount, setAmount] = useState(String(state.todayExpenses || ""));
  const [category, setCategory] = useState("Fuel");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const rec = recommendedSaving(state);

  const submit = () => {
    if (!income || Number(income) <= 0) return setError("Please enter a valid amount.");
    if (spent === "yes" && (!amount || Number(amount) < 0))
      return setError("Please enter a valid amount.");
    setError("");
    set({
      todayIncome: Number(income),
      todayExpenses: spent === "yes" ? Number(amount) : 0,
    });
    setSaved(true);
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-1">
      <TopBar title="Today's money" />
      <Card>
        <p className="text-sm font-medium">How much did you earn today?</p>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border px-4 py-3">
          <span className="text-2xl font-bold text-muted-foreground">₹</span>
          <input
            value={income}
            inputMode="numeric"
            onChange={(e) => {
              setIncome(e.target.value.replace(/\D/g, ""));
              setSaved(false);
              setError("");
            }}
            className="w-full bg-transparent text-3xl font-bold outline-none"
            placeholder="0"
          />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium">Did you spend anything today?</p>
        <div className="mt-2">
          <Choice
            columns={2}
            value={spent}
            onChange={(v) => {
              setSpent(v);
              setSaved(false);
            }}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </div>
        {spent === "yes" && (
          <div className="mt-3 space-y-3">
            <Field
              label="Amount spent (₹)"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/\D/g, ""));
                setSaved(false);
              }}
            />
            <div>
              <p className="mb-1.5 text-sm font-medium">Category</p>
              <Choice
                columns={2}
                value={category}
                onChange={setCategory}
                options={["Fuel", "Food", "Vehicle", "Family", "Other"].map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
            </div>
          </div>
        )}
      </Card>

      {error && <Banner tone="error">{error}</Banner>}

      <Button onClick={submit}>Save today's record</Button>

      {saved && (
        <Card className="bg-accent-soft">
          <p className="font-semibold">Nice! You earned {inr(state.todayIncome)} today.</p>
          <p className="mt-1 text-sm">
            {rec > 0
              ? `Based on your plan, you can safely save ${inr(rec)}.`
              : "Today is a slow day — save nothing and rest easy."}
          </p>
          <div className="mt-3 space-y-2">
            <Button
              variant="accent"
              disabled={rec <= 0}
              onClick={() => openOverlay({ kind: "saveAction", amount: rec })}
            >
              Save {inr(rec)}
            </Button>
            <Button variant="ghost" onClick={() => setTab("home")}>
              Not now
            </Button>
          </div>
        </Card>
      )}

      <Card className="bg-secondary">
        <p className="text-sm font-semibold">Today's budget</p>
        <div className="mt-2 space-y-1.5 text-sm">
          <Row label="Essential expenses" value={inr(essentialDaily(state))} />
          <Row label="Flexible expenses" value={inr(flexibleDaily(state))} />
          <Row label="Recommended saving" value={inr(rec)} />
          <Row label="Available to spend" value={inr(availableSpending(state))} />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* ---------------- Goals ---------------- */

function GoalsTab() {
  const { state, openOverlay } = useAnvesha();
  const t = makeT(state.lang);
  return (
    <div className="space-y-3 px-4 pb-6 pt-1">
      <TopBar title={t("goals")} />
      {state.goals.map((g) => (
        <Card key={g.id} onClick={() => openOverlay({ kind: "goalDetail", id: g.id })}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{g.name}</p>
              <p className="text-xs text-muted-foreground">Target date: {g.targetDate}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-lg font-bold text-accent">
            {inr(g.current)}{" "}
            <span className="text-sm font-medium text-muted-foreground">/ {inr(g.target)}</span>
          </p>
          <div className="mt-2">
            <Progress value={g.current} max={g.target} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {Math.round((g.current / g.target) * 100)}% done · {inr(Math.max(0, g.target - g.current))} to go
          </p>
        </Card>
      ))}
      {state.goals.length === 0 && (
        <AnviBubble>You have no goals yet. Start with an emergency fund.</AnviBubble>
      )}
      <Button variant="accent" onClick={() => openOverlay({ kind: "addGoal" })}>
        {t("addNewGoal")}
      </Button>
    </div>
  );
}

/* ---------------- Wallet ---------------- */

function WalletTab() {
  const { state, openOverlay } = useAnvesha();
  const t = makeT(state.lang);
  const goal = state.goals[0];
  return (
    <div className="space-y-3 px-4 pb-6 pt-1">
      <TopBar title={t("wallet")} />
      <Card className="bg-brand-gradient text-primary-foreground">
        <p className="text-xs opacity-85">{t("totalSavings")}</p>
        <p className="mt-1 text-4xl font-bold">{inr(state.walletBalance)}</p>
        <p className="mt-1 text-xs opacity-85">
          {t("thisWeek")}: {inr(state.savedThisWeek)} saved
        </p>
        {goal && (
          <div className="mt-3">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-card/25">
              <div
                className="h-full rounded-full bg-card transition-all"
                style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs opacity-85">
              Goal: {inr(goal.target)} · {inr(goal.current)} reached
            </p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="accent" onClick={() => openOverlay({ kind: "saveAction", amount: recommendedSaving(state) })}>
          Save now
        </Button>
        <Button variant="outline" onClick={() => openOverlay({ kind: "withdraw" })}>
          {t("withdraw")}
        </Button>
      </div>

      <div className="space-y-2">
        {state.goals.map((g) => (
          <Card key={g.id} onClick={() => openOverlay({ kind: "goalDetail", id: g.id })}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{g.name}</p>
              <p className="text-sm font-bold text-accent">{inr(g.current)}</p>
            </div>
            <div className="mt-2">
              <Progress value={g.current} max={g.target} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <p className="mb-2 text-sm font-semibold">Transaction history</p>
        <div className="divide-y divide-border">
          {state.transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-3">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  tx.type === "deposit" ? "bg-accent-soft text-accent" : "bg-muted text-muted-foreground",
                )}
              >
                {tx.type === "deposit" ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{tx.label}</p>
                <p className="text-xs text-muted-foreground">{tx.when}</p>
              </div>
              <p className={cn("font-bold", tx.type === "deposit" ? "text-accent" : "text-foreground")}>
                {tx.type === "deposit" ? "+" : "-"}
                {inr(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <SimNote text="Prototype simulation — no real money is transferred." />
    </div>
  );
}

/* ---------------- Profile ---------------- */

function ProfileTab() {
  const { state, set, go, openOverlay, resetDemo } = useAnvesha();
  const t = makeT(state.lang);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  return (
    <div className="space-y-3 px-4 pb-6 pt-1">
      <TopBar title={t("profile")} />
      <Card className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-xl font-bold text-primary-foreground">
          {state.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold">{state.name}</p>
          <p className="text-sm text-muted-foreground">
            {state.occupation} · {state.city}
          </p>
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-sm font-semibold">{t("language")}</p>
        <Choice
          value={state.lang}
          onChange={(v) => set({ lang: v as Lang })}
          options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.native} (${l.english})` }))}
        />
      </Card>

      <Card>
        <Toggle
          label="Location permission"
          sub={
            state.locationPermission === "unknown"
              ? "Not granted"
              : `Granted · ${state.city}`
          }
          checked={state.locationPermission !== "unknown" && state.locationPermission !== "denied"}
          onChange={(v) => set({ locationPermission: v ? "granted" : "denied" })}
        />
        <div className="border-t border-border" />
        <Toggle
          label="Saving reminders"
          sub="A gentle nudge every evening"
          checked={state.notifications}
          onChange={(v) => set({ notifications: v })}
        />
        <div className="border-t border-border" />
        <Toggle
          label="Share anonymous usage data"
          sub="Helps improve Anvesha"
          checked={state.analyticsConsent}
          onChange={(v) => set({ analyticsConsent: v })}
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Linked UPI</p>
            <p className="text-xs text-muted-foreground">
              {state.upiConnected ? state.upiId : "Not connected"}
            </p>
          </div>
          {state.upiConnected ? (
            <Button
              full={false}
              size="sm"
              variant="outline"
              loading={disconnecting}
              onClick={() => {
                setDisconnecting(true);
                setTimeout(() => {
                  set({ upiConnected: false });
                  setDisconnecting(false);
                }, 800);
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button full={false} size="sm" onClick={() => go("upi")}>
              Connect
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <p className="mb-1 text-sm font-semibold">Savings preferences</p>
        <p className="text-xs text-muted-foreground">
          Weekly target: {inr(state.weeklyTarget)} · Emergency buffer target:{" "}
          {inr(state.emergencyBufferTarget)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => set({ weeklyTarget: Math.max(100, state.weeklyTarget - 100) })}
          >
            Lower target
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => set({ weeklyTarget: state.weeklyTarget + 100 })}
          >
            Raise target
          </Button>
        </div>
      </Card>

      <Button variant="outline" onClick={() => openOverlay({ kind: "privacy" })}>
        <ShieldCheck className="h-4 w-4" /> Privacy & data
      </Button>
      <Button variant="outline" onClick={() => openOverlay({ kind: "help" })}>
        <MessageCircle className="h-4 w-4" /> {t("help")}
      </Button>
      <Button variant="ghost" onClick={resetDemo}>
        <Sparkles className="h-4 w-4" /> Reset demo data
      </Button>
      <Button variant="danger" onClick={() => setConfirmLogout(true)}>
        {t("logout")}
      </Button>

      <Modal open={confirmLogout} onClose={() => setConfirmLogout(false)} title="Log out?">
        <p className="text-sm text-muted-foreground">
          Your saved demo data stays on this device. You can log back in anytime.
        </p>
        <div className="mt-4 space-y-2">
          <Button
            variant="danger"
            onClick={() => {
              setConfirmLogout(false);
              set({ loggedIn: false });
              go("auth");
            }}
          >
            Yes, log out
          </Button>
          <Button variant="ghost" onClick={() => setConfirmLogout(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Overlays ---------------- */

function SaveActionSheet({ amount }: { amount: number }) {
  const { state, deposit, closeOverlay, setTab, go } = useAnvesha();
  const [phase, setPhase] = useState<"confirm" | "saving" | "done">("confirm");
  const [custom, setCustom] = useState(String(amount || 100));
  const [error, setError] = useState("");
  const value = Number(custom);

  if (!state.upiConnected) {
    return (
      <Modal open onClose={closeOverlay} title="UPI not connected">
        <Banner tone="error">Connect UPI to use this simulated savings action.</Banner>
        <div className="mt-4 space-y-2">
          <Button onClick={() => go("upi")}>Connect UPI</Button>
          <Button variant="ghost" onClick={closeOverlay}>
            Cancel
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={closeOverlay}
      title={phase === "done" ? "Saved!" : "Save today"}
      dismissible={phase !== "saving"}
    >
      {phase === "done" ? (
        <div className="space-y-4">
          <Banner tone="success">{inr(value)} moved to your Anvesha savings wallet.</Banner>
          <Card className="bg-secondary">
            <Row label="New wallet balance" value={inr(state.walletBalance)} />
            <Row label="Emergency buffer" value={inr(state.emergencyBuffer)} />
          </Card>
          <SimNote text="Prototype simulation — no real money transferred." />
          <Button
            onClick={() => {
              closeOverlay();
              setTab("wallet");
            }}
          >
            View wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnviBubble>
            This recommendation is based on today's income, your expenses and your goals.
          </AnviBubble>
          <Field
            label="Amount to save (₹)"
            inputMode="numeric"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
          />
          {error && <Banner tone="error">{error}</Banner>}
          <SimNote text="Prototype simulation — no real money transferred." />
          <Button
            loading={phase === "saving"}
            onClick={() => {
              if (!value || value <= 0) return setError("Please enter a valid amount.");
              setPhase("saving");
              setTimeout(() => {
                deposit(value);
                setPhase("done");
              }, 1200);
            }}
          >
            {phase === "saving" ? "Saving…" : `Yes, save ${inr(value || 0)}`}
          </Button>
          <Button variant="ghost" onClick={closeOverlay}>
            Maybe later
          </Button>
        </div>
      )}
    </Modal>
  );
}

function WithdrawSheet() {
  const { state, withdraw, closeOverlay } = useAnvesha();
  const [amount, setAmount] = useState("500");
  const [phase, setPhase] = useState<"form" | "confirm" | "loading" | "done">("form");
  const [error, setError] = useState("");
  const value = Number(amount);

  return (
    <Modal open onClose={closeOverlay} title="Withdraw savings" dismissible={phase !== "loading"}>
      {phase === "done" ? (
        <div className="space-y-4">
          <Banner tone="success">{inr(value)} withdrawal requested.</Banner>
          <Card className="bg-secondary">
            <Row label="New wallet balance" value={inr(state.walletBalance)} />
          </Card>
          <SimNote text="Prototype simulation — no real money transferred." />
          <Button onClick={closeOverlay}>Done</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field
            label="Amount (₹)"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
          />
          <Card className="bg-secondary">
            <p className="text-xs text-muted-foreground">Where should we send it?</p>
            <p className="mt-1 text-sm font-semibold">
              {state.upiConnected ? state.upiId : "No UPI account linked"}
            </p>
          </Card>
          <p className="text-xs text-muted-foreground">
            Available: {inr(state.walletBalance)}
          </p>
          {error && <Banner tone="error">{error}</Banner>}
          {phase === "confirm" ? (
            <>
              <Banner tone="info">Confirm withdrawal of {inr(value)} to {state.upiId}?</Banner>
              <Button
                loading={false}
                onClick={() => {
                  setPhase("loading");
                  setTimeout(() => {
                    withdraw(value);
                    setPhase("done");
                  }, 1200);
                }}
              >
                Confirm withdrawal
              </Button>
              <Button variant="ghost" onClick={() => setPhase("form")}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              loading={phase === "loading"}
              onClick={() => {
                if (!state.upiConnected)
                  return setError("Connect UPI to use this simulated savings action.");
                if (!value || value <= 0) return setError("Please enter a valid amount.");
                if (value > state.walletBalance)
                  return setError("You cannot withdraw more than your available savings.");
                setPhase("confirm");
              }}
            >
              Withdraw {inr(value || 0)}
            </Button>
          )}
          <SimNote text="Prototype simulation — no real money transferred." />
        </div>
      )}
    </Modal>
  );
}

const HELP_QA: [string, string][] = [
  [
    "How much should I save?",
    "Today I suggest a small share of what you actually earned — usually around 10%. On a ₹1,000 day that is about ₹100, on a ₹500 day only ₹30–₹50.",
  ],
  [
    "Why did my saving amount change?",
    "Because your income or your spending changed. When you earn less or spend more, I lower the suggestion so your daily life is never squeezed.",
  ],
  [
    "How does my budget work?",
    "I first set aside your essential costs like rent, food and fuel. From what remains, a small part is suggested for savings and the rest is yours to spend.",
  ],
  [
    "How do I withdraw?",
    "Open Wallet, tap Withdraw, enter the amount and confirm. The money goes back to your linked UPI account. In this prototype it is only simulated.",
  ],
  [
    "Why should I keep an emergency fund?",
    "One medical visit or bike repair can stop your earnings for days. An emergency buffer means you never have to borrow at high interest.",
  ],
  [
    "How do I change my language?",
    "Go to Profile and choose Hindi, English or Bengali. The app changes immediately.",
  ],
];

function HelpSheet() {
  const { closeOverlay, state } = useAnvesha();
  const t = makeT(state.lang);
  const [thread, setThread] = useState<{ from: "you" | "anvi"; text: string }[]>([
    { from: "anvi", text: `Hello ${state.name}! Ask me anything about your savings.` },
  ]);
  const [input, setInput] = useState("");

  const answer = (q: string) => {
    const found = HELP_QA.find(([question]) => question.toLowerCase() === q.toLowerCase());
    if (found) return found[1];
    const lower = q.toLowerCase();
    if (lower.includes("save"))
      return `Right now ${inr(recommendedSaving(state))} is safe to save from today's ${inr(state.todayIncome)}.`;
    if (lower.includes("wallet") || lower.includes("balance"))
      return `Your wallet has ${inr(state.walletBalance)} and your emergency buffer is ${inr(state.emergencyBuffer)}.`;
    if (lower.includes("goal"))
      return state.goals[0]
        ? `Your goal ${state.goals[0].name} is at ${inr(state.goals[0].current)} of ${inr(state.goals[0].target)}. Keep going!`
        : "You have no goals yet — add one from the Goals tab.";
    return "I can help with saving amounts, your budget, goals, withdrawals and language. Try one of the questions above.";
  };

  const ask = (q: string) => {
    if (!q.trim()) return;
    setThread((th) => [...th, { from: "you", text: q }]);
    setInput("");
    setTimeout(() => setThread((th) => [...th, { from: "anvi", text: answer(q) }]), 500);
  };

  return (
    <Modal open onClose={closeOverlay} title={t("helpTitle")}>
      <div className="mb-3 flex flex-wrap gap-2">
        {HELP_QA.map(([q]) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-full bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-transform active:scale-95"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="max-h-64 space-y-2.5 overflow-y-auto rounded-2xl bg-muted p-3 no-scrollbar">
        {thread.map((m, i) =>
          m.from === "anvi" ? (
            <div key={i} className="flex items-start gap-2">
              <AnviAvatar size={28} />
              <p className="max-w-[80%] rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-[13px] leading-relaxed">
                {m.text}
              </p>
            </div>
          ) : (
            <p
              key={i}
              className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-[13px] text-primary-foreground"
            >
              {m.text}
            </p>
          ),
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Ask Anvi…"
          className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <Button full={false} onClick={() => ask(input)} disabled={!input.trim()}>
          Send
        </Button>
      </div>
    </Modal>
  );
}

function GoalDetailSheet({ id }: { id: string }) {
  const { state, closeOverlay, deposit } = useAnvesha();
  const goal = state.goals.find((g) => g.id === id);
  const [amount, setAmount] = useState("100");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  if (!goal) return null;
  const contributions = state.transactions.filter((t) => t.goalId === goal.id).slice(0, 4);

  return (
    <Modal open onClose={closeOverlay} title={goal.name}>
      <div className="space-y-4">
        <Card className="bg-accent-soft">
          <p className="text-2xl font-bold text-accent">
            {inr(goal.current)}{" "}
            <span className="text-sm font-medium text-muted-foreground">/ {inr(goal.target)}</span>
          </p>
          <div className="mt-2">
            <Progress value={goal.current} max={goal.target} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {inr(Math.max(0, goal.target - goal.current))} remaining · target {goal.targetDate}
          </p>
        </Card>
        <AnviBubble>
          {goal.current / goal.target > 0.7
            ? "You're very close! A few more days of small savings and this goal is complete."
            : "Steady small amounts work better than one big deposit. Keep going."}
        </AnviBubble>
        {contributions.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-semibold">Recent contributions</p>
            {contributions.map((c) => (
              <div key={c.id} className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground">{c.when}</span>
                <span className="font-semibold text-accent">+{inr(c.amount)}</span>
              </div>
            ))}
          </Card>
        )}
        <Field
          label="Add to this goal (₹)"
          inputMode="numeric"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value.replace(/\D/g, ""));
            setError("");
            setDone(false);
          }}
        />
        {error && <Banner tone="error">{error}</Banner>}
        {done && <Banner tone="success">Added to {goal.name}.</Banner>}
        <Button
          variant="accent"
          onClick={() => {
            if (!state.upiConnected)
              return setError("Connect UPI to use this simulated savings action.");
            const v = Number(amount);
            if (!v || v <= 0) return setError("Please enter a valid amount.");
            deposit(v, goal.id);
            setDone(true);
          }}
        >
          Add to this goal
        </Button>
        <SimNote text="Prototype simulation — no real money transferred." />
      </div>
    </Modal>
  );
}

function AddGoalSheet() {
  const { state, set, closeOverlay } = useAnvesha();
  return (
    <Modal open onClose={closeOverlay} title="Add a new goal">
      <GoalForm
        saveLabel="Create goal"
        onSave={(g) => {
          set({ goals: [...state.goals, g] });
          closeOverlay();
        }}
        onCancel={closeOverlay}
      />
    </Modal>
  );
}

function PrivacySheet() {
  const { state, set, closeOverlay } = useAnvesha();
  return (
    <Modal open onClose={closeOverlay} title="Privacy & data">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We only ask for information that helps personalise your savings plan.
        </p>
        {[
          ["What we collect", "Your name, city, work type, approximate income and expense ranges, and your goals."],
          ["Why we use it", "Only to calculate a daily saving amount that fits your real earnings."],
          ["Location", "Used once to suggest languages and region. Precise location is never needed."],
          ["UPI connection", "We never ask for your UPI PIN, bank password or card details, and we never store credentials."],
          ["Your controls", "Change your language, turn notifications off, disconnect UPI or reset your data anytime."],
        ].map(([title, text]) => (
          <Card key={title}>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </Card>
        ))}
        <Card>
          <Toggle
            label="Share anonymous usage data"
            checked={state.analyticsConsent}
            onChange={(v) => set({ analyticsConsent: v })}
          />
        </Card>
        <SimNote text="Prototype simulation — no real banking access." />
        <Button onClick={closeOverlay}>Close</Button>
      </div>
    </Modal>
  );
}

/* ---------------- Shell ---------------- */

export function MainApp() {
  const { state, overlay, openOverlay } = useAnvesha();
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {state.tab === "home" && <HomeTab />}
        {state.tab === "money" && <MoneyTab />}
        {state.tab === "goals" && <GoalsTab />}
        {state.tab === "wallet" && <WalletTab />}
        {state.tab === "profile" && <ProfileTab />}
      </div>

      <button
        onClick={() => openOverlay({ kind: "help" })}
        aria-label="Ask Anvi for help"
        className="absolute bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-warm-gradient shadow-[var(--shadow-float)] transition-transform active:scale-95"
      >
        <AnviAvatar size={44} />
      </button>

      <BottomNav />

      {overlay.kind === "saveAction" && <SaveActionSheet amount={overlay.amount} />}
      {overlay.kind === "withdraw" && <WithdrawSheet />}
      {overlay.kind === "help" && <HelpSheet />}
      {overlay.kind === "goalDetail" && <GoalDetailSheet id={overlay.id} />}
      {overlay.kind === "addGoal" && <AddGoalSheet />}
      {overlay.kind === "privacy" && <PrivacySheet />}
    </div>
  );
}
