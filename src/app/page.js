import { Navbar } from "../components/navbar/navbar";
import { Dashboard } from "../components/dashboard/dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Dashboard />
    </div>
  );
}
