interface DiseaseSearchProps {
  search: string
  onSearchChange: (value: string) => void
}

export default function DiseaseSearch({ search, onSearchChange }: DiseaseSearchProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search diseases..."
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>
  )
}