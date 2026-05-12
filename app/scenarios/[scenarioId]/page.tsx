import ScenarioPlayer from "../../../components/ScenarioPlayer";

export default async function ScenarioPage(
  props: PageProps<"/scenarios/[scenarioId]">
) {
  const { scenarioId } = await props.params;
  return <ScenarioPlayer scenarioId={scenarioId} />;
}
