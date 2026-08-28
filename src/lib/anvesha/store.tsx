import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./i18n";

export type Screen =
  | "splash"
  | "auth"
  | "otp"
  | "langloc"
  | "name"
  | "intro"
  | "tour"
  | "personal"
  | "financial"
  | "whysave"
  | "goalsetup"
  | "upi"
  | "budget"
  | "app";

export type Tab = "home" | "money" | "goals" | "wallet" | "profile";

export type Overlay =
  | { kind: "none" }
  | { kind: "saveAction"; amount: number }
  | { kind: "withdraw" }
  | { kind: "help" }
  | { kind: "goalDetail"; id: string }
  | { kind: "addGoal" }
  | { kind: "privacy" }
  | { kind: "settings" };

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  targetDate: string;
}

export interface Txn {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  label: string;
  when: string;
  goalId?: string;
}

export interface Expenses {
  rent: string;
  food: string;
  utilities: string;
  phone: string;
  fuel: string;
  education: string;
  medical: string;
  debt: string;
  family: string;
  other: string;
}

export interface AppState {
  screen: Screen;
  tab: Tab;
  loggedIn: boolean;
  onboarded: boolean;
  lang: Lang;
  locationPermission: "unknown" | "granted" | "manual" | "denied";
  city: string;
  name: string;
  age: string;
  phone: string;
  occupation: string;
  maritalStatus: string;
  familyMembers: string;
  earningMembers: string;
  emergencyContact: string;
  incomeSource: string;
  dailyIncome: number;
  incomeVariability: number;
  otherIncome: number;
  spouseIncome: number;
  expenses: Expenses;
  existingEmergencySavings: number;
  goals: Goal[];
  upiConnected: boolean;
  upiId: string;
  walletBalance: number;
  emergencyBuffer: number;
  emergencyBufferTarget: number;
  transactions: Txn[];
  todayIncome: number;
  todayExpenses: number;
  savedThisWeek: number;
  weeklyTarget: number;
  notifications: boolean;
  analyticsConsent: boolean;
  tourDone: boolean;
}

const RANGE_MID: Record<string, number> = {
  "": 0,
  "0-2000": 1000,
  "2000-5000": 3500,
  "5000-10000": 7500,
  "10000+": 12000,
};

export const RANGE_OPTIONS = [
  { value: "0-2000", label: "₹0 – ₹2,000" },
  { value: "2000-5000", label: "₹2,000 – ₹5,000" },
  { value: "5000-10000", label: "₹5,000 – ₹10,000" },
  { value: "10000+", label: "₹10,000+" },
];

export const initialState: AppState = {
  screen: "splash",
  tab: "home",
  loggedIn: false,
  onboarded: false,
  lang: "en",
  locationPermission: "unknown",
  city: "Delhi",
  name: "Rahul",
  age: "28",
  phone: "98765 43210",
  occupation: "Delivery Worker",
  maritalStatus: "Married",
  familyMembers: "4",
  earningMembers: "1",
  emergencyContact: "",
  incomeSource: "Delivery work",
  dailyIncome: 1050,
  incomeVariability: 400,
  otherIncome: 0,
  spouseIncome: 0,
  expenses: {
    rent: "5000-10000",
    food: "5000-10000",
    utilities: "0-2000",
    phone: "0-2000",
    fuel: "2000-5000",
    education: "0-2000",
    medical: "0-2000",
    debt: "",
    family: "2000-5000",
    other: "0-2000",
  },
  existingEmergencySavings: 2500,
  goals: [
    {
      id: "g1",
      name: "Emergency Fund",
      target: 10000,
      current: 4850,
      targetDate: "2026-12-31",
    },
    {
      id: "g2",
      name: "Vehicle Repair",
      target: 6000,
      current: 1200,
      targetDate: "2026-10-15",
    },
  ],
  upiConnected: false,
  upiId: "rahul@okaxis",
  walletBalance: 4850,
  emergencyBuffer: 2500,
  emergencyBufferTarget: 10000,
  transactions: [
    { id: "t1", type: "deposit", amount: 100, label: "Daily saving", when: "Today" },
    { id: "t2", type: "deposit", amount: 80, label: "Daily saving", when: "Yesterday" },
    { id: "t3", type: "deposit", amount: 120, label: "Daily saving", when: "Monday" },
  ],
  todayIncome: 1050,
  todayExpenses: 320,
  savedThisWeek: 620,
  weeklyTarget: 700,
  notifications: true,
  analyticsConsent: false,
  tourDone: false,
};

/* ---------- derived money maths ---------- */

export function monthlyExpenses(e: Expenses) {
  return Object.values(e).reduce((sum, v) => sum + (RANGE_MID[v] ?? 0), 0);
}

