'use client';
export function DeleteButton() {
  return (
    <button
      className="danger"
      type="submit"
      onClick={(e) => {
        if (
          !window.confirm(
            'Delete this item permanently? This cannot be undone.',
          )
        )
          e.preventDefault();
      }}
    >
      Delete
    </button>
  );
}
