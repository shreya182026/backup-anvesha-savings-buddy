import { useState } from "react";
import {
  MapPin,
  ShieldCheck,
  Play,
  Pause,
  Wallet,
  Target,
  PiggyBank,
  HandCoins,
  MessageCircleQuestion,
  Languages,
  Settings2,
  IndianRupee,
  Plus,
} from "lucide-react";
import {
  useAnvesha,
  RANGE_OPTIONS,
  essentialDaily,
  flexibleDaily,
  recommendedSaving,
  availableSpending,
  monthlyExpenses,
  type Goal,
} from "@/lib/anvesha/store";
import { LANGUAGES, makeT, inr, type Lang } from "@/lib/anvesha/i18n";
import {
  Button,
  Card,
  Field,
  Select,
  Choice,
  Progress,
  AnviBubble,
  AnviAvatar,
  Modal,
  TopBar,
  Stepper,
  Banner,
  SimNote,
} from "./ui";
import splash from "@/assets/splash.jpg";

function Page({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 no-scrollbar">{children}</div>
      {footer && <div className="space-y-2.5 border-t border-border bg-card/60 px-5 py-4">{footer}</div>}
    </div>
  );
}

/* ---------------- Splash ---------------- */

function Splash() {
  const { go, state } = useAnvesha();
  const t = makeT(state.lang);
  return (
    <div className="flex h-full flex-col bg-brand-gradient px-6 pb-8 pt-14 text-primary-foreground">
      <div className="flex-1">
        <p className="text-xs font-semibold tracking-[0.35em] opacity-80">SAVINGS ASSISTANT</p>
        <h1 className="mt-2 text-5xl font-extrabold tracking-tight">{t("appName")}</h1>
        <p className="mt-3 max-w-[16rem] text-[15px] leading-relaxed opacity-90">{t("tagline")}</p>
        <img
          src={splash}
          alt="Delivery worker riding a scooter with savings coins"
          width={1024}
          height={768}
          className="mt-8 w-full rounded-3xl object-cover shadow-[var(--shadow-float)]"
        />
      </div>
      <div className="space-y-3">
        <p className="text-center text-[13px] opacity-85">
          Built for delivery partners with different earnings every day.
        </p>
        <Button variant="accent" onClick={() => go("auth")}>
          {t("getStarted")}
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Auth ---------------- */

function Auth() {
  const { go, set, state } = useAnvesha();
  const t = makeT(state.lang);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [method, setMethod] = useState<"mobile" | "email">("mobile");
  const [value, setValue] = useState("98765 43210");
  const [error, setError] = useState("");

  const submit = () => {
    if (!value.trim()) return setError("Please enter this information.");
    if (method === "email" && !value.includes("@")) return setError("Please enter a valid email.");
    if (method === "mobile" && value.replace(/\D/g, "").length < 10)
      return setError("Please enter a valid 10-digit mobile number.");
    setError("");
    set({ phone: method === "mobile" ? value : state.phone });
    go("otp");
  };

  return (
    <Page
      footer={
        <>
          <Button onClick={submit}>{mode === "login" ? t("login") : t("signup")}</Button>
          <Button variant="ghost" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "New here? Create an account" : "Already have an account? Login"}
          </Button>
        </>
      }
    >
      <TopBar title="" onBack={() => go("splash")} />
      <h1 className="text-2xl font-bold">{t("welcomeTitle")}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Save a little every day, without changing how you work.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              mode === m ? "bg-card text-primary shadow-[var(--shadow-card)]" : "text-muted-foreground"
            }`}
          >
            {m === "login" ? t("login") : t("signup")}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <Choice
          columns={2}
          value={method}
          onChange={(v) => {
            setMethod(v as "mobile" | "email");
            setValue(v === "mobile" ? "98765 43210" : "rahul@example.com");
            setError("");
          }}
          options={[
            { value: "mobile", label: t("mobile") },
            { value: "email", label: t("email") },
          ]}
        />
        <Field
          label={method === "mobile" ? t("mobile") : t("email")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={error}
          inputMode={method === "mobile" ? "numeric" : "email"}
        />
        <AnviBubble>
          Hi! I'm Anvi. We only send a one-time code — we never ask for your bank password or UPI PIN.
        </AnviBubble>
      </div>
    </Page>
  );
}

/* ---------------- OTP ---------------- */

function Otp() {
  const { go, state } = useAnvesha();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");

  const verify = () => {
    if (code.length !== 6) return setStatus("error");
    setStatus("loading");
    setTimeout(() => {
      if (code === "123456") {
        setStatus("success");
        setTimeout(() => go("langloc"), 900);
      } else {
        setStatus("error");
      }
    }, 900);
  };

  return (
    <Page
      footer={
        <>
          <Button onClick={verify} loading={status === "loading"} disabled={code.length !== 6}>
            {status === "success" ? "Verified ✓" : "Verify & continue"}
          </Button>
          <Button variant="ghost" onClick={() => setCode("123456")}>
            Use demo code 123456
          </Button>
        </>
      }
    >
      <TopBar title="Verify your number" onBack={() => go("auth")} />
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to {state.phone}. For this prototype, the code is{" "}
        <span className="font-semibold text-foreground">123456</span>.
      </p>
      <div className="mt-6">
        <Field
          label="One-time code"
          value={code}
          inputMode="numeric"
          maxLength={6}
          placeholder="● ● ● ● ● ●"
          className="text-center text-2xl tracking-[0.4em]"
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            if (status === "error") setStatus("idle");
          }}
          error={status === "error" ? "Incorrect OTP. Please try again." : ""}
        />
      </div>
      {status === "success" && (
        <div className="mt-4">
          <Banner tone="success">Number verified successfully.</Banner>
        </div>
      )}
      <div className="mt-4">
        <SimNote text="Prototype simulation — no real OTP is sent." />
      </div>
    </Page>
  );
}

/* ---------------- Language + Location ---------------- */

function LangLoc() {
  const { go, set, state } = useAnvesha();
  const t = makeT(state.lang);
  const [locating, setLocating] = useState(false);
  const [manual, setManual] = useState(false);

  const recommended =
    state.locationPermission === "unknown"
      ? []
      : LANGUAGES.filter((l) => l.regions.includes(state.city));
  const rest = LANGUAGES.filter((l) => !recommended.includes(l));

  return (
    <Page
      footer={
        <Button onClick={() => go("name")} disabled={state.locationPermission === "unknown"}>
          {t("continue")}
        </Button>
      }
    >
      <TopBar title={t("makeYours")} onBack={() => go("auth")} />
      <Card className="bg-secondary">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" />
          <p className="text-[13px] leading-relaxed">
            We use your location only to suggest relevant languages and regions. We do not need your
            precise location to manage your savings.
          </p>
        </div>
      </Card>

      <div className="mt-3 space-y-2.5">
        <Button
          loading={locating}
          variant="primary"
          onClick={() => {
            setLocating(true);
            setTimeout(() => {
              setLocating(false);
              set({ locationPermission: "granted", city: "Delhi" });
            }, 1000);
          }}
        >
          {t("useLocation")}
        </Button>
        <Button variant="outline" onClick={() => setManual(true)}>
          {t("chooseManually")}
        </Button>
        {state.locationPermission !== "unknown" && (
          <Banner tone="success">
            Location: {state.city} ({state.locationPermission === "granted" ? "detected" : "chosen manually"})
          </Banner>
        )}
      </div>

      {state.locationPermission !== "unknown" && (
        <div className="mt-6 space-y-4">
          {recommended.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
                SUGGESTED FOR {state.city.toUpperCase()}
              </p>
              <LangList
                langs={recommended}
                value={state.lang}
                onPick={(l) => set({ lang: l })}
              />
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
              ALL LANGUAGES
            </p>
            <LangList langs={rest} value={state.lang} onPick={(l) => set({ lang: l })} />
          </div>
        </div>
      )}

      <Modal open={manual} onClose={() => setManual(false)} title="Choose your city">
        <div className="space-y-2">
          {["Delhi", "Mumbai", "Kolkata", "Jaipur"].map((c) => (
            <Button
              key={c}
              variant="outline"
              onClick={() => {
                set({ city: c, locationPermission: "manual" });
                setManual(false);
              }}
            >
              {c}
            </Button>
          ))}
        </div>
      </Modal>
    </Page>
  );
}

function LangList({
  langs,
  value,
  onPick,
}: {
  langs: typeof LANGUAGES;
  value: Lang;
  onPick: (l: Lang) => void;
}) {
  return (
    <Choice
      value={value}
      onChange={(v) => onPick(v as Lang)}
      options={langs.map((l) => ({ value: l.code, label: `${l.native} (${l.english})` }))}
    />
  );
}

/* ---------------- Name ---------------- */

function NameScreen() {
  const { go, set, state } = useAnvesha();
  const t = makeT(state.lang);
  const [name, setName] = useState(state.name);
  const [error, setError] = useState("");
  return (
    <Page
      footer={
        <Button
          onClick={() => {
            if (!name.trim()) return setError("Please enter this information.");
            set({ name: name.trim() });
            go("intro");
          }}
        >
          {t("continue")}
        </Button>
      }
    >
      <TopBar title="" onBack={() => go("langloc")} />
      <AnviBubble>Namaste! I'm Anvi and I'll be with you inside Anvesha.</AnviBubble>
      <h1 className="mt-6 text-2xl font-bold">{t("nameQ")}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        This is only used to greet you inside the app.
      </p>
      <div className="mt-5">
        <Field
          label={t("yourName")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          error={error}
          placeholder="Rahul"
        />
      </div>
    </Page>
  );
}

/* ---------------- Anvi intro ---------------- */

function Intro() {
  const { go, state } = useAnvesha();
  return (
    <Page
      footer={
        <>
          <Button onClick={() => go("tour")}>Show me around</Button>
          <Button variant="ghost" onClick={() => go("personal")}>
            Skip tour
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center pt-12 text-center">
        <AnviAvatar size={120} />
        <h1 className="mt-5 text-2xl font-bold">Hi {state.name}! I'm Anvi.</h1>
        <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
          I'll help you save without making your daily life difficult. On good days we save a bit
          more, on slow days we save less.
        </p>
      </div>
    </Page>
  );
}

/* ---------------- Guided tour ---------------- */

const TOUR = [
  { icon: PiggyBank, title: "Savings", text: "A small amount is suggested each day, based on what you actually earned." },
  { icon: IndianRupee, title: "Daily Money", text: "Enter today's earnings and spending in a few taps." },
  { icon: HandCoins, title: "Budget", text: "See essential expenses, flexible spending and what is safe to save." },
  { icon: Wallet, title: "Wallet", text: "Your Anvesha savings, with every deposit and withdrawal listed." },
  { icon: Target, title: "Goals", text: "Emergency fund, vehicle repair, family needs — track each one." },
  { icon: MessageCircleQuestion, title: "Help", text: "Ask me anything in simple words, anytime." },
  { icon: Languages, title: "Language", text: "Use Anvesha in Hindi, English or Bengali." },
  { icon: Settings2, title: "Settings", text: "Control notifications, UPI connection and privacy." },
];

function Tour() {
  const { go, set } = useAnvesha();
  const [step, setStep] = useState(0);
  const item = TOUR[step];
  const Icon = item.icon;
  const finish = () => {
    set({ tourDone: true });
    go("personal");
  };
  return (
    <Page
      footer={
        <>
          <Button onClick={() => (step === TOUR.length - 1 ? finish() : setStep(step + 1))}>
            {step === TOUR.length - 1 ? "Finish tour" : "Continue"}
          </Button>
          <Button variant="ghost" onClick={finish}>
            Skip tour
          </Button>
        </>
      }
    >
      <TopBar title="Quick tour" onBack={step > 0 ? () => setStep(step - 1) : () => go("intro")} />
      <Stepper step={step} total={TOUR.length} />
      <Card className="mt-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
      </Card>
      <div className="mt-4">
        <AnviBubble>Step {step + 1} of {TOUR.length}. You can skip anytime and explore on your own.</AnviBubble>
      </div>
    </Page>
  );
}

/* ---------------- Personal information ---------------- */

function Personal() {
  const { go, set, state } = useAnvesha();
  const [f, setF] = useState({
    name: state.name,
    age: state.age,
    phone: state.phone,
    city: state.city,
    occupation: state.occupation,
    lang: state.lang,
    maritalStatus: state.maritalStatus,
    familyMembers: state.familyMembers,
    emergencyContact: state.emergencyContact,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const upd = (k: string, v: string) => {
    setF({ ...f, [k]: v });
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Please enter this information.";
    if (!f.age.trim() || Number(f.age) < 16) e.age = "Please enter a valid age.";
    if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Please enter a valid mobile number.";
    if (!f.city.trim()) e.city = "Please enter this information.";
    if (!f.occupation) e.occupation = "Please select your work.";
    if (!f.familyMembers) e.familyMembers = "Please enter this information.";
    setErrors(e);
    if (Object.keys(e).length) return;
    set({
      name: f.name.trim(),
      age: f.age,
      phone: f.phone,
      city: f.city,
      occupation: f.occupation,
      lang: f.lang as Lang,
      maritalStatus: f.maritalStatus,
      familyMembers: f.familyMembers,
      emergencyContact: f.emergencyContact,
    });
    go("financial");
  };

  return (
    <Page footer={<Button onClick={submit}>Save & Continue</Button>}>
      <TopBar title="Let's create your profile" onBack={() => go("tour")} />
      <AnviBubble>
        I ask only what helps me suggest the right saving amount for you. Nothing is shared with
        anyone.
      </AnviBubble>
      <div className="mt-4 space-y-3.5">
        <Field label="Full name" value={f.name} onChange={(e) => upd("name", e.target.value)} error={errors.name} />
        <Field label="Age" inputMode="numeric" value={f.age} onChange={(e) => upd("age", e.target.value)} error={errors.age} />
        <Field label="Mobile number" inputMode="numeric" value={f.phone} onChange={(e) => upd("phone", e.target.value)} error={errors.phone} />
        <Field label="City / area" value={f.city} onChange={(e) => upd("city", e.target.value)} error={errors.city} />
        <Select
          label="Occupation"
          value={f.occupation}
          onChange={(v) => upd("occupation", v)}
          error={errors.occupation}
          options={[
            { value: "Delivery Worker", label: "Delivery Worker" },
            { value: "Cab / Auto Driver", label: "Cab / Auto Driver" },
            { value: "Daily Wage Worker", label: "Daily Wage Worker" },
            { value: "Other", label: "Other" },
          ]}
        />
        <Select
          label="Preferred language"
          value={f.lang}
          onChange={(v) => upd("lang", v)}
          options={LANGUAGES.map((l) => ({ value: l.code, label: `${l.native} (${l.english})` }))}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium">Marital status (optional)</p>
          <Choice
            columns={2}
            value={f.maritalStatus}
            onChange={(v) => upd("maritalStatus", v)}
            options={[
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
            ]}
          />
        </div>
        <Field
          label="Number of family members"
          inputMode="numeric"
          value={f.familyMembers}
          onChange={(e) => upd("familyMembers", e.target.value)}
          error={errors.familyMembers}
        />
        <Field
          label="Emergency contact (optional)"
          value={f.emergencyContact}
          onChange={(e) => upd("emergencyContact", e.target.value)}
          hint="Someone we can show on your profile in case of need."
        />
      </div>
    </Page>
  );
}

/* ---------------- Financial information (conversational) ---------------- */

function Financial() {
  const { go, set, state } = useAnvesha();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    incomeSource: state.incomeSource,
    dailyIncome: String(state.dailyIncome),
    variability: String(state.incomeVariability),
    hasOther: state.otherIncome > 0 ? "yes" : "no",
    otherName: "",
    otherAmount: String(state.otherIncome || ""),
    household: state.familyMembers,
    earners: state.earningMembers,
    spouseWorks: state.spouseIncome > 0 ? "yes" : "no",
    spouseIncome: String(state.spouseIncome || ""),
    hasEmergency: state.existingEmergencySavings > 0 ? "yes" : "no",
    emergencyAmount: String(state.existingEmergencySavings || ""),
  });
  const [expenses, setExpenses] = useState(state.expenses);
  const [error, setError] = useState("");
  const upd = (k: string, v: string) => {
    setD({ ...d, [k]: v });
    setError("");
  };

  const expenseFields: { key: keyof typeof expenses; label: string }[] = [
    { key: "rent", label: "Rent / housing" },
    { key: "food", label: "Food" },
    { key: "utilities", label: "Electricity / utilities" },
    { key: "phone", label: "Phone / internet" },
    { key: "fuel", label: "Fuel / vehicle" },
    { key: "education", label: "Education" },
    { key: "medical", label: "Medical" },
    { key: "debt", label: "Loan repayments" },
    { key: "family", label: "Family support" },
    { key: "other", label: "Other" },
  ];

  const steps: { title: string; body: React.ReactNode; valid: () => string }[] = [
    {
      title: "Where do you currently earn from?",
      body: (
        <Choice
          value={d.incomeSource}
          onChange={(v) => upd("incomeSource", v)}
          options={[
            { value: "Delivery work", label: "Delivery work" },
            { value: "Other work", label: "Other work" },
            { value: "Both", label: "Both" },
          ]}
        />
      ),
      valid: () => (d.incomeSource ? "" : "Please choose one option."),
    },
    {
      title: "Approximately how much do you earn on a normal working day?",
      body: (
        <Field
          label="Daily earnings (₹)"
          inputMode="numeric"
          value={d.dailyIncome}
          onChange={(e) => upd("dailyIncome", e.target.value.replace(/\D/g, ""))}
        />
      ),
      valid: () => (Number(d.dailyIncome) > 0 ? "" : "Please enter a valid amount."),
    },
    {
      title: "How much can your income change between a low and a high day?",
      body: (
        <div>
          <Field
            label="Difference (₹)"
            inputMode="numeric"
            value={d.variability}
            onChange={(e) => upd("variability", e.target.value.replace(/\D/g, ""))}
            hint="Example: on a slow day you earn ₹400 less than usual."
          />
        </div>
      ),
      valid: () => (d.variability !== "" ? "" : "Please enter a valid amount."),
    },
    {
      title: "Do you have another source of income?",
      body: (
        <div className="space-y-3">
          <Choice
            columns={2}
            value={d.hasOther}
            onChange={(v) => upd("hasOther", v)}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          {d.hasOther === "yes" && (
            <>
              <Field label="What is it?" value={d.otherName} onChange={(e) => upd("otherName", e.target.value)} />
              <Field
                label="Approximate monthly amount (₹)"
                inputMode="numeric"
                value={d.otherAmount}
                onChange={(e) => upd("otherAmount", e.target.value.replace(/\D/g, ""))}
              />
            </>
          )}
        </div>
      ),
      valid: () =>
        d.hasOther === "yes" && !d.otherAmount ? "Please enter a valid amount." : "",
    },
    {
      title: "Tell me about your household",
      body: (
        <div className="space-y-3">
          <Field
            label="How many people live in your household?"
            inputMode="numeric"
            value={d.household}
            onChange={(e) => upd("household", e.target.value.replace(/\D/g, ""))}
          />
          <Field
            label="How many members currently earn?"
            inputMode="numeric"
            value={d.earners}
            onChange={(e) => upd("earners", e.target.value.replace(/\D/g, ""))}
          />
          <p className="pt-1 text-sm font-medium">Does your spouse work?</p>
          <Choice
            columns={2}
            value={d.spouseWorks}
            onChange={(v) => upd("spouseWorks", v)}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          {d.spouseWorks === "yes" && (
            <Field
              label="Their approximate monthly income (₹)"
              inputMode="numeric"
              value={d.spouseIncome}
              onChange={(e) => upd("spouseIncome", e.target.value.replace(/\D/g, ""))}
            />
          )}
        </div>
      ),
      valid: () => (Number(d.household) > 0 ? "" : "Please enter this information."),
    },
    {
      title: "Approximate monthly expenses",
      body: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a range — you do not need exact numbers.
          </p>
          {expenseFields.map((f) => (
            <div key={f.key}>
              <p className="mb-1.5 text-sm font-medium">{f.label}</p>
              <Choice
                columns={2}
                value={expenses[f.key]}
                onChange={(v) => setExpenses({ ...expenses, [f.key]: v })}
                options={RANGE_OPTIONS}
              />
            </div>
          ))}
        </div>
      ),
      valid: () => (expenses.rent && expenses.food ? "" : "Please choose rent and food ranges."),
    },
    {
      title: "Do you currently have money kept aside for emergencies?",
      body: (
        <div className="space-y-3">
          <Choice
            columns={2}
            value={d.hasEmergency}
            onChange={(v) => upd("hasEmergency", v)}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          {d.hasEmergency === "yes" && (
            <Field
              label="Approximately how much? (₹)"
              inputMode="numeric"
              value={d.emergencyAmount}
              onChange={(e) => upd("emergencyAmount", e.target.value.replace(/\D/g, ""))}
            />
          )}
        </div>
      ),
      valid: () =>
        d.hasEmergency === "yes" && !d.emergencyAmount ? "Please enter a valid amount." : "",
    },
  ];

  const isSummary = step === steps.length;
  const monthlyIncome = Number(d.dailyIncome) * 26 + Number(d.otherAmount || 0) + Number(d.spouseIncome || 0);
  const totalExpenses = monthlyExpenses(expenses);
  const capacity = Math.max(0, monthlyIncome - totalExpenses);

  const next = () => {
    const err = steps[step].valid();
    if (err) return setError(err);
    setError("");
    if (step === steps.length - 1) {
      set({
        incomeSource: d.incomeSource,
        dailyIncome: Number(d.dailyIncome),
        incomeVariability: Number(d.variability),
        otherIncome: d.hasOther === "yes" ? Number(d.otherAmount || 0) : 0,
        familyMembers: d.household,
        earningMembers: d.earners,
        spouseIncome: d.spouseWorks === "yes" ? Number(d.spouseIncome || 0) : 0,
        expenses,
        existingEmergencySavings: d.hasEmergency === "yes" ? Number(d.emergencyAmount || 0) : 0,
      });
    }
    setStep(step + 1);
  };

  if (isSummary) {
    return (
      <Page footer={<Button onClick={() => go("whysave")}>Create my plan</Button>}>
        <TopBar title="Your money summary" onBack={() => setStep(steps.length - 1)} />
        <AnviBubble>This is what I understood. We can always change it later.</AnviBubble>
        <div className="mt-4 space-y-2.5">
          <SummaryRow label="Estimated monthly income" value={inr(monthlyIncome)} />
          <SummaryRow label="Essential expenses" value={inr(totalExpenses * 0.75)} />
          <SummaryRow label="Other expenses" value={inr(totalExpenses * 0.25)} />
          <SummaryRow label="Existing emergency savings" value={inr(Number(d.emergencyAmount || 0))} />
          <SummaryRow label="Possible savings capacity" value={inr(capacity)} highlight />
        </div>
      </Page>
    );
  }

  return (
    <Page
      footer={
        <>
          {error && <Banner tone="error">{error}</Banner>}
          <Button onClick={next}>{step === steps.length - 1 ? "See summary" : "Continue"}</Button>
        </>
      }
    >
      <TopBar
        title="About your money"
        onBack={step === 0 ? () => go("personal") : () => setStep(step - 1)}
      />
      <Stepper step={step} total={steps.length} />
      <h2 className="mt-4 text-xl font-bold leading-snug">{steps[step].title}</h2>
      <div className="mt-4">{steps[step].body}</div>
    </Page>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "bg-accent-soft" : ""}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-lg font-bold ${highlight ? "text-accent" : ""}`}>{value}</span>
      </div>
    </Card>
  );
}