export function essentialDaily(s: AppState) {
  const essentialKeys: (keyof Expenses)[] = ["rent", "food", "utilities", "phone", "fuel", "debt"];
  const monthly = essentialKeys.reduce((sum, k) => sum + (RANGE_MID[s.expenses[k]] ?? 0), 0);
  return Math.round(monthly / 30);
}

export function flexibleDaily(s: AppState) {
  const total = Math.round(monthlyExpenses(s.expenses) / 30);
  return Math.max(0, total - essentialDaily(s));
}

/**
 * Flexible recommendation: save more on high-income days, less on low ones.
 * Never recommends more than the money genuinely left over today.
 */
export function recommendedSaving(s: AppState) {
  const income = s.todayIncome;
  if (income <= 0) return 0;
  const essentials = essentialDaily(s);
  const leftover = income - essentials - s.todayExpenses;
  if (leftover <= 0) return 0;

  let rate = 0.1;
  if (income < 600) rate = 0.07;
  else if (income >= 1400) rate = 0.12;
  if (s.emergencyBuffer < s.emergencyBufferTarget * 0.3) rate += 0.02;

  let amount = income * rate;
  amount = Math.min(amount, leftover * 0.6);
  amount = Math.round(amount / 10) * 10;
  return Math.max(0, amount);
}

export function availableSpending(s: AppState) {
  return Math.max(0, s.todayIncome - essentialDaily(s) - s.todayExpenses - recommendedSaving(s));
}

export function activeGoal(s: AppState) {
  return s.goals[0];
}

/* ---------- context ---------- */

interface Ctx {
  state: AppState;
  set: (patch: Partial<AppState>) => void;
  go: (screen: Screen) => void;
  setTab: (tab: Tab) => void;
  overlay: Overlay;
  openOverlay: (o: Overlay) => void;
  closeOverlay: () => void;
  deposit: (amount: number, goalId?: string) => void;
  withdraw: (amount: number) => void;
  resetDemo: () => void;
}

const AnveshaContext = createContext<Ctx | null>(null);
const KEY = "anvesha-state-v1";

export function AnveshaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [overlay, setOverlay] = useState<Overlay>({ kind: "none" });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const value = useMemo<Ctx>(() => {
    const set = (patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch }));
    return {
      state,
      set,
      go: (screen) => {
        setOverlay({ kind: "none" });
        set({ screen });
      },
      setTab: (tab) => {
        setOverlay({ kind: "none" });
        set({ tab, screen: "app" });
      },
      overlay,
      openOverlay: setOverlay,
      closeOverlay: () => setOverlay({ kind: "none" }),
      deposit: (amount, goalId) =>
        setState((s) => {
          const target = goalId ?? s.goals[0]?.id;
          const goals = s.goals.map((g) =>
            g.id === target ? { ...g, current: Math.min(g.target, g.current + amount) } : g,
          );
          const isEmergency = s.goals.find((g) => g.id === target)?.name
            .toLowerCase()
            .includes("emergency");
          return {
            ...s,
            walletBalance: s.walletBalance + amount,
            savedThisWeek: s.savedThisWeek + amount,
            goals,
            emergencyBuffer: isEmergency
              ? Math.min(s.emergencyBufferTarget, s.emergencyBuffer + amount)
              : s.emergencyBuffer,
            transactions: [
              {
                id: "t" + Date.now(),
                type: "deposit",
                amount,
                label: "Saved to " + (s.goals.find((g) => g.id === target)?.name ?? "wallet"),
                when: "Today",
                goalId: target,
              },
              ...s.transactions,
            ],
          };
        }),
      withdraw: (amount) =>
        setState((s) => ({
          ...s,
          walletBalance: Math.max(0, s.walletBalance - amount),
          goals: s.goals.map((g, i) =>
            i === 0 ? { ...g, current: Math.max(0, g.current - amount) } : g,
          ),
          emergencyBuffer: Math.max(0, s.emergencyBuffer - Math.min(amount, s.emergencyBuffer)),
          transactions: [
            {
              id: "t" + Date.now(),
              type: "withdrawal",
              amount,
              label: "Withdrawal to UPI",
              when: "Today",
            },
            ...s.transactions,
          ],
        })),
      resetDemo: () => {
        setOverlay({ kind: "none" });
        setState(initialState);
      },
    };
  }, [state, overlay]);

  return <AnveshaContext.Provider value={value}>{children}</AnveshaContext.Provider>;
}

export function useAnvesha() {
  const ctx = useContext(AnveshaContext);
  if (!ctx) throw new Error("useAnvesha must be used inside AnveshaProvider");
  return ctx;
}
