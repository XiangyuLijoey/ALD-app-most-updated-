"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getName, getTauriVersion, getVersion } from "@tauri-apps/api/app";

export default function Navigation() {
  const [appVersion, setAppVersion] = useState<string>("");
  const [appName, setAppName] = useState<string>("");
  const [tauriVersion, setTauriVersion] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    // Retrieves app name, app version, and tauri version from Tauri API
    async function fetchAppInfo() {
      setAppVersion(await getVersion());
      setAppName(await getName());
      setTauriVersion(await getTauriVersion());
    }

    fetchAppInfo();
  }, []);

  return (
    <nav className="bg-gray-800 h-20 text-white grid grid-cols-4 fixed top-0 left-0 w-full z-10">
      <div id="logo" className="flex items-center pl-4 col-span-1">
        <img
          src="SunApertureOrange.png"
          className="object-contain h-10 mr-3"
          alt="Logo"
        />
        <h1 className="text-l font-bold">{appName}</h1>
      </div>
      <div id="link-container" className="border-l border-gray-300 flex items-center justify-start h-full w-full pr-4 col-span-3 gap-0">
        <Link href="/home-page" className={`flex items-center justify-center h-full pl-8 pr-8 p-2 cursor-pointer max-w-xs ${pathname === "/home-page" ? "bg-gray-700" : ""} hover:bg-gray-600`}>
          Image Configuration
        </Link>
        <Link href="/usability-page" className={`flex items-center justify-center h-full pl-8 pr-8  p-2 cursor-pointer max-w-xs ${pathname === "/usability-page" ? "bg-gray-700" : ""} hover:bg-gray-600`}>
          Usability Settings
        </Link>
      </div>
    </nav>
  );
}