/* ---------------- Why save ---------------- */

function WhySave() {
  const { go } = useAnvesha();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (playing) return setPlaying(false);
    setPlaying(true);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setPlaying(false);
          return 100;
        }
        return p + 5;
      });
    }, 120);
  };

  return (
    <Page
      footer={
        <>
          <Button onClick={() => go("goalsetup")}>Continue</Button>
          <Button variant="ghost" onClick={() => go("goalsetup")}>
            Skip
          </Button>
        </>
      }
    >
      <TopBar title="Why saving matters" onBack={() => go("financial")} />
      <Card className="bg-brand-gradient p-0 text-primary-foreground">
        <div className="flex h-44 items-center justify-center">
          <button
            onClick={toggle}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-card/20 backdrop-blur transition-transform active:scale-95"
            aria-label={playing ? "Pause video" : "Play video"}
          >
            {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-card/25">
            <div className="h-full bg-card transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-90">
            {progress >= 100 ? "Watched ✓" : playing ? "Playing…" : "Saving on an irregular income · 2:40"}
          </p>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        <AnviBubble>
          Your earnings change every day, so a fixed monthly saving does not work. Small daily amounts
          do.
        </AnviBubble>
        {[
          ["Medical emergencies", "One hospital visit can cost a full week of earnings."],
          ["Vehicle repair", "A bike repair stops your income until it is fixed."],
          ["Family needs", "School fees, festivals and travel come suddenly."],
          ["Income gaps", "Rain, illness or slow days mean less work."],
        ].map(([t, s]) => (
          <Card key={t}>
            <p className="text-[15px] font-semibold">{t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s}</p>
          </Card>
        ))}
        <Card className="bg-accent-soft">
          <p className="text-[15px] font-semibold text-accent">How Anvesha helps</p>
          <p className="mt-1 text-sm">
            We suggest a small amount every day based on what you actually earned, build an emergency
            buffer first, and never take money automatically.
          </p>
        </Card>
      </div>
    </Page>
  );
}

