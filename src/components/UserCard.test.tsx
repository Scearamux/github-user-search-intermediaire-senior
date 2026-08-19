import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UserCard from "./UserCard";
import type { GithubUser } from "../types/github";

const user: GithubUser = {
  id: 1024025,
  login: "torvalds",
  avatar_url: "https://avatars.githubusercontent.com/u/1024025",
  html_url: "https://github.com/torvalds",
};

function renderCard(
  props: Partial<React.ComponentProps<typeof UserCard>> = {},
) {
  const onToggleSelect = vi.fn();
  render(
    <UserCard
      user={user}
      isSelected={false}
      isEditMode={true}
      onToggleSelect={onToggleSelect}
      {...props}
    />,
  );
  return { onToggleSelect };
}

describe("UserCard", () => {
  it("affiche l'id, le login et l'avatar", () => {
    renderCard();

    expect(screen.getByText("1024025")).toBeInTheDocument();
    expect(screen.getByText("torvalds")).toBeInTheDocument();
    expect(screen.getByAltText("Avatar de torvalds")).toHaveAttribute(
      "src",
      user.avatar_url,
    );
  });

  it("ouvre le profil dans un nouvel onglet de façon sûre", () => {
    renderCard();

    const link = screen.getByRole("link", { name: "View profile" });
    expect(link).toHaveAttribute("href", user.html_url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("n'affiche pas de checkbox hors du mode édition", () => {
    renderCard({ isEditMode: false });

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("affiche une checkbox reflétant la sélection en mode édition", () => {
    renderCard({ isSelected: true });

    expect(screen.getByRole("checkbox", { name: /torvalds/ })).toBeChecked();
  });

  it("remonte l'id de l'utilisateur au clic sur la checkbox", async () => {
    const { onToggleSelect } = renderCard();

    await userEvent.click(screen.getByRole("checkbox"));

    expect(onToggleSelect).toHaveBeenCalledWith(user.id);
  });

  // Duplicates are assigned a floating ID (Date.now() + Math.random()) to prevent collisions
  // the display rounds it to ensure readability
  it("arrondit l'id fabriqué d'un doublon", () => {
    renderCard({ user: { ...user, id: 1758300000000.5 } });

    expect(screen.getByText("1758300000000")).toBeInTheDocument();
  });
});
