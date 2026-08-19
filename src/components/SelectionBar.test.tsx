import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SelectionBar from "./SelectionBar";

function renderBar(
  props: Partial<React.ComponentProps<typeof SelectionBar>> = {},
) {
  const handlers = {
    onToggleSelectAll: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
  };
  render(
    <SelectionBar
      selectedCount={0}
      areAllSelected={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

const duplicateButton = () =>
  screen.getByRole("button", { name: "Dupliquer la sélection" });
const deleteButton = () =>
  screen.getByRole("button", { name: "Supprimer la sélection" });

describe("SelectionBar", () => {
  it("affiche le nombre d'éléments sélectionnés", () => {
    renderBar({ selectedCount: 3 });

    expect(screen.getByText(/3 elements selected/)).toBeInTheDocument();
  });

  // A deliberate choice: the actions remain visible but disabled rather than hidden,
  // so that the bar does not change size based on the selection
  it("désactive les actions quand rien n'est sélectionné", () => {
    renderBar({ selectedCount: 0 });

    expect(duplicateButton()).toBeDisabled();
    expect(deleteButton()).toBeDisabled();
  });

  it("active les actions dès qu'un élément est sélectionné", () => {
    renderBar({ selectedCount: 1 });

    expect(duplicateButton()).toBeEnabled();
    expect(deleteButton()).toBeEnabled();
  });

  it("déclenche la duplication et la suppression", async () => {
    const { onDuplicate, onDelete } = renderBar({ selectedCount: 2 });

    await userEvent.click(duplicateButton());
    expect(onDuplicate).toHaveBeenCalledTimes(1);

    await userEvent.click(deleteButton());
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("reflète et bascule l'état « tout sélectionner »", async () => {
    const { onToggleSelectAll } = renderBar({
      areAllSelected: true,
      selectedCount: 3,
    });

    const selectAll = screen.getByRole("checkbox");
    expect(selectAll).toBeChecked();

    await userEvent.click(selectAll);
    expect(onToggleSelectAll).toHaveBeenCalledTimes(1);
  });
});
