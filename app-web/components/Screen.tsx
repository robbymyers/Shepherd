import TabBar from "./TabBar";

export default function Screen({
  children,
  tabbar = true,
}: {
  children: React.ReactNode;
  tabbar?: boolean;
}) {
  return (
    <div className="frame">
      <div className="scroll">{children}</div>
      {tabbar && <TabBar />}
    </div>
  );
}
