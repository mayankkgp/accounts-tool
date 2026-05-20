import React, { useState, useEffect, useCallback } from "react";
import { searchEntities, updateEntity } from "../../services/entityService";
import EntityListToolbar from "./EntityListToolbar";
import EntityListRow from "./EntityListRow";

export default function EntityList({
  selectedEntityId,
  onSelectEntity,
  onAddNew,
  refreshTrigger,
  onRefresh,
}) {
  const [activeType, setActiveType] = useState("brand");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [entitiesList, setEntitiesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debouncing the search text (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetching data with isolation constraints based on type selection
  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await searchEntities({
        query: debouncedQuery,
        type: activeType,
        status: statusFilter,
      });
      setEntitiesList(results);

      // Auto-select the first item in list if nothing is selected or if previous selection is not in the list
      if (results.length > 0) {
        const alreadySelectedInList = results.some((r) => r.id === selectedEntityId);
        if (!selectedEntityId || !alreadySelectedInList) {
          onSelectEntity(results[0].id);
        }
      } else {
        onSelectEntity(null);
      }
    } catch (e) {
      console.error("Failed to load entity directory list", e);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, activeType, statusFilter, selectedEntityId, onSelectEntity]);

  // Refetch when dependencies shift
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities, refreshTrigger]);

  // Fast toggle archive action service handler
  const handleToggleArchive = async (entity) => {
    const isNowArchived = entity.status === "archived";
    const nextStatus = isNowArchived ? "active" : "archived";
    setIsLoading(true);
    try {
      await updateEntity(entity.id, { status: nextStatus });
      onRefresh(); // Notify container to trigger refetch
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full gap-1.5" id="entity-list-container">
      {/* Search and control filters */}
      <EntityListToolbar
        activeType={activeType}
        setActiveType={(type) => {
          setActiveType(type);
          onSelectEntity(null); // Clear selected item to trigger correct first-loader selection
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onAddNew={onAddNew}
      />

      {/* Grid Headers */}
      <div className="grid grid-cols-[1.5fr_1fr_1.1fr_10px] gap-1 px-1.5 py-0.5 border-b border-slate-300 text-[9px] uppercase tracking-wider font-semibold text-slate-400 select-none shrink-0 bg-slate-100">
        <span>Name</span>
        <span>POC / Contact</span>
        <span>GSTIN</span>
        <span className="text-center">St</span>
      </div>

      {/* Data Row list with compact loader spinner/skeleton lines */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto" id="entity-list-rows">
        {isLoading ? (
          // Renders ultra-compact loading rows with standard simulated structure
          <div className="flex flex-col select-none divide-y divide-slate-100" id="list-skeleton-loader">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-6 flex items-center px-1.5 bg-slate-50 animate-pulse">
                <div className="flex-1 grid grid-cols-[1.5fr_1fr_1.1fr_10px] gap-1 items-center">
                  <div className="h-2 bg-slate-200 rounded-sm w-4/5" />
                  <div className="h-2 bg-slate-200 rounded-sm w-3/4" />
                  <div className="h-1.5 bg-slate-200 rounded-sm font-mono w-2/3" />
                  <div className="h-1.5 bg-slate-200 rounded-full w-1.5 justify-self-center" />
                </div>
              </div>
            ))}
          </div>
        ) : entitiesList.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 select-none text-[10px]" id="empty-record-state">
            <span>No records found</span>
            <span className="text-[9px] text-slate-300 mt-0.5 font-mono">Isolated Type: {activeType}</span>
          </div>
        ) : (
          entitiesList.map((ent) => (
            <EntityListRow
              key={ent.id}
              entity={ent}
              isSelected={selectedEntityId === ent.id}
              onSelect={() => onSelectEntity(ent.id)}
              onToggleArchive={handleToggleArchive}
            />
          ))
        )}
      </div>

      {/* Quick overview of total counts */}
      <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 border-t border-slate-200 pt-1 px-1 flex justify-between shrink-0 select-none" id="list-footer-analytics">
        <span>Records: {entitiesList.length}</span>
        <span className="font-mono text-[8px]">scoped_entity_db</span>
      </div>
    </div>
  );
}
