import React, { useState, useEffect } from "react";
import { loadEntityProfile } from "../../services/entityService";
import EntityDetailHeader from "./EntityDetailHeader";
import EntityDetailTabs from "./EntityDetailTabs";

export default function EntityDetailPane({ selectedEntityId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedEntityId) {
      setProfile(null);
      return;
    }

    let isMounted = true;
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const data = await loadEntityProfile(selectedEntityId);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load entity profile", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [selectedEntityId]);

  // Support closing the pane via Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!selectedEntityId) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" id="entity-detail-pane-wrapper">
      {isLoading ? (
        <div className="flex flex-col gap-2 p-1 py-1.5 animate-pulse w-full h-full select-none" id="detail-skeleton">
          {/* Skeleton Header */}
          <div className="h-8 bg-slate-205 rounded-sm w-full mb-1 shrink-0" />
          {/* Skeleton Tabs List */}
          <div className="h-6 bg-slate-105 rounded-sm w-full mb-1 shrink-0" />
          {/* Skeleton Content */}
          <div className="space-y-1.5 flex-1 overflow-hidden">
            <div className="h-4 bg-slate-100 rounded-sm w-full" />
            <div className="h-4 bg-slate-100 rounded-sm w-5/6" />
            <div className="h-10 bg-slate-50/50 rounded-sm w-full mt-2" />
            <div className="h-4 bg-slate-100 rounded-sm w-2/3" />
            <div className="h-20 bg-slate-50/40 rounded-[2px] w-full mt-4" />
          </div>
        </div>
      ) : profile ? (
        <>
          <EntityDetailHeader profile={profile} onClose={onClose} />
          <EntityDetailTabs profile={profile} />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 text-xs font-mono select-none">
          Profile not found
        </div>
      )}
    </div>
  );
}
