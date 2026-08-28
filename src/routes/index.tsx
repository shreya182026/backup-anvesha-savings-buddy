import { createFileRoute } from "@tanstack/react-router";
import { AnveshaProvider, useAnvesha } from "@/lib/anvesha/store";
import { PhoneFrame } from "@/components/anvesha/PhoneFrame";
import { OnboardingFlow } from "@/components/anvesha/Onboarding";
import { MainApp } from "@/components/anvesha/MainApp";

const title = "ANVESHA — Save today. Stay ready for tomorrow.";
const description =
  "A simple savings assistant for India's delivery workers: flexible daily saving suggestions that adapt to what you actually earn.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Shell() {
  const { state } = useAnvesha();
  return <PhoneFrame>{state.screen === "app" ? <MainApp /> : <OnboardingFlow />}</PhoneFrame>;
}

function Index() {
  return (
    <AnveshaProvider>
      <Shell />
    </AnveshaProvider>
  );
}
