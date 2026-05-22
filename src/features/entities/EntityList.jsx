import React, { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
  const [sortDir, setSortDir] = useState("default");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities, refreshTrigger]);

  useEffect(() => {
    if (autoSelectFirst && !isLoading) {
      onSelectEntity(entitiesList.length > 0 ? entitiesList[0].id : null);
      setAutoSelectFirst(false);
    }
  }, [entitiesList, isLoading, autoSelectFirst, onSelectEntity]);

  const toggleSort = () => setSortDir((p) => p === "default" ? "asc" : p === "asc" ? "desc" : "default");

  const sortedEntities = sortDir === "default" ? entitiesList : [...entitiesList].sort((a, b) => 
    (sortDir === "asc" ? 1 : -1) * (a.businessName || "").localeCompare(b.businessName || "")
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full gap-1.5" id="entity-list-container">
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

      <div 
        className={`grid gap-1 px-1.5 py-0.5 border-b border-slate-300 text-[9px] uppercase tracking-wider font-semibold text-slate-500 select-none shrink-0 bg-slate-100 ${
          selectedEntityId ? "grid-cols-[1fr_16px]" : "grid-cols-[1.5fr_1fr_1.1fr_16px]"
        }`}
        id="entity-grid-header-row"
      >
        <button
          type="button"
          onClick={toggleSort}
          className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer text-slate-500 text-left font-semibold outline-none border-none p-0 bg-transparent self-center text-[9px] uppercase tracking-wider"
          id="name-header-sort-btn"
        >
          <span>Name</span>
          {sortDir === "default" && <ArrowUpDown size={10} className="opacity-40" />}
          {sortDir === "asc" && <ArrowUp size={10} className="text-indigo-600 font-bold" />}
          {sortDir === "desc" && <ArrowDown size={10} className="text-indigo-600 font-bold" />}
        </button>
        {!selectedEntityId && <span>POC / Contact</span>}
        {!selectedEntityId && <span>GSTIN</span>}
        <span></span>
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto" id="entity-list-rows">
        {isLoading ? (
          <div className="flex flex-col select-none divide-y divide-slate-100" id="list-skeleton-loader">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-6 flex items-center px-1.5 bg-slate-50 animate-pulse">
                <div className={`flex-1 grid gap-1 items-center ${selectedEntityId ? "grid-cols-[1fr_16px]" : "grid-cols-[1.5fr_1fr_1.1fr_16px]"}`}>
                  <div className="h-2 bg-slate-200 rounded-sm w-4/5" />
                  {!selectedEntityId && <div className="h-2 bg-slate-200 rounded-sm w-3/4" />}
                  {!selectedEntityId && <div className="h-1.5 bg-slate-200 rounded-sm w-2/3" />}
                  <div className="h-1.5 bg-slate-200 rounded-full w-1.5 justify-self-center shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedEntities.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 font-medium select-none text-[10px]" id="empty-record-state">
            <span>No records found</span>
            <span className="text-[9px] text-slate-500 font-medium mt-0.5 font-mono">Isolated Type: {activeType}</span>
          </div>
        ) : (
          sortedEntities.map((ent) => (
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

      <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 border-t border-slate-200 pt-1 px-1 flex justify-between shrink-0 select-none bg-slate-100/55" id="list-footer-analytics">
        <span>Records: {sortedEntities.length}</span>
        <span className="font-mono text-[8px] text-slate-500">scoped_entity_db</span>
      </div>
    </div>
  );
}
