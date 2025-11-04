import { Checkbox } from "@radix-ui/react-checkbox";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface Props {
  selectedVariable: string[];
  variables: string[];
  onVariableChange: (variable: string[]) => void;
  placeHolder: React.ReactNode;
}
export const handleCheckboxChange = (
  value: string,
  selected: string[],
  onChange: (values: string[]) => void
) => {
  if (selected.includes(value)) {
    onChange(selected.filter((item) => item !== value));
  } else {
    onChange([...selected, value]);
  }
};
export function SideBarCheckBoxParentComponent({
  selectedVariable,
  variables,
  onVariableChange,
  placeHolder,
}: Props) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center justify-between text-foreground">
        <span> {placeHolder} </span>
        {selectedVariable.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-chart-1/10 text-chart-1">
            {selectedVariable.length}
          </span>
        )}
      </Label>
      <ScrollArea className="h-20 border-2 rounded-lg p-2 bg-muted/50">
        <div className="space-y-2">
          {variables.map((variable) => (
            <div key={variable} className="flex items-center space-x-2 group">
              <Checkbox
                id={`subject-${variable}`}
                checked={selectedVariable.includes(variable)}
                onCheckedChange={() =>
                  handleCheckboxChange(
                    variable,
                    selectedVariable,
                    onVariableChange
                  )
                }
                className="data-[state=checked]:bg-chart-1 data-[state=checked]:border-chart-1"
              />
              <label
                htmlFor={`subject-${variable}`}
                className="text-sm cursor-pointer flex-1 group-hover:text-chart-1 transition-colors text-foreground"
              >
                {variable}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
