export const Notification = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 bg-primary text-white px-8 py-4 rounded-lg z-[9999] font-semibold shadow-lg">
      {message}
    </div>
  );
};
