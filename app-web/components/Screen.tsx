import StatusBar from "./StatusBar";
import TabBar from "./TabBar";

export default function Screen({
  children,
  statusbar = true,
  tabbar = true,
}: {
  children: React.ReactNode;
  statusbar?: boolean;
  tabbar?: boolean;
}) {
  return (
    <div className="frame">
      {statusbar && <StatusBar />}
      <div className="scroll">{children}</div>
      {tabbar && <TabBar />}
    </div>
  );
}