/* ---------------- Goal setup ---------------- */

const GOAL_TYPES = [
  "Emergency Fund",
  "Medical Emergency",
  "Vehicle Repair",
  "Family Need",
  "Education",
  "Personal Goal",
  "Other",
];

export function GoalForm({
  onSave,
  onCancel,
  saveLabel = "Save goal",
}: {
  onSave: (g: Goal) => void;
  onCancel?: () => void;
  saveLabel?: string;
}) {
  const [name, setName] = useState("");
  const [custom, setCustom] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const finalName = name === "Other" ? custom.trim() : name;
    if (!finalName || !amount || Number(amount) <= 0 || !date)
      return setError("Please complete your goal details.");
    onSave({
      id: "g" + Date.now(),
      name: finalName,
      target: Number(amount),
      current: 0,
      targetDate: date,
    });
    setName("");
    setCustom("");
    setAmount("");
    setDate("");
    setError("");
  };

  return (
    <div className="space-y-3.5">
      <p className="text-sm font-medium">What are you saving for?</p>
      <Choice
        columns={2}
        value={name}
        onChange={(v) => {
          setName(v);
          setError("");
        }}
        options={GOAL_TYPES.map((g) => ({ value: g, label: g }))}
      />
      {name === "Other" && (
        <Field label="Goal name" value={custom} onChange={(e) => setCustom(e.target.value)} />
      )}
      <Field
        label="How much would you like to save? (₹)"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
      />
      <Field
        label="When would you like to reach this goal?"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {error && <Banner tone="error">{error}</Banner>}
      <Button onClick={submit} variant="accent">
        <Plus className="h-4 w-4" /> {saveLabel}
      </Button>
      {onCancel && (
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}

function GoalSetup() {
  const { go, set, state } = useAnvesha();
  const [adding, setAdding] = useState(state.goals.length === 0);
  return (
    <Page
      footer={
        <>
          <Button onClick={() => go("upi")} disabled={state.goals.length === 0}>
            Continue
          </Button>
          {!adding && (
            <Button variant="outline" onClick={() => setAdding(true)}>
              Add another goal
            </Button>
          )}
        </>
      }
    >
      <TopBar title="What are you saving for?" onBack={() => go("whysave")} />
      <div className="space-y-3">
        {state.goals.map((g) => (
          <Card key={g.id}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{g.name}</p>
              <span className="text-sm font-semibold text-accent">{inr(g.target)}</span>
            </div>
            <div className="mt-2">
              <Progress value={g.current} max={g.target} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {inr(g.current)} saved · by {g.targetDate}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-4">
        {adding ? (
          <Card>
            <GoalForm
              onSave={(g) => {
                set({ goals: [...state.goals, g] });
                setAdding(false);
              }}
              onCancel={state.goals.length ? () => setAdding(false) : undefined}
            />
          </Card>
        ) : (
          <AnviBubble>
            Most partners start with an Emergency Fund. You can add more goals anytime.
          </AnviBubble>
        )}
      </div>
    </Page>
  );
}

/* ---------------- UPI setup ---------------- */

function Upi() {
  const { go, set, state } = useAnvesha();
  const [phase, setPhase] = useState<"idle" | "auth" | "connecting" | "done">(
    state.upiConnected ? "done" : "idle",
  );

  return (
    <Page
      footer={
        <>
          {phase === "done" ? (
            <Button onClick={() => go("budget")}>Continue</Button>
          ) : (
            <>
              <Button onClick={() => setPhase("auth")}>Connect UPI</Button>
              <Button variant="ghost" onClick={() => go("budget")}>
                Skip for now
              </Button>
            </>
          )}
        </>
      }
    >
      <TopBar title="Connect UPI" onBack={() => go("goalsetup")} />
      <AnviBubble>
        Connect your UPI account to make saving easier. Your money stays in your own bank account
        unless you choose to save.
      </AnviBubble>
      <Card className="mt-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
          <div className="text-sm">
            <p className="font-semibold">We will never ask for</p>
            <ul className="mt-1.5 space-y-1 text-muted-foreground">
              <li>• Your UPI PIN</li>
              <li>• Your bank password</li>
              <li>• Your card or OTP details</li>
            </ul>
          </div>
        </div>
      </Card>
      {phase === "done" && (
        <div className="mt-4 space-y-3">
          <Banner tone="success">UPI connected ✓ — {state.upiId}</Banner>
        </div>
      )}
      <div className="mt-4">
        <SimNote text="Prototype simulation — no real bank account is connected." />
      </div>

      <Modal
        open={phase === "auth" || phase === "connecting"}
        onClose={() => setPhase("idle")}
        title="Authorise in your UPI app"
        dismissible={phase === "auth"}
      >
        <div className="space-y-4">
          <Card className="bg-secondary">
            <p className="text-sm">
              Approve a ₹1 verification request in your UPI app. No PIN is asked here.
            </p>
            <p className="mt-2 text-sm font-semibold">{state.upiId}</p>
          </Card>
          {phase === "connecting" ? (
            <Banner tone="info">Connecting securely…</Banner>
          ) : (
            <Button
              onClick={() => {
                setPhase("connecting");
                setTimeout(() => {
                  set({ upiConnected: true });
                  setPhase("done");
                }, 1400);
              }}
            >
              Approve request
            </Button>
          )}
          <SimNote text="Prototype simulation — no real money is transferred." />
        </div>
      </Modal>
    </Page>
  );
}

/* ---------------- Flexible budget ---------------- */

function Budget() {
  const { go, set, state } = useAnvesha();
  const rec = recommendedSaving(state);
  return (
    <Page
      footer={
        <Button
          onClick={() => {
            set({ onboarded: true, loggedIn: true, tab: "home" });
            go("app");
          }}
        >
          Go to my dashboard
        </Button>
      }
    >
      <TopBar title="Your flexible plan" onBack={() => go("upi")} />
      <AnviBubble tone="warm">
        Your savings amount changes with your income. This is a recommendation, not a mandatory
        deduction.
      </AnviBubble>
      <div className="mt-4 space-y-2.5">
        <SummaryRow label="Estimated essential expenses (daily)" value={inr(essentialDaily(state))} />
        <SummaryRow label="Flexible expenses (daily)" value={inr(flexibleDaily(state))} />
        <SummaryRow
          label="Emergency buffer"
          value={`${inr(state.emergencyBuffer)} / ${inr(state.emergencyBufferTarget)}`}
        />
        <SummaryRow label="Recommended saving today" value={inr(rec)} highlight />
        <SummaryRow label="Available for spending" value={inr(availableSpending(state))} />
      </div>
      <Card className="mt-4 bg-secondary">
        <p className="text-sm font-semibold">How it adapts</p>
        <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <p>Earn ₹500 → save around ₹30–₹50</p>
          <p>Earn ₹1,000 → save around ₹100</p>
          <p>Earn ₹1,500 → save around ₹150–₹200</p>
        </div>
      </Card>
    </Page>
  );
}

/* ---------------- Router ---------------- */

export function OnboardingFlow() {
  const { state } = useAnvesha();
  switch (state.screen) {
    case "splash":
      return <Splash />;
    case "auth":
      return <Auth />;
    case "otp":
      return <Otp />;
    case "langloc":
      return <LangLoc />;
    case "name":
      return <NameScreen />;
    case "intro":
      return <Intro />;
    case "tour":
      return <Tour />;
    case "personal":
      return <Personal />;
    case "financial":
      return <Financial />;
    case "whysave":
      return <WhySave />;
    case "goalsetup":
      return <GoalSetup />;
    case "upi":
      return <Upi />;
    case "budget":
      return <Budget />;
    default:
      return null;
  }
}
