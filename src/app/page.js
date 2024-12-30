import { Navbar } from "../components/navbar/navbar";
import { Dashboard } from "../components/dashboard/dashboard";
import { Toaster } from "react-hot-toast";
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <Navbar />
      <Dashboard />
    </div>
  );
}
