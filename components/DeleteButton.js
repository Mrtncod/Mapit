"use client";

export default function DeleteButton({ label = "Delete" }) {
  return (
    <button
      onClick={(e) => {
        if (!confirm("Delete this experience permanently?")) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
