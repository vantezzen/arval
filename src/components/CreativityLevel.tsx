import {
  useCreativityStore,
  CreativityLevel as Creativity,
} from "@/lib/stores/creativityLevelStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CreativityLevel() {
  const store = useCreativityStore();

  return (
    <div className="fixed top-6 left-6">
      <Select
        value={String(store.creativityLevel)}
        onValueChange={(value) =>
          store.update({
            creativityLevel: (Number(value) as Creativity) || Creativity.STRICT,
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Kreativitäts-Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={String(Creativity.STRICT)}>
            Standartmodus
          </SelectItem>
          <SelectItem value={String(Creativity.WARN)}>Warnmodus</SelectItem>
          <SelectItem value={String(Creativity.PLAY)}>Spielmodus</SelectItem>
          <SelectItem value={String(Creativity.CREATIVE)}>
            Kreativmodus
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default CreativityLevel;
