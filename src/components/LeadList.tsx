import type { Lead } from "@/lib/leadDiscovery";
import { LeadCard } from "@/components/LeadCard";

export type LeadListProps = {
  leads: Lead[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onResearch: (lead: Lead) => Promise<void>;
  researchingIds: Set<string>;
};

export function LeadList({ leads, selectedIds, onToggleSelect, onResearch, researchingIds }: LeadListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          selected={selectedIds.has(lead.id)}
          onToggleSelect={onToggleSelect}
          onResearch={onResearch}
          researching={researchingIds.has(lead.id)}
        />
      ))}
    </div>
  );
}
