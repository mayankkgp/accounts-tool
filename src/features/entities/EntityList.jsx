import React, { useState, useEffect, useCallback } from "react";
import { searchEntities } from "../../services/entityService";
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
  const [autoSelectFirst, setAutoSelectFirst] = useState(false);

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
    } catch (e) {
      console.error("Failed to load entity directory list", e);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, activeType, statusFilter]);

  // Refetch when dependencies shift
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities, refreshTrigger]);

  // Auto-select first element on type toggled retention
  useEffect(() => {
    if (autoSelectFirst && !isLoading) {
      if (entitiesList.length > 0) {
        onSelectEntity(entitiesList[0].id);
      } else {
        onSelectEntity(null);
      }
      setAutoSelectFirst(false);
    }
  }, [entitiesList, isLoading, autoSelectFirst, onSelectEntity]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full gap-1.5" id="entity-list-container">
      {/* Search and control filters */}
      <EntityListToolbar
        activeType={activeType}
        setActiveType={(type) => {
          setActiveType(type);
          if (selectedEntityId !== null) {
            setAutoSelectFirst(true);
          } else {
            onSelectEntity(null);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onAddNew={onAddNew}
        isCompressed={!!selectedEntityId}
      />

      {/* Grid Headers (Adapts to expanded/compressed split states with higher contrast) */}
      <div 
        className={`grid gap-1 px-1.5 py-0.5 border-b border-slate-300 text-[9px] uppercase tracking-wider font-semibold text-slate-500 select-none shrink-0 bg-slate-100 ${
          selectedEntityId ? "grid-cols-[1fr_16px]" : "grid-cols-[1.5fr_1fr_1.1fr_16px]"
        }`}
        id="entity-grid-header-row"
      >
        <span>Name</span>
        {!selectedEntityId && <span>POC / Contact</span>}
        {!selectedEntityId && <span>GSTIN</span>}
        <span></span>
      </div>

      {/* Data Row list with compact loader spinner/skeleton lines */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto" id="entity-list-rows">
        {isLoading ? (
          // Renders ultra-compact loading rows with standard simulated structure (Adapts dynamically)
          <div className="flex flex-col select-none divide-y divide-slate-100" id="list-skeleton-loader">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-6 flex items-center px-1.5 bg-slate-50 animate-pulse">
                <div 
                  className={`flex-1 grid gap-1 items-center ${
                    selectedEntityId ? "grid-cols-[1fr_16px]" : "grid-cols-[1.5fr_1fr_1.1fr_16px]"
                  }`}
                >
                  <div className="h-2 bg-slate-200 rounded-sm w-4/5" />
                  {!selectedEntityId && <div className="h-2 bg-slate-200 rounded-sm w-3/4" />}
                  {!selectedEntityId && <div className="h-1.5 bg-slate-200 rounded-sm font-mono w-2/3" />}
                  <div className="h-1.5 bg-slate-200 rounded-full w-1.5 justify-self-center shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : entitiesList.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 font-medium select-none text-[10px]" id="empty-record-state">
            <span>No records found</span>
            <span className="text-[9px] text-slate-500 font-medium mt-0.5 font-mono">Isolated Type: {activeType}</span>
          </div>
        ) : (
          entitiesList.map((ent) => (
            <EntityListRow
              key={ent.id}
              entity={ent}
              isSelected={selectedEntityId === ent.id}
              onSelect={() => onSelectEntity(ent.id)}
              isCompressed={!!selectedEntityId}
            />
          ))
        )}
      </div>

      {/* Quick overview of total counts with improved contrast */}
      <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 border-t border-slate-200 pt-1 px-1 flex justify-between shrink-0 select-none bg-slate-100/55" id="list-footer-analytics">
        <span>Records: {entitiesList.length}</span>
        <span className="font-mono text-[8px] text-slate-500">scoped_entity_db</span>
      </div>
    </div>
  );
}
