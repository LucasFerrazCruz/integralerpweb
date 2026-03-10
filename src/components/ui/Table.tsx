type TableProps = {
  children: React.ReactNode;
};

export default function Table({ children }: TableProps) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      {children}
    </table>
  );
}
