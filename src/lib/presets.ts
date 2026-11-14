import type { UserContext } from "@/types/insurance";
import type { SampleId } from "./samples-meta";

export interface DemoPreset {
  id: "miller" | "rivera";
  name: string;
  location: string;
  blurb: string;
  annualSpend: number;
  docs: SampleId[];
  context: UserContext;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "miller",
    name: "The Miller Family",
    location: "Austin, TX",
    blurb: "Auto (2 cars) + Family PPO + Homeowners HO-3",
    annualSpend: 8640,
    docs: ["miller-auto", "miller-health", "miller-home"],
    context: { state: "TX", age: 42, householdSize: 4, doctorVisits: "low", emergencyFund: 15000 },
  },
  {
    id: "rivera",
    name: "Alex Rivera",
    location: "San Diego, CA",
    blurb: "Auto (2012 Mazda3) + Renters + Platinum PPO",
    annualSpend: 3420,
    docs: ["rivera-auto", "rivera-renters", "rivera-health"],
    context: { state: "CA", age: 29, householdSize: 1, doctorVisits: "low", emergencyFund: 22000 },
  },
];
