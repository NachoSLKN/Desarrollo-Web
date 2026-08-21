import { Outlet } from "react-router";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";
import Notification from "../components/Notification";
export default function Layout() {
  const loadFromStorage = useAppStore((state) => state.loadFromStorage);
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />
      <main className="container mx-auto py-16 flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-900 py-6 text-center">
        <p className="text-white font-semibold">
          Cocktail — React + TypeScript | Desarrollado por Ignacio Liñán
        </p>
      </footer>
      <Modal />
      <Notification />
    </div>
  );
}
