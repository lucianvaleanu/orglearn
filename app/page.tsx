import DashboardStatusCards from "../components/DashboardStatusCards";
import Header from "../components/Header";
import ScenarioSelectionTable from "../components/ScenarioSelectionTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#edf1d6]">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6e8b77]">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1f2c1c]">
            Your learning snapshot
          </h1>
          <p className="mt-2 text-sm text-[#6b7a66]">
            Track your rank, mastery progress, and next steps at a glance.
          </p>
        </div>
        <DashboardStatusCards />
        <div className="mt-10">
          <ScenarioSelectionTable />
        </div>
      </main>
    </div>
  );
}
